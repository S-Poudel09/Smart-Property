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