"""
Admin configuration for the accounts module.

This file registers custom authentication-related models with the Django
administration panel and extends the default UserAdmin to expose project-
specific user attributes such as role, KYC status, verification state,
security settings, and financial metadata.

Registered models:
- User: Custom user model used across the Smart Property system.
- OTP: One-time password records used for email-based verification flows.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'role', 'kyc_status', 'is_verified', 'credit_score')
    list_filter = ('role', 'kyc_status', 'is_verified', 'is_2fa_enabled')
    fieldsets = UserAdmin.fieldsets + (
        ('KYC Info', {'fields': ('kyc_status', 'identity_document', 'document_type', 'kyc_verified_at')}),
        ('Security', {'fields': ('is_2fa_enabled', 'phone_number')}),
        ('Financial Data', {'fields': ('current_age', 'yearly_income', 'credit_score', 'total_debt', 'csv_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Personal Info', {'fields': ('full_name', 'role')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(OTP)
