import uuid
from django.db import models
from django.conf import settings
from loans.models import Loan

class Transaction(models.Model):
    # TransactionID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Buyer
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buying_transactions')
    
    # Seller
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='selling_transactions', null=True)
    
    # Property
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='transactions')
    
    # LoanID
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='transactions', blank=True, null=True)
    
    # Amounts
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # PaymentMethod
    payment_method = models.CharField(max_length=50, default="Bank Transfer")
    transaction_reference_id = models.CharField(max_length=100, blank=True, null=True, help_text="Khalti/Bank reference ID")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Status
    # PENDING | PARTIAL | COMPLETED | FAILED | REFUNDED
    status = models.CharField(
        max_length=20, 
        default="PENDING",
        choices=[
            ("PENDING", "Pending"),
            ("PARTIAL", "Partial Payment"),
            ("COMPLETED", "Completed"),
            ("FAILED", "Failed"),
            ("REFUNDED", "Refunded")
        ]
    )
    
    # Fraud Detection Fields (from transactions.csv)
    card_brand = models.CharField(max_length=50, blank=True, null=True)
    card_type = models.CharField(max_length=50, blank=True, null=True)
    card_on_dark_web = models.BooleanField(default=False)
    has_chip = models.BooleanField(default=True)

    def __str__(self):
        return f"Transaction {self.id} for {self.property.title}"

class PaymentProof(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='proofs')
    proof_file = models.FileField(upload_to='payment_proofs/')
    amount = models.DecimalField(max_digits=15, decimal_places=2) # Amount for this specific proof
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='verified_payments')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proof for {self.transaction.id} - ${self.amount}"
