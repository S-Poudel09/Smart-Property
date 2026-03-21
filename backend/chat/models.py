import uuid
from django.db import models
from django.conf import settings
from django.apps import apps

class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='chat_rooms', null=True, blank=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat Room - {self.id} ({self.property.title if self.property else 'Direct'})"

class Message(models.Model):
    # MessageID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Room
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages', null=True)
    
    # SenderID
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    
    # MessageText
    text = models.TextField()
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Status
    # SENT | DELIVERED | READ
    status = models.CharField(
        max_length=20,
        default="SENT",
        choices=[
            ("SENT", "Sent"),
            ("DELIVERED", "Delivered"),
            ("READ", "Read")
        ]
    )

    def __str__(self):
        return f"From {self.sender.email} in Room {self.room_id} at {self.timestamp}"

    class Meta:
        ordering = ['timestamp']
