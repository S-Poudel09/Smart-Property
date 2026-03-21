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
def generate_and_send_otp(user):
    # delete old OTPs
    OTP.objects.filter(user=user).delete()

    otp_code = str(random.randint(100000, 999999))
    expires_at = timezone.now() + timedelta(minutes=10)

    OTP.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at
    )

    print("DEBUG OTP:", otp_code)

    try:
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
        return sent > 0
    except Exception as e:
        print(f"Error sending OTP to {user.email}: {e}")
        return False

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp_sent = generate_and_send_otp(user)

            if not otp_sent:
                # Optionally delete the user if email is mandatory for reg
                # user.delete() 
                return Response(
                    {"error": "Imperial Herald failed to dispatch OTP. Please verify your email address or try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # MongoDB activity log
            try:
                from config.mongo_utils import log_activity
                log_activity(user.email, 'register', details={'role': user.role}, status='success')
            except Exception:
                pass

            # Welcome email
            try:
                send_mail(
                    subject="Welcome to SmartProperty! | स्मार्ट प्रोपर्टीमा स्वागत छ!",
                    message=f"Hi {user.full_name},\n\nThank you for joining SmartProperty. Your account has been created with the role: {user.role}.\n\nPlease verify your email to get started.\n\nनमस्ते {user.full_name},\nस्मार्ट प्रोपर्टीमा जोडिनुभएकोमा धन्यवाद। तपाईंको खाता '{user.role}' भूमिकाका साथ सफलतापूर्वक सिर्जना गरिएको छ।\n\nकृपया सुरु गर्नको लागि आफ्नो इमेल प्रमाणीकरण गर्नुहोस्।\n\n— SmartProperty Team",
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

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']

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
            
            # MongoDB activity log
            try:
                from config.mongo_utils import log_activity
                log_activity(user.email, 'verify_email', details={'method': 'otp'}, status='success')
            except Exception:
                pass

            # Delete verified OTP
            otp_obj.delete()

            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            
        otp_sent = generate_and_send_otp(user)
        if otp_sent:
            return Response({"message": "A new Imperial Seal has been dispatched to your email."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "The Herald failed to dispatch the seal. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # MongoDB activity log
            try:
                from config.mongo_utils import log_activity
                email = request.data.get('email', '')
                log_activity(email, 'login', ip_address=request.META.get('REMOTE_ADDR', ''))
            except Exception:
                pass
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin-only management of system users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


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
            
            # MongoDB activity log
            try:
                from config.mongo_utils import log_activity
                action = 'verify_kyc' if kyc_status == 'verified' else 'reject_kyc'
                log_activity(request.user.email, action, details={'target_user': user.email}, status='success')
            except Exception:
                pass

            return Response({"message": f"User KYC status updated to {kyc_status}."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
