from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Notification

User = get_user_model()


class NotificationViewSetTests(APITestCase):

    # Setup URL before each test
    def setUp(self):
        self.notification_list_url = reverse("notifications-list")

    # Test notification retrieval
    def test_notification_retrieval(self):
        # Create users
        user1 = User.objects.create_user(
            username="notify1@example.com",
            email="notify1@example.com",
            password="StrongPass123",
            full_name="Notify One",
            role="buyer",
            is_verified=True,
        )

        user2 = User.objects.create_user(
            username="notify2@example.com",
            email="notify2@example.com",
            password="StrongPass123",
            full_name="Notify Two",
            role="buyer",
            is_verified=True,
        )

        # Create notifications for both users
        Notification.objects.create(
            user=user1,
            type="system",
            title="Notification 1",
            message="Message for user1"
        )

        Notification.objects.create(
            user=user2,
            type="system",
            title="Notification 2",
            message="Message for user2"
        )

        # Authenticate user1
        self.client.force_authenticate(user=user1)

        # Send GET request
        response = self.client.get(self.notification_list_url)

        # Check only user1 notifications returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Notification 1")

            # Test notification read/unread update
    def test_notification_mark_read(self):
        # Create user
        user = User.objects.create_user(
            username="notifyread@example.com",
            email="notifyread@example.com",
            password="StrongPass123",
            full_name="Notify Read",
            role="buyer",
            is_verified=True,
        )

        # Create unread notification
        notification = Notification.objects.create(
            user=user,
            type="system",
            title="Unread Notification",
            message="Please read this",
            is_read=False
        )

        # Authenticate user
        self.client.force_authenticate(user=user)

        mark_read_url = reverse("notifications-mark-read", kwargs={"pk": notification.id})
        response = self.client.patch(mark_read_url, {}, format="json")

        # Refresh and check
        notification.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(notification.is_read)