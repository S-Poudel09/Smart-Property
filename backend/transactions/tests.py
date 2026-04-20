from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from properties.models import Property
from .models import Transaction, PaymentProof

User = get_user_model()


class TransactionViewSetTests(APITestCase):

    # Setup URL before each test
    def setUp(self):
        self.transaction_list_url = reverse("transaction-list")

    # Test transaction creation
    def test_transaction_creation(self):
        # Create buyer and seller
        buyer = User.objects.create_user(
            username="buyertransaction@example.com",
            email="buyertransaction@example.com",
            password="StrongPass123",
            full_name="Buyer Transaction",
            role="buyer",
            is_verified=True,
        )

        seller = User.objects.create_user(
            username="sellertransaction@example.com",
            email="sellertransaction@example.com",
            password="StrongPass123",
            full_name="Seller Transaction",
            role="seller",
            is_verified=True,
        )

        # Create property
        property_obj = Property.objects.create(
            title="Transaction Property",
            location="Kathmandu",
            price="5000000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        payload = {
            "property_id": str(property_obj.id),
            "transaction_amount": "1000000.00",
            "payment_method": "Bank Transfer"
        }

        # Send POST request
        response = self.client.post(self.transaction_list_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)

        transaction = Transaction.objects.first()
        self.assertEqual(transaction.buyer, buyer)
        self.assertEqual(transaction.property, property_obj)
        self.assertEqual(str(transaction.total_amount), "1000000.00")