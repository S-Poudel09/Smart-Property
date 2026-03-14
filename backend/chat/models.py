import uuid
from django.db import models
from django.conf import settings

class Message(models.Model):
    # MessageID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # SenderID
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    
    # ReceiverID
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    
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

    # Optional: Link to property or thread if we want to keep some context, 
    # but the user requested a flat structure. I'll stick to the requested fields.

    def __str__(self):
        return f"From {self.sender.email} to {self.receiver.email} at {self.timestamp}"

    class Meta:
        ordering = ['timestamp']
