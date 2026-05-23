"""
Serializers for the accounts module.

This file contains Django REST Framework serializers responsible for
validating input data, transforming model instances into API-friendly
representations, and encapsulating business rules for authentication,
registration, KYC submission, OTP verification, and password reset flows.

Key responsibilities:
- User profile serialization
- User registration validation and creation
- Login credential validation
- OTP verification input handling
- Password reset request and confirmation
- KYC submission and admin verification workflows
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

# Retrieves the currently active custom user model configured for the project.
User = get_user_model()

# Lightweight serializer used to expose essential user profile information to the frontend.
class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)

    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "kyc_status", "identity_document", "document_type", "is_2fa_enabled", "is_verified")

# Used by admin to create new users with any role, including admin.
# Properly hashes the password and marks the account as verified.
class AdminCreateUserSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['buyer', 'seller', 'admin'])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=validated_data['role'],
        )
        # Admin-created accounts are pre-verified
        user.is_verified = True
        user.save(update_fields=['is_verified'])
        return user

# Handles public user registration with validation rules for email uniqueness,
# role restrictions, and user creation.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(source='full_name')

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'role', 'username')
        extra_kwargs = {
            'username': {'required': False},
            'password': {'write_only': True}
        }

# Ensures that the provided email address is unique before creating a new account.
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            print(f"[AUTH DEBUG] Registration Blocked: Email {value} already exists.")
            raise serializers.ValidationError("An account with this email already exists.")
        return value

# Restricts public registration to allowed non-admin roles only.
    def validate_role(self, value):
        if value.lower() == 'admin':
            raise serializers.ValidationError("Admin accounts cannot be created through public registration.")
        if value.lower() not in ['buyer', 'seller']:
            raise serializers.ValidationError("Invalid role selected.")
        return value.lower()

# Creates a new user using email as the primary login identifier and ensures
# consistent field mapping from serializer input to model fields.
    def create(self, validated_data):
        # DRF maps 'name' (input) to 'full_name' (output) because of source='full_name'
        # but in validated_data IT IS the source field name ('full_name')!
        email = validated_data.get('email')
        password = validated_data.get('password')
        full_name = validated_data.get('full_name', '')
        role = validated_data.get('role', 'buyer')

        print(f"[AUTH DEBUG] Creating user object: email={email}, role={role}")
        try:
            # We enforce username = email for consistency with AbstractUser behavior when USERNAME_FIELD is email
            user = User.objects.create_user(
                username=email, 
                email=email,
                password=password,
                full_name=full_name,
                role=role
            )
            print("[AUTH DEBUG] User created successfully in DB.")
            return user
        except Exception as e:
            print(f"[AUTH DEBUG] ERROR during create_user: {str(e)}")
            raise serializers.ValidationError({"error": f"Internal database error: {str(e)}"})

# Validates login credentials and enforces account verification rules before authentication.
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        email = data.get('email')
        
        # Diagnostic logging for development
        print(f"[AUTH DEBUG] Login attempt for email: {email}")
        
        user_exists = User.objects.filter(email=email).exists()
        if not user_exists:
            print(f"[AUTH DEBUG] Failed: User not found for {email}")
            raise serializers.ValidationError({"detail": "Incorrect credentials"})
            
        user = authenticate(username=email, password=data.get('password'))

        if not user:
            print(f"[AUTH DEBUG] Failed: Password mismatch for {email}")
            raise serializers.ValidationError({"detail": "Incorrect credentials"})

        # Bypass email verification block for admin users
        # Note: Admin accounts are forced into an MFA flow in LoginView.
        is_admin_account = user.is_superuser or getattr(user, 'role', '').lower() == 'admin'
        
        if not is_admin_account and not getattr(user, 'is_verified', False):
            print(f"[AUTH DEBUG] Failed: Unverified account for {email}")
            raise serializers.ValidationError({"detail": "Please verify your email before logging in."})

        print(f"[AUTH DEBUG] Final check before success: role={getattr(user, 'role', 'N/A')}")
        return {"user": user}

# Accepts and validates the input required for OTP-based verification.
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, data):
        # Additional validation could be added here
        return data

# Serializer for initiating password reset requests.
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

# Serializer for confirming password reset using token-based validation.
class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

# Handles KYC document submission and validates required KYC fields.
class KYCSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('identity_document', 'document_type')
    
    def validate(self, data):
        if not data.get('identity_document'):
            raise serializers.ValidationError("Identity document is required.")
        if not data.get('document_type'):
            raise serializers.ValidationError("Document type is required.")
        return data

# Used by administrators to approve or reject KYC submissions.
class AdminKYCVerifySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[('verified', 'Verified'), ('rejected', 'Rejected')])
    reason = serializers.CharField(required=False, allow_blank=True)