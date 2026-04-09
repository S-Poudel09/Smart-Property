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
            
            # Update property status to SOLD and notify seller if payment is fully verified
            if transaction.status == "COMPLETED":
                property_obj = transaction.property
                property_obj.status = 'SOLD'
                property_obj.save()
                
                # Notify notification engine
                try:
                    from notifications.models import Notification
                    Notification.objects.create(
                        user=transaction.seller,
                        type='transaction_update',
                        title='Property Sold!',
                        message=f'Great news! Your property "{property_obj.title}" has been successfully sold to {request.user.full_name}.',
                        link=f'/dashboard/seller/transactions/{transaction.id}'
                    )
                except Exception:
                    pass
        
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

        # Update property status to SOLD
        try:
            property_obj = transaction.property
            property_obj.status = 'SOLD'
            property_obj.save()
            
            from notifications.models import Notification
            Notification.objects.create(
                user=transaction.seller,
                type='transaction_update',
                title='System Settlement Confirmed',
                message=f'The administrator has manually confirmed the settlement for your property "{property_obj.title}". Status updated to SOLD.',
                link=f'/dashboard/seller/transactions/{transaction.id}'
            )
        except Exception:
            pass

        return Response({"status": "Transaction confirmed"})

    @action(detail=True, methods=['post'], url_path='khalti-initiate')
    def khalti_initiate(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({"error": "Platform Authentication Required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            transaction = self.get_object()
            return_url = request.data.get('return_url')
            website_url = request.data.get('website_url', 'http://localhost:3000')

            if not return_url:
                return Response({"error": "return_url is required"}, status=status.HTTP_400_BAD_REQUEST)

            # KPG-2 Initiate
            base_url = getattr(settings, 'KHALTI_BASE_URL', 'https://a.khalti.com/api/v2/')
            base_url = base_url.rstrip('/')
            initiate_url = f"{base_url}/epayment/initiate/"

            # FIX: Khalti requires capitalized 'Key' in Authorization header
            secret_key = settings.KHALTI_SECRET_KEY.strip()
            headers = {
                'Authorization': f"Key {secret_key}",
                'Content-Type': 'application/json'
            }

            # Amount in Paisa — Khalti minimum is 10 paisa
            real_paisa_amount = int(float(transaction.total_amount) * 100)
            paisa_amount = real_paisa_amount
            
            # Detect environment
            is_test_env = 'test-pay' in initiate_url or 'a.khalti.com' in initiate_url
            is_demo_adjustment = False

            # SANDBOX STRATEGY: Khalti Test environment rejects amounts > Rs 1000 (100,000 paisa).
            # To prevent 'HTTP 400' rejection while on sandbox, we apply a professional demo fee.
            if is_test_env and paisa_amount > 100000:
                logger.info(f"[Sandbox] High valuation (Rs {paisa_amount/100.0}) detected in test mode. Adjusting to demo fee (Rs 100.00).")
                paisa_amount = 10000 
                is_demo_adjustment = True

            if paisa_amount < 10:
                return Response(
                    {"error": f"Payment amount too low. Minimum is NPR 0.10. Got {paisa_amount} paisa."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Fetch user phone safely or use standard sandbox bypass number
            user_phone = getattr(request.user, 'phone', "9800000000")
            
            # Build customer name (fallback to email prefix if blank)
            customer_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email.split('@')[0]

            payload = {
                "return_url": return_url,
                "website_url": website_url,
                "amount": paisa_amount,
                "purchase_order_id": str(transaction.id),
                "purchase_order_name": f"Property Acquisition: {transaction.property.title[:80]}",
                "customer_info": {
                    "name": customer_name,
                    "email": request.user.email,
                    "phone": str(user_phone)
                }
            }

            logger.info(f"Khalti Initiate → Env: {'Sandbox' if is_test_env else 'Live'} | Adjusted: {is_demo_adjustment} | Amount: {paisa_amount}")

            req = urllib.request.Request(
                initiate_url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers
            )
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())

                if res_data.get('pidx'):
                    transaction.transaction_reference_id = res_data.get('pidx')
                    transaction.save()

                    return Response({
                        "pidx": res_data.get('pidx'),
                        "payment_url": res_data.get('payment_url'),
                        "applied_amount": paisa_amount / 100.0,
                        "original_amount": float(transaction.total_amount),
                        "is_sandbox": is_test_env,
                        "is_demo_adjustment": is_demo_adjustment
                    }, status=status.HTTP_200_OK)
                else:
                    logger.error(f"Khalti returned no pidx: {res_data}")
                    return Response({
                        "error": "Khalti did not return a payment URL.",
                        "details": res_data
                    }, status=status.HTTP_400_BAD_REQUEST)

        except urllib.error.HTTPError as e:
            try:
                res_err_raw = e.read().decode()
                res_err = json.loads(res_err_raw)
            except Exception:
                res_err = res_err_raw if 'res_err_raw' in dir() else str(e)
            logger.error(f"Khalti Initiate HTTP {e.code} Error: {res_err}")
            return Response({
                "error": f"Khalti API rejected the request (HTTP {e.code}).",
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
            base_url = getattr(settings, 'KHALTI_BASE_URL', 'https://a.khalti.com/api/v2/')
            base_url = base_url.rstrip('/')
            lookup_url = f"{base_url}/epayment/lookup/"

            secret_key = settings.KHALTI_SECRET_KEY.strip()
            headers = {
                'Authorization': f'Key {secret_key}',
                'Content-Type': 'application/json'
            }
            payload = {"pidx": pidx}

            logger.info(f"Khalti Lookup → pidx: {pidx} | transaction: {transaction.id}")

            req = urllib.request.Request(
                lookup_url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers
            )
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())

            khalti_status = res_data.get('status', '')
            logger.info(f"Khalti Lookup result — status: {khalti_status} | pidx: {pidx}")

            # ── Handle each Khalti status ──────────────────────────────────────
            if khalti_status == 'Completed':
                from django.db import transaction as db_tx
                with db_tx.atomic():
                    transaction.status = 'COMPLETED'
                    transaction.amount_paid = transaction.total_amount
                    transaction.payment_method = 'Khalti'
                    transaction.transaction_reference_id = pidx
                    transaction.save()

                    # Update property status to SOLD
                    property_obj = transaction.property
                    property_obj.status = 'SOLD'
                    property_obj.save()

                    # Auto-create a verified PaymentProof so sellers see it immediately
                    PaymentProof.objects.get_or_create(
                        transaction=transaction,
                        notes=f'Khalti pidx: {pidx}',
                        defaults={
                            'amount': transaction.total_amount,
                            'is_verified': True,
                            'verified_by': request.user,
                            'verified_at': timezone.now(),
                            'proof_file': '',  # no file for digital payments
                        }
                    )
                    
                    # Notify seller
                    try:
                        from notifications.models import Notification
                        Notification.objects.create(
                            user=transaction.seller,
                            type='transaction_update',
                            title='Property Procured via Khalti',
                            message=f'Your property "{property_obj.title}" has been successfully purchased by {request.user.full_name} via Khalti.',
                            link=f'/dashboard/seller/transactions/{transaction.id}'
                        )
                    except Exception:
                        pass

                from analytics.utils import log_activity
                log_activity(
                    request.user.email,
                    'khalti_payment_completed',
                    details={'transaction_id': str(transaction.id), 'pidx': pidx},
                    status='success'
                )
                return Response({
                    'message': 'Payment completed and verified successfully.',
                    'pidx': pidx,
                    'data': res_data
                }, status=status.HTTP_200_OK)

            elif khalti_status == 'Pending':
                return Response({
                    'error': 'Payment is still pending. Please wait and try again.',
                    'status': khalti_status,
                    'details': res_data
                }, status=status.HTTP_202_ACCEPTED)

            elif khalti_status in ('Canceled', 'Failed', 'Expired'):
                transaction.status = 'FAILED'
                transaction.save()
                return Response({
                    'error': f'Payment {khalti_status.lower()} on Khalti.',
                    'status': khalti_status,
                    'details': res_data
                }, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response({
                    'error': f'Unexpected Khalti status: {khalti_status}',
                    'details': res_data
                }, status=status.HTTP_400_BAD_REQUEST)

        except urllib.error.HTTPError as e:
            try:
                res_err = json.loads(e.read().decode())
            except Exception:
                res_err = str(e)
            logger.error(f"Khalti Verify HTTP {e.code}: {res_err}")
            return Response(
                {'error': f'Khalti API error (HTTP {e.code})', 'details': res_err},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Internal Error during Khalti verify: {str(e)}")
            return Response(
                {'error': f'Internal verification error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
