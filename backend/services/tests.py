from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Service, ServiceBooking

User = get_user_model()


class ServiceViewSetTests(APITestCase):

    # Setup URL before each test
    def setUp(self):
        self.service_list_url = reverse("service-list")
        self.booking_list_url = reverse("servicebooking-list")

    # Test services marketplace / service list retrieval
    def test_service_list_retrieval(self):
        # Create active services
        Service.objects.create(
            name="Legal Documentation",
            category="legal",
            description="Legal support service",
            base_price="5000.00",
            is_active=True
        )

        Service.objects.create(
            name="Property Photography",
            category="marketing",
            description="Photography service",
            base_price="3000.00",
            is_active=True
        )

        # Public GET request
        response = self.client.get(self.service_list_url)

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

            # Test service booking creation
    def test_service_booking_creation(self):
        # Create buyer user
        buyer = User.objects.create_user(
            username="buyerservice@example.com",
            email="buyerservice@example.com",
            password="StrongPass123",
            full_name="Buyer Service",
            role="buyer",
            is_verified=True,
        )

        # Create service
        service = Service.objects.create(
            name="Construction Help",
            category="construction",
            description="Construction and repair service",
            base_price="8000.00",
            is_active=True
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        payload = {
            "service": str(service.id),
            "status": "PENDING",
            "notes": "Need urgent support"
        }

        # Send POST request
        response = self.client.post(self.booking_list_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ServiceBooking.objects.count(), 1)

        booking = ServiceBooking.objects.first()
        self.assertEqual(booking.user, buyer)
        self.assertEqual(booking.service, service)
        self.assertEqual(booking.status, "PENDING")

            # Test booking history retrieval
    def test_booking_history_retrieval(self):
        # Create two users
        user1 = User.objects.create_user(
            username="user1service@example.com",
            email="user1service@example.com",
            password="StrongPass123",
            full_name="User One",
            role="buyer",
            is_verified=True,
        )

        user2 = User.objects.create_user(
            username="user2service@example.com",
            email="user2service@example.com",
            password="StrongPass123",
            full_name="User Two",
            role="buyer",
            is_verified=True,
        )

        # Create service
        service = Service.objects.create(
            name="Finance Support",
            category="finance",
            description="Financial guidance service",
            base_price="6000.00",
            is_active=True
        )

        # Create bookings for both users
        ServiceBooking.objects.create(
            user=user1,
            service=service,
            status="PENDING"
        )

        ServiceBooking.objects.create(
            user=user2,
            service=service,
            status="COMPLETED"
        )

        # Authenticate user1
        self.client.force_authenticate(user=user1)

        # Send GET request
        response = self.client.get(self.booking_list_url)

        # Check only user1 booking is returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["user_email"], "user1service@example.com")