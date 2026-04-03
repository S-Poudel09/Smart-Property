from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserProfileView, UserManagementViewSet, 
    VerifyOTPView, PasswordResetRequestView, PasswordResetConfirmView,
    KYCUploadView, AdminKYCVerifyView, ResendOTPView,
    AdminLoginVerifyOTPView, AdminResendLoginOTPView, SendTestEmailView
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter(trailing_slash=True)
router.register(r'admin/users', UserManagementViewSet, basename='admin-users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin-login-verify/', AdminLoginVerifyOTPView.as_view(), name='admin_login_verify'),
    path('admin-login-resend/', AdminResendLoginOTPView.as_view(), name='admin_login_resend'),
    path('test-email/', SendTestEmailView.as_view(), name='send_test_email'),
    path('me/', UserProfileView.as_view(), name='me'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('kyc/upload/', KYCUploadView.as_view(), name='kyc-upload'),
    path('kyc/verify/<int:user_id>/', AdminKYCVerifyView.as_view(), name='admin-kyc-verify'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
] + router.urls
