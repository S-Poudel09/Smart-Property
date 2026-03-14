import uuid
from django.db import models
from django.conf import settings
from loans.models import Loan

class Transaction(models.Model):
    # TransactionID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # UserID
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    
    # LoanID
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='transactions', blank=True, null=True)
    
    # Amount
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # PaymentMethod
    payment_method = models.CharField(max_length=50, default="Bank Transfer")
    
    # PaymentDate
    payment_date = models.DateTimeField(auto_now_add=True)
    
    # Status
    # PENDING | COMPLETED | FAILED | REFUNDED
    status = models.CharField(
        max_length=20, 
        default="PENDING",
        choices=[
            ("PENDING", "Pending"),
            ("COMPLETED", "Completed"),
            ("FAILED", "Failed"),
            ("REFUNDED", "Refunded")
        ]
    )
    
    # Additional fields maintained for internal logic
    payment_proof_url = models.CharField(max_length=255, blank=True, null=True)
    property = models.ForeignKey('properties.Property', on_delete=models.SET_NULL, null=True, related_name='transactions')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transaction {self.id} for {self.user.email}"
