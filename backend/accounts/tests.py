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