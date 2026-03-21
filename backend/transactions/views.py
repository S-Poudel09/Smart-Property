from django.db import models
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Transaction, PaymentProof
from .serializers import TransactionSerializer, PaymentProofSerializer
from django.utils import timezone

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins see ALL transactions for oversight
        if user.role == 'admin':
            return Transaction.objects.all()
        # Users can see transactions where they are either buyer or seller
        return Transaction.objects.filter(models.Q(buyer=user) | models.Q(seller=user))

    def perform_create(self, serializer):
        transaction = serializer.save(buyer=self.request.user)
        # MongoDB activity log
        try:
            from config.mongo_utils import log_activity
            log_activity(self.request.user.email, 'create_transaction', details={'transaction_id': str(transaction.id)}, status='success')
        except Exception:
            pass

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
        
        if not amount or not proof_file:
            return Response({"error": "Amount and proof file are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        proof = PaymentProof.objects.create(
            transaction=transaction,
            proof_file=proof_file,
            amount=amount,
            notes=request.data.get('notes', '')
        )
        
        # MongoDB activity log
        try:
            from config.mongo_utils import log_activity
            log_activity(request.user.email, 'upload_proof', details={'transaction_id': str(transaction.id)}, status='success')
        except Exception:
            pass

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
        
        # MongoDB activity log
        try:
            from config.mongo_utils import log_activity
            log_activity(request.user.email, 'verify_proof', details={'transaction_id': str(transaction.id), 'proof_id': str(proof.id)}, status='success')
        except Exception:
            pass

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
