from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from properties.models import Property
from .models import ChatRoom, Message

User = get_user_model()


class ChatModuleTests(APITestCase):

    # Setup URLs before each test
    def setUp(self):
        self.chatroom_list_url = reverse("chatroom-list")
        self.chatroom_create_url = reverse("chatroom-get-or-create-room")
        self.message_list_url = reverse("message-list")

    # Test chat room creation
    def test_chat_room_creation(self):
        # Create buyer and seller
        buyer = User.objects.create_user(
            username="buyerchat@example.com",
            email="buyerchat@example.com",
            password="StrongPass123",
            full_name="Buyer Chat",
            role="buyer",
            is_verified=True,
        )

        seller = User.objects.create_user(
            username="sellerchat@example.com",
            email="sellerchat@example.com",
            password="StrongPass123",
            full_name="Seller Chat",
            role="seller",
            is_verified=True,
        )

        # Create property
        property_obj = Property.objects.create(
            title="Chat Property",
            location="Kathmandu",
            price="5500000.00",
            property_type="house",
            owner=seller,
            status="published"
        )

        # Authenticate buyer
        self.client.force_authenticate(user=buyer)

        payload = {
            "property_id": str(property_obj.id),
            "recipient_id": seller.id
        }

        # Send POST request
        response = self.client.post(self.chatroom_create_url, payload, format="json")

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ChatRoom.objects.count(), 1)