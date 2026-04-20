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

    # Test admin property approval
    def test_admin_can_approve_property(self):
        # Create admin and seller
        admin_user = User.objects.create_user(
            username="admin1@example.com",
            email="admin1@example.com",
            password="StrongPass123",
            full_name="Admin One",
            role="admin",
            is_verified=True,
        )
        seller = User.objects.create_user(
            username="seller3@example.com",
            email="seller3@example.com",
            password="StrongPass123",
            full_name="Seller Three",
            role="seller",
            is_verified=True,
        )

        # Create submitted property
        property_obj = Property.objects.create(
            title="Submitted House",
            location="Kathmandu",
            price="3000000.00",
            property_type="house",
            owner=seller,
            status="submitted"
        )

        # Authenticate admin
        self.client.force_authenticate(user=admin_user)

        approve_url = reverse("property-approve", kwargs={"pk": property_obj.id})
        response = self.client.post(approve_url, {}, format="json")

        # Refresh and check
        property_obj.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(property_obj.status, "published")
        self.assertTrue(property_obj.is_verified)

   # Test admin property rejection
    def test_admin_can_reject_property(self):
        # Create admin and seller
        admin_user = User.objects.create_user(
            username="admin2@example.com",
            email="admin2@example.com",
            password="StrongPass123",
            full_name="Admin Two",
            role="admin",
            is_verified=True,
        )
        seller = User.objects.create_user(
            username="seller4@example.com",
            email="seller4@example.com",
            password="StrongPass123",
            full_name="Seller Four",
            role="seller",
            is_verified=True,
        )

        # Create submitted property
        property_obj = Property.objects.create(
            title="Rejected Flat",
            location="Pokhara",
            price="2000000.00",
            property_type="flat",
            owner=seller,
            status="submitted"
        )

        # Authenticate admin
        self.client.force_authenticate(user=admin_user)

        reject_url = reverse("property-reject", kwargs={"pk": property_obj.id})
        response = self.client.post(
            reject_url,
            {"rejection_reason": "Invalid documents"},
            format="json"
        )

        # Refresh and check
        property_obj.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(property_obj.status, "rejected")
        self.assertEqual(property_obj.rejection_reason, "Invalid documents")


    # Setup before each test
    def setUp(self):
        self.list_url = reverse("property-list")

    # Test public only sees published properties
    def test_public_only_sees_published_properties(self):
        # Create seller
        seller = User.objects.create_user(
            username="seller8@example.com",
            email="seller8@example.com",
            password="StrongPass123",
            full_name="Seller Eight",
            role="seller",
            is_verified=True,
        )

        # Create one published and one submitted property
        Property.objects.create(
            title="Published Property",
            location="Kathmandu",
            price="5000000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        Property.objects.create(
            title="Submitted Property",
            location="Bhaktapur",
            price="2200000.00",
            property_type="flat",
            owner=seller,
            status="submitted"
        )

        # Public request without authentication
        response = self.client.get(self.list_url)

        # Check only published property is visible
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Published Property")

    # Test property detail retrieval
        # Test property detail retrieval
    def test_property_detail_retrieval_valid_id(self):
        seller = User.objects.create_user(
            username="seller5@example.com",
            email="seller5@example.com",
            password="StrongPass123",
            full_name="Seller Five",
            role="seller",
            is_verified=True,
        )

        property_obj = Property.objects.create(
            title="Luxury Apartment",
            location="Lalitpur",
            price="4500000.00",
            property_type="apartment",
            owner=seller,
            status="published"
        )

        detail_url = reverse("property-detail", kwargs={"pk": property_obj.id})
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Luxury Apartment")