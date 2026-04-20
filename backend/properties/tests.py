from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Property

User = get_user_model()


class PropertyViewSetTests(APITestCase):

    # Setup before each test
    def setUp(self):
        self.list_url = reverse("property-list")

    # Test seller property submission with valid data
    def test_seller_can_create_property_with_valid_data(self):
        # Create seller user
        seller = User.objects.create_user(
            username="seller1@example.com",
            email="seller1@example.com",
            password="StrongPass123",
            full_name="Seller One",
            role="seller",
            is_verified=True,
        )

        # Authenticate seller
        self.client.force_authenticate(user=seller)

        # Valid property data
        payload = {
            "title": "Modern Hostel in Kathmandu",
            "description": "Well-managed hostel with WiFi and food.",
            "location": "Kathmandu",
            "price": "2500000.00",
            "property_type": "hostel",
            "listing_type": "sale"
        }

        # Send POST request
        response = self.client.post(self.list_url, payload, format="json")

        # Check response status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check property created in database
        self.assertEqual(Property.objects.count(), 1)

        property_obj = Property.objects.first()

        # Check saved values
        self.assertEqual(property_obj.title, "Modern Hostel in Kathmandu")
        self.assertEqual(property_obj.owner, seller)
        self.assertEqual(property_obj.status, "submitted")
        self.assertEqual(property_obj.property_type, "hostel")
        self.assertEqual(str(property_obj.price), "2500000.00")

    # Test property submission with missing required fields
    def test_property_creation_missing_required_fields(self):
        # Create seller user
        seller = User.objects.create_user(
            username="seller2@example.com",
            email="seller2@example.com",
            password="StrongPass123",
            full_name="Seller Two",
            role="seller",
            is_verified=True,
        )

        # Authenticate seller
        self.client.force_authenticate(user=seller)

        # Invalid property data
        payload = {
            "title": "",
            "location": "",
            "price": "",
            "property_type": ""
        }

        # Send POST request
        response = self.client.post(self.list_url, payload, format="json")

        # Check validation response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)
        self.assertIn("location", response.data)
        self.assertIn("price", response.data)
        self.assertIn("property_type", response.data)

    