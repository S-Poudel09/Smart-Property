from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    """
    Transaction Management: Record and Retrieve.
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_permissions(self):
        # Allow buyers to create and view their own, admins see all
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = Transaction.objects.all()
        user = self.request.user
        if user.role == 'admin':
            return queryset
        return queryset.filter(user=user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        transaction = self.get_object()
        if request.user.role != 'admin' and (not transaction.property or transaction.property.owner != request.user):
            return Response({"error": "Only the property owner or admin can confirm payments"}, status=status.HTTP_403_FORBIDDEN)
        
        transaction.status = "COMPLETED"
        transaction.save()
        
        # If linked to a property, potentially mark as SOLD
        if transaction.property:
            transaction.property.status = "SOLD"
            transaction.property.save()
            
        return Response({"message": "Transaction confirmed and property marked as SOLD"})
