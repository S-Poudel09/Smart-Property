import uuid
from django.db import models
from django.conf import settings

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=[
        ("legal", "Legal & Documentation"),
        ("construction", "Construction & Repair"),
        ("finance", "Financial Services"),
        ("marketing", "Marketing & Photography")
    ])
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    icon = models.CharField(max_length=50, default="Settings") # Lucide icon name
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class ServiceBooking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='service_bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings', null=True)
    property_id = models.UUIDField(blank=True, null=True) # Optional linking
    status = models.CharField(
        max_length=20,
        default="PENDING",
        choices=[
            ("PENDING", "Pending"),
            ("SCHEDULED", "Scheduled"),
            ("COMPLETED", "Completed"),
            ("CANCELLED", "Cancelled")
        ]
    )
    scheduled_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.service.name if self.service else 'Service'} for {self.user.email} - {self.status}"
