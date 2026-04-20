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

            # Test payment proof upload
    def test_payment_proof_upload(self):
        # Create buyer and seller
        buyer = User.objects.create_user(
            username="buyerproof@example.com",
            email="buyerproof@example.com",
            password="StrongPass123",
            full_name="Buyer Proof",
            role="buyer",
            is_verified=True,
        )

        seller = User.objects.create_user(
            username="sellerproof@example.com",
            email="sellerproof@example.com",
            password="StrongPass123",
            full_name="Seller Proof",
            role="seller",
            is_verified=True,
        )

        # Create property and transaction
        property_obj = Property.objects.create(
            title="Proof Property",
            location="Pokhara",
            price="4500000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        transaction = Transaction.objects.create(
            buyer=buyer,
            seller=seller,
            property=property_obj,
            total_amount="1000000.00",
            amount_paid="0.00",
            payment_method="Bank Transfer",
            status="PENDING"
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        proof_file = SimpleUploadedFile(
            "payment_proof.pdf",
            b"%PDF-1.4 payment proof content",
            content_type="application/pdf"
        )

        upload_url = reverse("transaction-upload-proof", kwargs={"pk": transaction.id})

        payload = {
            "amount": "500000.00",
            "proof_file": proof_file,
            "notes": "Advance payment proof"
        }

        # Send POST request
        response = self.client.post(upload_url, payload, format="multipart")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PaymentProof.objects.count(), 1)

        proof = PaymentProof.objects.first()
        self.assertEqual(proof.transaction, transaction)
        self.assertEqual(str(proof.amount), "500000.00")

            # Test transaction tracking / retrieval
    def test_transaction_tracking_retrieval(self):
        # Create users
        buyer1 = User.objects.create_user(
            username="buyertrack1@example.com",
            email="buyertrack1@example.com",
            password="StrongPass123",
            full_name="Buyer Track One",
            role="buyer",
            is_verified=True,
        )

        buyer2 = User.objects.create_user(
            username="buyertrack2@example.com",
            email="buyertrack2@example.com",
            password="StrongPass123",
            full_name="Buyer Track Two",
            role="buyer",
            is_verified=True,
        )

        seller = User.objects.create_user(
            username="sellertrack@example.com",
            email="sellertrack@example.com",
            password="StrongPass123",
            full_name="Seller Track",
            role="seller",
            is_verified=True,
        )

        # Create properties
        property1 = Property.objects.create(
            title="Track Property One",
            location="Kathmandu",
            price="4000000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        property2 = Property.objects.create(
            title="Track Property Two",
            location="Lalitpur",
            price="6000000.00",
            property_type="flat",
            owner=seller,
            status="published"
        )

        # Create transactions
        Transaction.objects.create(
            buyer=buyer1,
            seller=seller,
            property=property1,
            total_amount="1000000.00",
            amount_paid="0.00",
            status="PENDING"
        )

        Transaction.objects.create(
            buyer=buyer2,
            seller=seller,
            property=property2,
            total_amount="2000000.00",
            amount_paid="0.00",
            status="PENDING"
        )

        # Authenticate buyer1
        self.client.force_authenticate(user=buyer1)

        # Send GET request
        response = self.client.get(self.transaction_list_url)

        # Check only buyer1 transaction is returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)