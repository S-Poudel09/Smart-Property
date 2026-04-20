from unittest.mock import patch  # Mock external calls like OTP/email

from django.contrib.auth import get_user_model
from django.urls import reverse  # Resolve URL names
from rest_framework import status
from rest_framework.test import APITestCase  # API test client

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