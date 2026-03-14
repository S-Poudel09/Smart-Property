import uuid
from django.db import models
from django.conf import settings
from properties.models import Property

class Loan(models.Model):
    # LoanID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # UserID
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    
    # PropertyID
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='loans')
    
    # LoanAmount
    loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # InterestRate
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2) # e.g., 5.50 for 5.5%
    
    # LoanStatus
    # SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED
    status = models.CharField(
        max_length=20,
        default="SUBMITTED",
        choices=[
            ("SUBMITTED", "Submitted"),
            ("UNDER_REVIEW", "Under Review"),
            ("APPROVED", "Approved"),
            ("REJECTED", "Rejected")
        ]
    )
    
    # ApplicationDate
    application_date = models.DateTimeField(auto_now_add=True)
    
    # ApprovalDate
    approval_date = models.DateTimeField(blank=True, null=True)
    
    # Additional fields maintained for internal logic
    message = models.TextField(blank=True, null=True)
    income = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    employment_status = models.CharField(max_length=100, blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Loan {self.id} for {self.user.email}"
