"""
API views for the accounts module.

This file implements the main authentication, verification, profile,
and administrative workflows for the Smart Property system.

Main features covered:
- User registration
- Email OTP generation and verification
- Login and admin login MFA flow
- OTP resend functionality
- User profile retrieval and update
- SMTP diagnostic email testing
- Admin user management
- Password reset request and confirmation
- KYC document upload and admin verification
- User statistics endpoints

The views are built using Django REST Framework APIView and ModelViewSet
classes, with role-based access control enforced through custom permissions.
"""

from rest_framework import status, viewsets, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import timedelta
import random
import logging

logger = logging.getLogger(__name__)

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, 
    VerifyOTPSerializer, PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer, KYCSubmissionSerializer,
    AdminKYCVerifySerializer
)
from .permissions import IsAdminUser
from .models import User, OTP

# def generate_and_send_otp(user):
#     otp_code = str(random.randint(100000, 999999))
#     expires_at = timezone.now() + timedelta(minutes=5)
#     OTP.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)
    
#     try:
#         send_mail(
#             subject="SmartProperty - Verify your Email",
#             message=f"Your OTP code is {otp_code}. It will expire in 5 minutes.",
#             from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
#             recipient_list=[user.email],
#             fail_silently=False,
#         )
#         print(f"OTP email sent successfully to {user.email}")
#     except Exception as e:
#         print(f"Error sending OTP email to {user.email}: {str(e)}")

# Generates a fresh OTP for the given user, stores it in the database,
# invalidates previous OTPs, and sends the code via email.
def generate_and_send_otp(user, reason="verification"):
    # delete old OTPs
    OTP.objects.filter(user=user).delete()

    otp_code = str(random.randint(100000, 999999))
    expires_at = timezone.now() + timedelta(minutes=10)

    OTP.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at
    )

    # Use check for DEBUG/DEVELOPMENT if legacy prints are needed, 
    # but the user requested real email only.
    # print(f"DEBUG OTP ({reason}):", otp_code)

    try:
        if reason == "admin_login":
            subject = "SmartProperty - Admin Login Alert | एडमिन लगइन सुरक्षा"
            message = (
                f"Security Alert: A login attempt for an Admin account has been detected.\n\n"
                f"Your Login OTP code is: {otp_code}\n"
                f"Expires in 10 minutes.\n\n"
                f"सुरक्षा चेतावनी: तपाइँको एडमिन खातामा लगइन प्रयास गरिएको छ।\n"
                f"तपाइँको लगइनको लागि OTP कोड {otp_code} हो।\n\n"
                f"— SmartProperty System Security"
            )
        else:
            subject = "SmartProperty - Verification Rite | इमेल प्रमाणीकरण"
            message = (
                f"Dear {user.full_name},\n\n"
                f"Your Imperial OTP for SmartProperty is: {otp_code}\n"
                f"Expires in 10 minutes.\n\n"
                f"नमस्ते {user.full_name},\n"
                f"स्मार्ट प्रोपर्टीका लागि तपाईंको OTP कोड {otp_code} हो।\n\n"
                f"— SmartProperty Team"
            )
        
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
        if sent > 0:
            return True, "Imperial Dispatch successful."
        else:
            return False, "Herald accepted the request but failed to deliver the message."
    except Exception as e:
        error_msg = str(e)
        if "535" in error_msg:
            return False, "Sovereign Authentication Failure: Incorrect credentials. Ensure you are using a GMAIL APP PASSWORD, not your standard account password."
        return False, f"Imperial Herald Dispatch Error: {error_msg}"

# Creates JWT refresh and access tokens for an authenticated user and
# attaches essential user metadata for frontend use.
def get_tokens_for_user(user):
    logger.info(f"Generating Imperial tokens for: {user.email}")
    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        refresh['name'] = getattr(user, 'full_name', '')
        refresh['email'] = getattr(user, 'email', '')
        refresh['role'] = getattr(user, 'role', 'buyer')
        
        user_data = UserSerializer(user).data
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data
        }
    except Exception as e:
        logger.error(f"CRITICAL ERROR in token generation for {user.email}: {e}")
        raise e

# Handles public account registration and triggers email verification.
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if not isinstance(user, User):
                return Response({"error": "Registration failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            otp_sent, otp_error = generate_and_send_otp(user)

            if not otp_sent:
                return Response(
                    {"error": f"MFA Dispatch Error: {otp_error}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # PostgreSQL activity log
            try:
                from analytics.utils import log_activity
                log_activity(user.email, 'register', details={'role': user.role}, status='success')
            except Exception:
                pass

            # Welcome email
            try:
                send_mail(
                    subject="Welcome to SmartProperty!",
                    message=f"Hi {user.full_name},\n\nThank you for joining. Your account role is: {user.role}.\n\nPlease verify your email to get started.",
                    from_email=None,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            return Response(
                {"message": "User registered successfully. Please verify your email.", "user": UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Confirms a user's email address by validating the submitted OTP code.
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            if not isinstance(validated_data, dict):
                return Response({"error": "Invalid format."}, status=status.HTTP_400_BAD_REQUEST)
                
            email = validated_data.get('email')
            otp_code = validated_data.get('otp_code')

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            # Get the most recent valid OTP for this user
            otp_obj = OTP.objects.filter(user=user, otp_code=otp_code).order_by('-created_at').first()

            if not otp_obj:
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_obj.is_expired():
                return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

            # Mark user verified
            user.is_verified = True
            user.save()
            
            # PostgreSQL activity log
            try:
                from analytics.utils import log_activity
                log_activity(user.email, 'verify_email', details={'method': 'otp'}, status='success')
            except Exception:
                pass

            # Delete verified OTP
            otp_obj.delete()

            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Resends a verification OTP to users whose accounts are not yet verified.
class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No petitioner found with this email."}, status=status.HTTP_404_NOT_FOUND)
            
        if user.is_verified:
            return Response({"message": "This lineage is already verified."}, status=status.HTTP_400_BAD_REQUEST)
            
        otp_sent, _ = generate_and_send_otp(user)
        if otp_sent:
            return Response({"message": "A new verification code has been dispatched."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Verification dispatch failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Authenticates users and applies a separate OTP-based MFA flow for admin accounts.
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            if not isinstance(validated_data, dict):
                return Response({"error": "Invalid login data format."}, status=status.HTTP_400_BAD_REQUEST)
                
            user = validated_data.get('user')
            if not isinstance(user, User):
                logger.error("[AUTH] Login successful but user object is missing or invalid.")
                return Response({"error": "Identity resolution failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            logger.info(f"[AUTH] Authenticated user: {user.email}")
            
            role = str(getattr(user, 'role', '')).lower()
            
            if role == 'admin' or user.is_superuser:
                logger.info(f"Admin MFA flow triggered for: {user.email}")
                otp_sent, otp_error = generate_and_send_otp(user, reason="admin_login")
                if not otp_sent:
                    return Response({"error": f"MFA Dispatch Error: {otp_error}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                return Response({
                    "requires_otp": True,
                    "email": user.email,
                    "message": "Enter code sent to your email to access administration hall."
                }, status=status.HTTP_200_OK)
            
            try:
                data = get_tokens_for_user(user)
                from analytics.utils import log_activity
                log_activity(user.email, 'login', ip_address=request.META.get('REMOTE_ADDR', ''))
                return Response(data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Login token error for {user.email}: {e}")
                return Response({"error": "Token generation failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Completes the second step of admin authentication by validating the login OTP.
class AdminLoginVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response({"error": "Email and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No account found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Get the most recent valid OTP for login
        otp_obj = OTP.objects.filter(user=user, otp_code=otp_code).order_by('-created_at').first()

        if not otp_obj:
            return Response({"error": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_obj.is_expired():
            return Response({"error": "Code has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        # Success: Give the admin their tokens
        data = get_tokens_for_user(user)
        
        # PostgreSQL activity log
        try:
            from analytics.utils import log_activity
            log_activity(email, 'admin_login_complete', ip_address=request.META.get('REMOTE_ADDR', ''))
        except Exception:
            pass
            
        # Delete verified OTP
        otp_obj.delete()

        return Response(data, status=status.HTTP_200_OK)

# Resends an admin login OTP when the original verification code expires or is not received.
class AdminResendLoginOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if not (user.role == 'admin' or user.is_superuser):
                 return Response({"error": "Invalid request for this account role."}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({"error": "No account found."}, status=status.HTTP_404_NOT_FOUND)
            
        otp_sent, otp_error = generate_and_send_otp(user, reason="admin_login")
        if otp_sent:
            return Response({"message": "A new verification code has been dispatched."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": f"MFA Herald Dispatch Error: {otp_error}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Allows authenticated users to retrieve and update their own profile data.
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        user.full_name = request.data.get('full_name', user.full_name)
        user.phone = request.data.get('phone', user.phone)
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

# Diagnostic endpoint used by administrators to verify SMTP/email configuration.
class SendTestEmailView(APIView):
    """
    Diagnostic view to verify SMTP settings are operational.
    Admin access only.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        test_recipient = request.data.get('email', request.user.email)
        try:
            sent = send_mail(
                subject="SmartProperty - SMTP Configuration Verification",
                message=(
                    f"Imperial Dispatch Check:\n\n"
                    f"This transmission confirms that your SMTP backend is operational.\n"
                    f"Sent successfully to: {test_recipient}\n\n"
                    f"— SmartProperty System Core"
                ),
                from_email=None,
                recipient_list=[test_recipient],
                fail_silently=False,
            )
            if sent > 0:
                return Response({
                    "message": f"Imperial Herald successfully dispatched the test message to {test_recipient}."
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Transmission failed. The system accepted the request but failed to deliver."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"Imperial Dispatch Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin-only CRUD interface for managing user records.
class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin-only management of system users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

# Initiates a password reset flow by generating a tokenized reset link and emailing it to the user.
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # To prevent email enumeration, return a success response even if user doesn't exist
                return Response({"message": "If an account with this email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)

            token = PasswordResetTokenGenerator().make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            
            # The frontend URL for password reset (adjust port if needed)
            reset_url = f"http://localhost:3000/auth/reset-password?uid={uidb64}&token={token}"
            
            try:
                sent = send_mail(
                    subject="SmartProperty - Password Reset | पासवर्ड पुन: प्राप्ति",
                    message=f"Click the link below to reset your password:\n\n{reset_url}\n\nThis link will expire soon.\n\nआफ्नो पासवर्ड रिसेट गर्नको लागि तलको लिङ्कमा क्लिक गर्नुहोस्:\n\n{reset_url}\n\nयो लिङ्क केही समयमा म्याद सकिनेछ।",
                    from_email=None,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                if sent > 0:
                    print(f"Password reset email sent to {user.email}")
                    return Response({"message": "If an account with this email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Failed to dispatch reset email. System treasury is currently offline."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                print(f"Error sending password reset email to {user.email}: {str(e)}")
                return Response({"error": f"Imperial Herald Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Completes the password reset process after validating the encoded user ID and token.
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uidb64 = serializer.validated_data['uidb64']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and PasswordResetTokenGenerator().check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Allows authenticated users to upload identity documents for KYC review.
class KYCUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def post(self, request):
        user = request.user
        if user.kyc_status == 'verified':
            return Response({"message": "KYC already verified."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCSubmissionSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(kyc_status='pending')
            return Response({"message": "KYC documents submitted successfully. Status is now pending."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Allows administrators to approve or reject submitted KYC records.
class AdminKYCVerifyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AdminKYCVerifySerializer(data=request.data)
        if serializer.is_valid():
            kyc_status = serializer.validated_data['status']
            user.kyc_status = kyc_status
            if kyc_status == 'verified':
                user.kyc_verified_at = timezone.now()
            user.save()
            
            # PostgreSQL activity log
            try:
                from analytics.utils import log_activity
                action = 'verify_kyc' if kyc_status == 'verified' else 'reject_kyc'
                log_activity(request.user.email, action, details={'target_user': user.email}, status='success')
            except Exception:
                pass

            return Response({"message": f"User KYC status updated to {kyc_status}."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Returns the total number of users in the system for admin dashboards or statistics.
class UserCountView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get(self, request):
        return Response({"count": User.objects.count()}, status=status.HTTP_200_OK)
