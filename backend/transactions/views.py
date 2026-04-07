from django.db import models
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Transaction, PaymentProof
from .serializers import TransactionSerializer, PaymentProofSerializer
from django.utils import timezone
from django.conf import settings
import urllib.request
import json
import logging

logger = logging.getLogger(__name__)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins see ALL transactions for oversight
        role = getattr(user, 'role', 'buyer')
        if role == 'admin' or user.is_staff:
            return Transaction.objects.all()
        # Users can see transactions where they are either buyer or seller
        return Transaction.objects.filter(Q(buyer=user) | Q(seller=user))

    def perform_create(self, serializer):
        transaction = serializer.save(buyer=self.request.user)
        # PostgreSQL activity log
        from analytics.utils import log_activity
        log_activity(
            self.request.user.email, 
            'create_transaction', 
            details={'transaction_id': str(transaction.id), 'property': transaction.property.title},
            status='success'
        )

    @action(detail=True, methods=['post'], url_path='upload-proof')
    def upload_proof(self, request, pk=None):
        try:
            transaction = self.get_object()
        except Exception:
            return Response({"error": "Transaction trace not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if transaction.buyer != request.user:
            return Response({"error": "Forbidden: Only buyers can upload proof"}, status=status.HTTP_403_FORBIDDEN)
        
        amount = request.data.get('amount')
        proof_file = request.FILES.get('proof_file')
        
        if amount is None or proof_file is None:
            return Response({"error": "Amount and proof file are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from decimal import Decimal
            amount = Decimal(str(amount))
        except (ValueError, TypeError, OverflowError):
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)
            
        proof = PaymentProof.objects.create(
            transaction=transaction,
            proof_file=proof_file,
            amount=amount,
            notes=request.data.get('notes', '')
        )
        
        # PostgreSQL activity log
        from analytics.utils import log_activity
        log_activity(
            request.user.email, 
            'upload_proof', 
            details={'transaction_id': str(transaction.id), 'amount': float(amount)}, 
            status='success'
        )

        return Response(PaymentProofSerializer(proof).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='verify-proof/(?P<proof_id>[^/.]+)')
    def verify_proof(self, request, pk=None, proof_id=None):
        try:
            transaction = self.get_object()
        except Exception:
            return Response({"error": "Transaction trace not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if transaction.seller != request.user and not request.user.is_staff:
            return Response({"error": "Forbidden: Only sellers or admins can verify proof"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            proof = PaymentProof.objects.get(id=proof_id, transaction=transaction)
        except PaymentProof.DoesNotExist:
            return Response({"error": "Proof not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if proof.is_verified:
            return Response({"error": "Already verified"}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.db import transaction as db_transaction
        with db_transaction.atomic():
            proof.is_verified = True
            proof.verified_at = timezone.now()
            proof.verified_by = request.user
            proof.save()
            
            # Update transaction amount paid
            transaction.amount_paid += proof.amount
            if transaction.amount_paid >= transaction.total_amount:
                transaction.status = "COMPLETED"
            else:
                transaction.status = "PARTIAL"
            transaction.save()
        
        # PostgreSQL activity log
        from analytics.utils import log_activity
        log_activity(
            request.user.email, 
            'verify_proof', 
            details={'transaction_id': str(transaction.id), 'proof_id': str(proof.id)}, 
            status='success'
        )

        return Response({"status": "Verified", "new_total_paid": transaction.amount_paid})

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        transaction = self.get_object()
        if transaction.seller != request.user and request.user.role != 'admin':
            return Response({"error": "Only sellers or admins can confirm"}, status=status.HTTP_403_FORBIDDEN)
        transaction.status = "COMPLETED"
        transaction.amount_paid = transaction.total_amount
        transaction.save()
        return Response({"status": "Transaction confirmed"})

    @action(detail=True, methods=['post'], url_path='khalti-initiate')
    def khalti_initiate(self, request, pk=None):
        # AUTH CHECK
        with open('/tmp/khalti_debug.log', 'a') as f:
            auth_header = request.headers.get('Authorization', 'MISSING')
            f.write(f"Inbound Auth Header: {auth_header[:20]}...\n")
            
        if not request.user.is_authenticated:
            return Response({"error": "Platform Authentication Required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            transaction = self.get_object()
            return_url = request.data.get('return_url')
            website_url = request.data.get('website_url', 'http://localhost:3000')

            if not return_url:
                return Response({"error": "return_url is required"}, status=status.HTTP_400_BAD_REQUEST)

            # KPG-2 Initiate
            base_url = getattr(settings, 'KHALTI_BASE_URL', 'https://dev.khalti.com/api/v2/')
            base_url = base_url.rstrip('/')
            initiate_url = f"{base_url}/epayment/initiate/"
            
            # DIAGNOSTIC LOGS to file
            with open('/tmp/khalti_debug.log', 'a') as f:
                f.write(f"\n[{timezone.now()}] KHALTI_INITIATE_DEBUG\n")
                f.write(f"URL: {initiate_url}\n")
                k_key = str(getattr(settings, 'KHALTI_SECRET_KEY', 'MISSING_KEY'))
                f.write(f"Key loaded: {k_key[:10]}.....{k_key[-5:]}\n")
                f.write(f"Transaction ID: {transaction.id}\n")

            headers = {
                'Authorization': f"Key {settings.KHALTI_SECRET_KEY.strip()}",
                'Content-Type': 'application/json'
            }
            
            # Amount in Paisa
            paisa_amount = int(float(transaction.total_amount) * 100)
            
            # Fetch user phone safely or use standard sandbox bypass number
            user_phone = getattr(request.user, 'phone', None)
            if not user_phone:
                user_phone = "9800000000"
                
            payload = {
                "return_url": return_url,
                "website_url": website_url,
                "amount": paisa_amount,
                "purchase_order_id": str(transaction.id),
                "purchase_order_name": f"Property Purchase: {transaction.property.title}",
                "customer_info": {
                    "name": f"{request.user.first_name} {request.user.last_name}",
                    "email": request.user.email,
                    "phone": str(user_phone)
                }
            }

            req = urllib.request.Request(initiate_url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())
                
                if res_data.get('pidx'):
                    # Save pidx to transaction for later lookup
                    transaction.transaction_reference_id = res_data.get('pidx')
                    transaction.save()
                    
                    return Response({
                        "pidx": res_data.get('pidx'),
                        "payment_url": res_data.get('payment_url')
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "error": "Unable to initiate Khalti sandbox payment. Please verify sandbox keys.",
                        "details": res_data
                    }, status=status.HTTP_400_BAD_REQUEST)

        except urllib.error.HTTPError as e:
            res_err = e.read().decode()
            logger.error(f"Khalti Initiate API Error: {res_err}")
            with open('/tmp/khalti_debug.log', 'a') as f:
                f.write(f"Khalti API Error Status: {e.code}\n")
                f.write(f"Khalti API Response Body: {res_err}\n")
            return Response({
                "error": "Unable to initiate Khalti sandbox payment. Please verify sandbox keys.",
                "details": res_err
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Internal Error during Khalti initiate: {str(e)}")
            return Response({"error": f"Internal initiation error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='khalti-verify')
    def khalti_verify(self, request, pk=None):
        try:
            transaction = self.get_object()
            pidx = request.data.get('pidx') or transaction.transaction_reference_id

            if not pidx:
                return Response({"error": "pidx required for lookup"}, status=status.HTTP_400_BAD_REQUEST)

            # KPG-2 Lookup
            base_url = getattr(settings, 'KHALTI_BASE_URL', 'https://dev.khalti.com/api/v2/')
            base_url = base_url.rstrip('/')
            lookup_url = f"{base_url}/epayment/lookup/"
            
            headers = {
                'Authorization': f'Key {settings.KHALTI_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            payload = {"pidx": pidx}

            req = urllib.request.Request(lookup_url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())
                
                # Khalti returns status 'Completed' if successful
                if res_data.get('status') == 'Completed':
                    transaction.status = "COMPLETED"
                    transaction.amount_paid = transaction.total_amount
                    transaction.payment_method = "Khalti"
                    transaction.save()

                    # PostgreSQL activity log
                    from analytics.utils import log_activity
                    log_activity(
                        request.user.email, 
                        'khalti_payment_completed', 
                        details={'transaction_id': str(transaction.id), 'pidx': pidx}, 
                        status='success'
                    )

                    return Response({
                        "message": "Payment completed successfully",
                        "data": res_data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "error": "Payment not completed", 
                        "status": res_data.get('status'),
                        "details": res_data
                    }, status=status.HTTP_400_BAD_REQUEST)

        except urllib.error.HTTPError as e:
            res_err = e.read().decode()
            logger.error(f"Khalti Verify API Error: {res_err}")
            return Response({"error": "Khalti API error", "details": res_err}, status=e.code)
        except Exception as e:
            logger.error(f"Internal Error during Khalti verify: {str(e)}")
            return Response({"error": "Internal verification error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
