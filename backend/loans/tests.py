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

            # Test loan application submission
    def test_loan_application_submission(self):
        # Create buyer and seller
        buyer = User.objects.create_user(
            username="buyerloanapply@example.com",
            email="buyerloanapply@example.com",
            password="StrongPass123",
            full_name="Buyer Apply",
            role="buyer",
            is_verified=True,
        )

        seller = User.objects.create_user(
            username="sellerloanapply@example.com",
            email="sellerloanapply@example.com",
            password="StrongPass123",
            full_name="Seller Apply",
            role="seller",
            is_verified=True,
        )

        # Create property
        property_obj = Property.objects.create(
            title="Loan Property",
            location="Kathmandu",
            price="5500000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        create_url = reverse("loan-list")

        payload = {
            "PropertyID": str(property_obj.id),
            "LoanAmount": "1000000.00",
            "InterestRate": "8.50"
        }

        # Send POST request
        response = self.client.post(create_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Loan.objects.count(), 1)

        loan_obj = Loan.objects.first()
        self.assertEqual(loan_obj.user, buyer)
        self.assertEqual(loan_obj.property, property_obj)
        self.assertEqual(str(loan_obj.loan_amount), "1000000.00")

            # Test loan tracking and status retrieval
    def test_loan_tracking_status_retrieval(self):
        # Create buyer and seller
        buyer = User.objects.create_user(
            username="buyerloantrack@example.com",
            email="buyerloantrack@example.com",
            password="StrongPass123",
            full_name="Buyer Track",
            role="buyer",
            is_verified=True,
        )

        seller = User.objects.create_user(
            username="sellerloantrack@example.com",
            email="sellerloantrack@example.com",
            password="StrongPass123",
            full_name="Seller Track",
            role="seller",
            is_verified=True,
        )

        # Create property
        property_obj = Property.objects.create(
            title="Tracked Loan Property",
            location="Pokhara",
            price="6500000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        # Create loan
        loan_obj = Loan.objects.create(
            user=buyer,
            property=property_obj,
            loan_amount="1200000.00",
            interest_rate="9.00",
            status="SUBMITTED"
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        detail_url = reverse("loan-detail", kwargs={"pk": loan_obj.id})
        response = self.client.get(detail_url)

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("LoanID", response.data)
        self.assertIn("LoanStatus", response.data)
        self.assertEqual(response.data["LoanStatus"], "SUBMITTED")
        