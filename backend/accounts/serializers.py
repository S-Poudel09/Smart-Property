from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)

    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "kyc_status", "identity_document", "document_type", "is_2fa_enabled", "is_verified")


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

    def create(self, validated_data):
        # Use .get() or provided keys safely to satisfy static analysis
        email = validated_data.get('email')
        password = validated_data.get('password')
        # DRF maps 'name' to 'full_name' in validated_data because of source='full_name'
        full_name = validated_data.get('full_name', '')
        role = validated_data.get('role', 'buyer')

        user = User.objects.create_user(
            username=email, # email is the username
            email=email,
            password=password,
            full_name=full_name,
            role=role
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        user = authenticate(username=data['email'], password=data['password'])

        if not user:
            raise serializers.ValidationError({"detail": "Incorrect credentials"})

        if not getattr(user, 'is_verified', False):
            raise serializers.ValidationError({"detail": "Please verify your email before logging in."})

        refresh = RefreshToken.for_user(user)
        refresh['name'] = getattr(user, 'full_name', '')
        refresh['email'] = getattr(user, 'email', '')
        refresh['role'] = getattr(user, 'role', 'buyer')

        user_serializer = UserSerializer(instance=user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user_serializer.data
        }


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, data):
        # Additional validation could be added here
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)


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

class AdminKYCVerifySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[('verified', 'Verified'), ('rejected', 'Rejected')])
    reason = serializers.CharField(required=False, allow_blank=True)