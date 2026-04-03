from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from .serializers import NotificationSerializer
import logging

logger = logging.getLogger(__name__)

# WebSocket functionality removed. 
# Notifications are stored in DB and fetched via standard HTTP polling/refresh.

@receiver(post_save, sender=Notification)
def handle_notification_save(sender, instance, created, **kwargs):
    if created:
        # In the future, we could trigger push notifications or emails here
        logger.info(f"Notification created for user {instance.user.id}: {instance.title}")
