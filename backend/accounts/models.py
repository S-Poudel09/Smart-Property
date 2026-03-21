from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):

    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )

    KYC_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('not_submitted', 'Not Submitted'),
    )

    DOCUMENT_TYPE_CHOICES = (
        ('nid', 'National ID'),
        ('passport', 'Passport'),
        ('license', 'Driver License'),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_verified = models.BooleanField(default=False)
    
    # KYC Fields
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='not_submitted')
    identity_document = models.FileField(upload_to='kyc_documents/', null=True, blank=True)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, null=True, blank=True)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Security Fields
    is_2fa_enabled = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    
    # Financial/Demographic (from datasets)
    current_age = models.IntegerField(null=True, blank=True)
    yearly_income = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    credit_score = models.IntegerField(null=True, blank=True)
    total_debt = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    csv_id = models.IntegerField(null=True, blank=True, unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="accounts_users",
        blank=True,
    )

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="accounts_users_permissions",
        blank=True,
    )

    def __str__(self):
        return self.email


class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.user.email} - {self.otp_code}"