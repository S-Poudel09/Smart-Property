from django.db import models
from django.utils import timezone

class ActivityLog(models.Model):
    user_email = models.EmailField()
    action = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='success')
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user_email', 'action', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.user_email} - {self.action} at {self.timestamp}"

class AnalyticsSnapshot(models.Model):
    date = models.DateTimeField(unique=True)
    total_users = models.IntegerField(default=0)
    total_properties = models.IntegerField(default=0)
    total_transactions = models.IntegerField(default=0)
    total_revenue = models.FloatField(default=0.0)
    new_users_today = models.IntegerField(default=0)
    active_fraud_alerts = models.IntegerField(default=0)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Snapshot for {self.date.date()}"

class PropertyView(models.Model):
    property_id = models.CharField(max_length=255)
    viewer_email = models.EmailField(null=True, blank=True)
    viewed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['property_id', 'viewer_email']),
        ]

    def __str__(self):
        return f"View of {self.property_id} by {self.viewer_email}"
