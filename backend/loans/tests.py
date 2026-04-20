from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from properties.models import Property
from .models import Loan

User = get_user_model()


class LoanViewSetTests(APITestCase):

    # Setup URL before each test
    def setUp(self):
        self.calculate_emi_url = reverse("loan-calculate-emi")

    # Test loan EMI calculation with valid data
    def test_loan_emi_calculation(self):
        # Create authenticated user
        user = User.objects.create_user(
            username="buyerloan@example.com",
            email="buyerloan@example.com",
            password="StrongPass123",
            full_name="Buyer Loan",
            role="buyer",
            is_verified=True,
        )

        # Authenticate user
        self.client.force_authenticate(user=user)

        payload = {
            "amount": "1000000.00",
            "rate": "8.50",
            "tenure": 20
        }

        # Send POST request
        response = self.client.post(self.calculate_emi_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("MonthlyEMI", response.data)
        self.assertIn("TotalPayable", response.data)
        self.assertIn("TotalInterest", response.data)

            # Test loan eligibility check with valid data
    def test_loan_eligibility_check(self):
        # Create authenticated user
        user = User.objects.create_user(
            username="buyereligibility@example.com",
            email="buyereligibility@example.com",
            password="StrongPass123",
            full_name="Buyer Eligibility",
            role="buyer",
            is_verified=True,
        )

        # Authenticate user
        self.client.force_authenticate(user=user)

        eligibility_url = reverse("loan-check-eligibility")

        payload = {
            "income": "1200000.00",
            "loan_amount": "1000000.00",
            "existing_emis": "5000.00"
        }

        # Send POST request
        response = self.client.post(eligibility_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("IsEligible", response.data)
        self.assertIn("MaxAllowedEMI", response.data)
        self.assertIn("EstimatedEMI", response.data)
        self.assertIn("Recommendation", response.data)