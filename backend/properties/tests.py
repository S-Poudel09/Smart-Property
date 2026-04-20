from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Property, PropertyImage

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

            # Test hostel listing support
    def test_hostel_property_creation(self):
        # Create seller user
        seller = User.objects.create_user(
            username="seller6@example.com",
            email="seller6@example.com",
            password="StrongPass123",
            full_name="Seller Six",
            role="seller",
            is_verified=True,
        )

        # Authenticate seller
        self.client.force_authenticate(user=seller)

        payload = {
            "title": "Girls Hostel in Chabahil",
            "description": "Safe girls hostel with WiFi and food.",
            "location": "Kathmandu",
            "price": "1800000.00",
            "property_type": "hostel",
            "listing_type": "rent",
            "hostel_gender": "girls",
            "available_beds": 10
        }

        response = self.client.post(self.list_url, payload, format="json")

        # Check hostel property created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        property_obj = Property.objects.first()
        self.assertEqual(property_obj.property_type, "hostel")

            # Test commercial listing support
    def test_commercial_property_creation(self):
        # Create seller user
        seller = User.objects.create_user(
            username="seller7@example.com",
            email="seller7@example.com",
            password="StrongPass123",
            full_name="Seller Seven",
            role="seller",
            is_verified=True,
        )

        # Authenticate seller
        self.client.force_authenticate(user=seller)

        payload = {
            "title": "Commercial Building in New Road",
            "description": "Prime business location.",
            "location": "Kathmandu",
            "price": "9500000.00",
            "property_type": "commercial",
            "listing_type": "sale"
        }

        response = self.client.post(self.list_url, payload, format="json")

        # Check commercial property created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        property_obj = Property.objects.first()
        self.assertEqual(property_obj.property_type, "commercial")

            # Test property price prediction
    def test_property_price_prediction(self):
        # Create seller and property
        seller = User.objects.create_user(
            username="seller9@example.com",
            email="seller9@example.com",
            password="StrongPass123",
            full_name="Seller Nine",
            role="seller",
            is_verified=True,
        )

        property_obj = Property.objects.create(
            title="Prediction House",
            location="Kathmandu",
            price="5000000.00",
            property_type="house",
            owner=seller,
            status="published",
            area_sqft=1200,
            beds=3,
            baths=2,
            stories=2
        )

        # Authenticate user
        self.client.force_authenticate(user=seller)

        predict_url = reverse("property-predict-price", kwargs={"pk": property_obj.id})
        response = self.client.post(predict_url, {}, format="json")

        # Check prediction response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("status", response.data)
        self.assertIn("prediction", response.data)
        self.assertIn("estimated_price", response.data["prediction"])

            # Test property review submission
    def test_property_review_submission(self):
        # Create seller and buyer
        seller = User.objects.create_user(
            username="seller10@example.com",
            email="seller10@example.com",
            password="StrongPass123",
            full_name="Seller Ten",
            role="seller",
            is_verified=True,
        )

        buyer = User.objects.create_user(
            username="buyer10@example.com",
            email="buyer10@example.com",
            password="StrongPass123",
            full_name="Buyer Ten",
            role="buyer",
            is_verified=True,
        )

        # Create property
        property_obj = Property.objects.create(
            title="Review House",
            location="Pokhara",
            price="3500000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        review_url = reverse("property-add-review", kwargs={"pk": property_obj.id})
        payload = {
            "rating": 5,
            "comment": "Very good property."
        }

        response = self.client.post(review_url, payload, format="json")

        # Check review response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertIn("review", response.data)
        self.assertEqual(response.data["review"]["rating"], 5)
        self.assertEqual(response.data["review"]["comment"], "Very good property.")


            # Test property image upload during creation
    def test_property_image_upload(self):
        # Create seller user
        seller = User.objects.create_user(
            username="seller11@example.com",
            email="seller11@example.com",
            password="StrongPass123",
            full_name="Seller Eleven",
            role="seller",
            is_verified=True,
        )

        # Authenticate seller
        self.client.force_authenticate(user=seller)

        # Create a simple test image file
        image_file = SimpleUploadedFile(
            "test_image.gif",
            b"GIF87a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!"
            b"\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00"
            b"\x00\x02\x02D\x01\x00;",
            content_type="image/gif"
        )

        payload = {
            "title": "Image Upload Property",
            "description": "Property with image upload.",
            "location": "Kathmandu",
            "price": "4000000.00",
            "property_type": "house",
            "listing_type": "sale",
            "uploaded_images": [image_file]
        }

        response = self.client.post(self.list_url, payload, format="multipart")

        # Check property created successfully
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Property.objects.count(), 1)
        self.assertEqual(PropertyImage.objects.count(), 1)