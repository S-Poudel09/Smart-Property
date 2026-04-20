from unittest.mock import patch  # Used to mock functions and methods during testing, such as sending emails or generating OTPs

from django.contrib.auth import get_user_model
from django.urls import reverse  # Used to reverse URL names to actual paths for testing API endpoints
from rest_framework import status
from rest_framework.test import APITestCase  # Django REST Framework's test case for API testing
from accounts.models import OTP # OTP model for testing OTP flows
from django.contrib.auth.tokens import PasswordResetTokenGenerator  # generate reset token
from django.utils.http import urlsafe_base64_encode  # encode user id
from django.utils.encoding import force_bytes  # convert to bytes


User = get_user_model()


class RegisterViewTests(APITestCase):
    # Runs before each test
    def setUp(self):
        self.url = reverse("register")

    # Test successful registration with valid data
    @patch("accounts.views.generate_and_send_otp")
    @patch("accounts.views.send_mail")
    def test_register_user_success(self, mock_send_mail, mock_generate_and_send_otp):
        # Mock OTP and email sending
        mock_generate_and_send_otp.return_value = (True, "Imperial Dispatch successful.")
        mock_send_mail.return_value = 1

        # Valid registration data
        payload = {
            "email": "worknestpro1@gmail.com",
            "password": "StrongPass123",
            "name": "Buyer One",
            "role": "buyer",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check response status and body
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(
            response.data["message"],
            "User registered successfully. Please verify your email.",
        )

        # Check user created in database
        self.assertTrue(User.objects.filter(email="worknestpro1@gmail.com").exists())

        # Check saved user values
        user = User.objects.get(email="worknestpro1@gmail.com")
        self.assertEqual(user.full_name, "Buyer One")
        self.assertEqual(user.email, "worknestpro1@gmail.com")
        self.assertEqual(user.username, "worknestpro1@gmail.com")
        self.assertEqual(user.role, "buyer")
        self.assertFalse(user.is_verified)
        self.assertEqual(user.kyc_status, "not_submitted")

        # Check OTP function was called
        mock_generate_and_send_otp.assert_called_once_with(user)

    # Test duplicate email registration
    @patch("accounts.views.generate_and_send_otp")
    @patch("accounts.views.send_mail")
    def test_register_duplicate_email(self, mock_send_mail, mock_generate_and_send_otp):
        # Mock OTP and email sending
        mock_generate_and_send_otp.return_value = (True, "Imperial Dispatch successful.")
        mock_send_mail.return_value = 1

        # Create existing user first
        User.objects.create_user(
            username="worknestpro1@gmail.comm",
            email="worknestpro1@gmail.com",
            password="StrongPass123",
            full_name="Existing User",
            role="buyer",
        )

        # Try same email again
        payload = {
            "email": "worknestpro1@gmail.com",
            "password": "123456789",
            "name": "Duplicate User",
            "role": "buyer",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check duplicate email error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertEqual(User.objects.filter(email="worknestpro1@gmail.com").count(), 1)

    # Test missing required fields
    @patch("accounts.views.generate_and_send_otp")
    @patch("accounts.views.send_mail")
    def test_register_missing_required_fields(self, mock_send_mail, mock_generate_and_send_otp):
        # Mock OTP and email sending
        mock_generate_and_send_otp.return_value = (True, "Imperial Dispatch successful.")
        mock_send_mail.return_value = 1

        # Empty registration data
        payload = {
            "email": "",
            "password": "",
            "name": "",
            "role": "",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check validation errors
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertIn("password", response.data)
        self.assertIn("name", response.data)
        self.assertIn("role", response.data)

    # Test invalid role: admin not allowed in public registration
    @patch("accounts.views.generate_and_send_otp")
    @patch("accounts.views.send_mail")
    def test_register_invalid_role_admin_not_allowed(self, mock_send_mail, mock_generate_and_send_otp):
        # Mock OTP and email sending
        mock_generate_and_send_otp.return_value = (True, "Imperial Dispatch successful.")
        mock_send_mail.return_value = 1

        # Admin role should fail
        payload = {
            "email": "princess.satyanarayan108vision@gmail.com",
            "password": "123456789",
            "name": "Admin User",
            "role": "admin",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check role validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.data)
        self.assertFalse(User.objects.filter(email="princess.satyanarayan108vision@gmail.com").exists())

class LoginViewTests(APITestCase):
    # Runs before each test
    def setUp(self):
        self.url = reverse("login")

    # Test login with valid credentials for verified user
    @patch("accounts.views.get_tokens_for_user")
    def test_login_valid_verified_user(self, mock_get_tokens_for_user):
        # Create verified user
        user = User.objects.create_user(
            username="worknestpro1@gmail.com.com",
            email="worknestpro1@gmail.com.com",
            password="StrongPass123",
            full_name="Verified Buyer",
            role="buyer",
            is_verified=True,
        )

        # Mock token response
        mock_get_tokens_for_user.return_value = {
            "refresh": "mock_refresh_token",
            "access": "mock_access_token",
            "user": {
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
                "role": user.role,
                "kyc_status": user.kyc_status,
                "identity_document": None,
                "document_type": None,
                "is_2fa_enabled": user.is_2fa_enabled,
                "is_verified": user.is_verified,
            },
        }

        # Valid login payload
        payload = {
            "email": "worknestpro1@gmail.com.com",
            "password": "StrongPass123",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check successful login response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("refresh", response.data)
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "worknestpro1@gmail.com.com")

    # Test login with incorrect password
    def test_login_incorrect_password(self):
        # Create verified user
        User.objects.create_user(
            username="worknestpro1@gmail.com.com",
            email="worknestpro1@gmail.com.com",
            password="StrongPass123",
            full_name="Verified Buyer",
            role="buyer",
            is_verified=True,
        )

        # Invalid password payload
        payload = {
            "email": "worknestpro1@gmail.com.com",
            "password": "WrongPassword123",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check invalid credentials error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    # Test login with unverified account
    def test_login_unverified_account(self):
        # Create unverified user
        User.objects.create_user(
            username="unworknestpro1@gmail.com.com",
            email="unworknestpro1@gmail.com.com",
            password="StrongPass123",
            full_name="Unverified Buyer",
            role="buyer",
            is_verified=False,
        )

        # Valid credentials but account not verified
        payload = {
            "email": "unworknestpro1@gmail.com.com",
            "password": "StrongPass123",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check verification required error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
        self.assertIn("verify your email", str(response.data["detail"]))
        

    # Test admin login requiring OTP flow
    @patch("accounts.views.generate_and_send_otp")
    def test_admin_login_requires_otp(self, mock_generate_and_send_otp):
        # Mock OTP sending
        mock_generate_and_send_otp.return_value = (True, "Imperial Dispatch successful.")

        # Create verified admin user
        User.objects.create_user(
            username="princesspoudel38@gmail.com",
            email="princesspoudel38@gmail.com",
            password="StrongPass123",
            full_name="Admin User",
            role="admin",
            is_verified=True,
        )

        # Valid admin login payload
        payload = {
            "email": "princesspoudel38@gmail.com",
            "password": "StrongPass123",
        }

        # Send POST request
        response = self.client.post(self.url, payload, format="json")

        # Check OTP flow response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("requires_otp", response.data)
        self.assertTrue(response.data["requires_otp"])
        self.assertEqual(response.data["email"], "princesspoudel38@gmail.com")
        self.assertIn("message", response.data)


from django.utils import timezone
from datetime import timedelta


class VerifyOTPViewTests(APITestCase):
    # Runs before each test
    def setUp(self):
        self.verify_url = reverse("verify_otp")
        self.resend_url = reverse("resend_otp")

    # Test OTP verification with correct OTP
    def test_verify_otp_with_correct_code(self):
        # Create unverified user
        user = User.objects.create_user(
            username="otpuser@example.com",
            email="otpuser@example.com",
            password="StrongPass123",
            full_name="OTP User",
            role="buyer",
            is_verified=False,
        )

        # Create valid OTP
        OTP.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        payload = {
            "email": "otpuser@example.com",
            "otp_code": "123456"
        }

        # Send POST request
        response = self.client.post(self.verify_url, payload, format="json")

        # Check success response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

        # Refresh user and check verified status
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    # Test OTP verification with invalid OTP
    def test_verify_otp_with_invalid_code(self):
        # Create unverified user
        user = User.objects.create_user(
            username="otpuser@example.com",
            email="otpuser@example.com",
            password="StrongPass123",
            full_name="OTP User",
            role="buyer",
            is_verified=False,
        )

        # Create valid OTP
        OTP.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        payload = {
            "email": "otpuser@example.com",
            "otp_code": "999999"
        }

        # Send POST request
        response = self.client.post(self.verify_url, payload, format="json")

        # Check invalid OTP response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

        # User should still remain unverified
        user.refresh_from_db()
        self.assertFalse(user.is_verified)

    # Test OTP verification with expired OTP
    def test_verify_otp_with_expired_code(self):
        # Create unverified user
        user = User.objects.create_user(
            username="otpuser@example.com",
            email="otpuser@example.com",
            password="StrongPass123",
            full_name="OTP User",
            role="buyer",
            is_verified=False,
        )

        # Create expired OTP
        OTP.objects.create(
            user=user,
            otp_code="123456",
            expires_at=timezone.now() - timedelta(minutes=1)
        )

        payload = {
            "email": "otpuser@example.com",
            "otp_code": "123456"
        }

        # Send POST request
        response = self.client.post(self.verify_url, payload, format="json")

        # Check expired OTP response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

        # User should still remain unverified
        user.refresh_from_db()
        self.assertFalse(user.is_verified)

    # Test resend OTP with valid email
    @patch("accounts.views.generate_and_send_otp")
    def test_resend_otp_with_valid_email(self, mock_generate_and_send_otp):
        # Mock OTP sending
        mock_generate_and_send_otp.return_value = (True, "Imperial Dispatch successful.")

        # Create unverified user
        User.objects.create_user(
            username="otpuser@example.com",
            email="otpuser@example.com",
            password="StrongPass123",
            full_name="OTP User",
            role="buyer",
            is_verified=False,
        )

        payload = {
            "email": "otpuser@example.com"
        }

        # Send POST request
        response = self.client.post(self.resend_url, payload, format="json")

        # Check resend response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

class PasswordResetViewTests(APITestCase):

    # Setup URLs before each test
    def setUp(self):
        self.request_url = reverse("password-reset-request")
        self.confirm_url = reverse("password-reset-confirm")

    # Test password reset request with valid email
    @patch("accounts.views.send_mail")
    def test_password_reset_request_valid_email(self, mock_send_mail):
        mock_send_mail.return_value = 1  # mock email send success

        # Create test user
        User.objects.create_user(
            username="resetuser@example.com",
            email="resetuser@example.com",
            password="OldPass123",
            full_name="Reset User",
            role="buyer",
            is_verified=True,
        )

        payload = {
            "email": "resetuser@example.com"
        }

        # Send request
        response = self.client.post(self.request_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    # Test password reset request with invalid email
    def test_password_reset_request_invalid_email(self):

        payload = {
            "email": "nouser@example.com"
        }

        # Send request
        response = self.client.post(self.request_url, payload, format="json")

        # Should still return success (security reason)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    # Test password reset confirm with valid token
    def test_password_reset_confirm_valid_token(self):

        # Create test user
        user = User.objects.create_user(
            username="resetuser@example.com",
            email="resetuser@example.com",
            password="OldPass123",
            full_name="Reset User",
            role="buyer",
            is_verified=True,
        )

        # Generate valid uid and token
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        payload = {
            "uidb64": uidb64,
            "token": token,
            "new_password": "NewStrongPass123"
        }

        # Send request
        response = self.client.post(self.confirm_url, payload, format="json")

        # Check success
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

        # Verify password changed
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewStrongPass123"))

    # Test password reset confirm with invalid token
    def test_password_reset_confirm_invalid_token(self):

        # Create test user
        user = User.objects.create_user(
            username="resetuser@example.com",
            email="resetuser@example.com",
            password="OldPass123",
            full_name="Reset User",
            role="buyer",
            is_verified=True,
        )

        # Generate uid but use invalid token
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        payload = {
            "uidb64": uidb64,
            "token": "invalid-token-123",
            "new_password": "NewStrongPass123"
        }

        # Send request
        response = self.client.post(self.confirm_url, payload, format="json")

        # Check failure
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

class SecurityAndPermissionTests(APITestCase):

    # Setup URLs before each test
    def setUp(self):
        self.toggle_2fa_url = reverse("toggle-2fa")
        self.profile_url = reverse("me")
        self.user_count_url = reverse("user-count")

    # Test enabling/disabling 2FA for authenticated user
    def test_toggle_2fa_on_off(self):
        # Create authenticated user
        user = User.objects.create_user(
            username="buyer2@example.com",
            email="buyer2@example.com",
            password="StrongPass123",
            full_name="Buyer Two",
            role="buyer",
            is_verified=True,
            is_2fa_enabled=False,
        )

        # Authenticate user
        self.client.force_authenticate(user=user)

        # Enable 2FA
        response_enable = self.client.post(
            self.toggle_2fa_url,
            {"enabled": True},
            format="json"
        )

        # Check enable response
        self.assertEqual(response_enable.status_code, status.HTTP_200_OK)
        self.assertIn("is_2fa_enabled", response_enable.data)
        self.assertTrue(response_enable.data["is_2fa_enabled"])

        # Disable 2FA
        response_disable = self.client.post(
            self.toggle_2fa_url,
            {"enabled": False},
            format="json"
        )

        # Check disable response
        self.assertEqual(response_disable.status_code, status.HTTP_200_OK)
        self.assertIn("is_2fa_enabled", response_disable.data)
        self.assertFalse(response_disable.data["is_2fa_enabled"])

    # Test protected route without authentication
    def test_protected_route_access_without_authentication(self):
        # Send request without login
        response = self.client.get(self.profile_url)

        # Check unauthorized response
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    # Test admin-only endpoint access for admin and non-admin
    def test_role_based_access_validation(self):
        # Create admin user
        admin_user = User.objects.create_user(
            username="admincheck@example.com",
            email="admincheck@example.com",
            password="StrongPass123",
            full_name="Admin Check",
            role="admin",
            is_verified=True,
        )

        # Create normal buyer user
        buyer_user = User.objects.create_user(
            username="buyercheck@example.com",
            email="buyercheck@example.com",
            password="StrongPass123",
            full_name="Buyer Check",
            role="buyer",
            is_verified=True,
        )

        # Authenticate as buyer and try admin-only endpoint
        self.client.force_authenticate(user=buyer_user)
        response_buyer = self.client.get(self.user_count_url)

        # Buyer should be denied
        self.assertEqual(response_buyer.status_code, status.HTTP_403_FORBIDDEN)

        # Authenticate as admin and try same endpoint
        self.client.force_authenticate(user=admin_user)
        response_admin = self.client.get(self.user_count_url)

        # Admin should be allowed
        self.assertEqual(response_admin.status_code, status.HTTP_200_OK)
        self.assertIn("count", response_admin.data)

class AdminModuleTests(APITestCase):

    # Setup URL before each test
    def setUp(self):
        self.user_count_url = reverse("user-count")
        self.admin_users_url = reverse("admin-users-list")

    # Test admin dashboard / user count
    def test_admin_user_count(self):
        # Create admin user
        admin_user = User.objects.create_user(
            username="admincount@example.com",
            email="admincount@example.com",
            password="StrongPass123",
            full_name="Admin Count",
            role="admin",
            is_verified=True,
        )

        # Create another user
        User.objects.create_user(
            username="buyercount@example.com",
            email="buyercount@example.com",
            password="StrongPass123",
            full_name="Buyer Count",
            role="buyer",
            is_verified=True,
        )

        # Authenticate admin
        self.client.force_authenticate(user=admin_user)

        # Send GET request
        response = self.client.get(self.user_count_url)

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)

            # Test admin user management list access
    def test_admin_user_management_list_access(self):
        # Create admin user
        admin_user = User.objects.create_user(
            username="adminusers@example.com",
            email="adminusers@example.com",
            password="StrongPass123",
            full_name="Admin Users",
            role="admin",
            is_verified=True,
        )

        # Create another user
        User.objects.create_user(
            username="buyerusers@example.com",
            email="buyerusers@example.com",
            password="StrongPass123",
            full_name="Buyer Users",
            role="buyer",
            is_verified=True,
        )

        # Authenticate admin
        self.client.force_authenticate(user=admin_user)

        # Send GET request
        response = self.client.get(self.admin_users_url)

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)