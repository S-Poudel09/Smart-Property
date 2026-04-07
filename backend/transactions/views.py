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

    @action(detail=True, methods=['post'], url_path='khalti-verify')
    def khalti_verify(self, request, pk=None):
        transaction = self.get_object()
        token = request.data.get('token')
        amount = request.data.get('amount') # in paisa for Khalti

        if not token or not amount:
            return Response({"error": "Token and amount required"}, status=status.HTTP_400_BAD_REQUEST)

        # Standard Khalti verification:
        # POST to https://khalti.com/api/v2/payment/verify/
        # Headers: Authorization: Key <SECRET_KEY>
        # Body: { "token": "...", "amount": ... }

        try:
            url = settings.KHALTI_BASE_URL + "payment/verify/"
            headers = {
                'Authorization': f'Key {settings.KHALTI_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            data = json.dumps({
                'token': token,
                'amount': int(amount)
            }).encode('utf-8')

            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())
                
                # Khalti returns 200 on successful verification
                # Check for specific attributes if needed
                if res_data.get('idx'):
                    # Verification succeeded
                    transaction.status = "COMPLETED"
                    transaction.amount_paid = transaction.total_amount # Or use amount from Khalti
                    transaction.transaction_reference_id = res_data.get('idx')
                    transaction.payment_method = "Khalti"
                    transaction.save()

                    # PostgreSQL activity log
                    from analytics.utils import log_activity
                    log_activity(
                        request.user.email, 
                        'khalti_payment_verified', 
                        details={'transaction_id': str(transaction.id), 'khalti_idx': res_data.get('idx')}, 
                        status='success'
                    )

                    return Response({
                        "message": "Payment verified successfully",
                        "data": res_data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Khalti verification failed"}, status=status.HTTP_400_BAD_REQUEST)

        except urllib.error.HTTPError as e:
            res_err = e.read().decode()
            logger.error(f"Khalti API Error: {res_err}")
            return Response({"error": "Khalti API error", "details": res_err}, status=e.code)
        except Exception as e:
            logger.error(f"Internal Error during Khalti verify: {str(e)}")
            return Response({"error": "Internal verification error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
