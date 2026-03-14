import uuid
from django.db import models
from django.conf import settings

class Property(models.Model):
    # PropertyID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Title
    title = models.CharField(max_length=255)
    
    # Description
    description = models.TextField(blank=True, null=True)
    
    # Location
    location = models.CharField(max_length=255)
    
    # Latitude & Longitude
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    
    # Price
    price = models.DecimalField(max_digits=15, decimal_places=2)
    
    # PropertyType
    property_type = models.CharField(max_length=50) # e.g., "House", "Apartment"
    
    # OwnerID
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_properties')
    
    # CreatedAt
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Additional fields maintained for the platform functionality
    listing_type = models.CharField(max_length=20, choices=[("sale", "Sale"), ("rent", "Rent")], default="sale")
    beds = models.IntegerField(blank=True, null=True)
    baths = models.IntegerField(blank=True, null=True)
    area_sqft = models.FloatField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    images = models.JSONField(default=list)
    documents = models.JSONField(default=list)
    status = models.CharField(
        max_length=20, 
        default="DRAFT", 
        choices=[("DRAFT", "Draft"), ("SUBMITTED", "Submitted"), ("APPROVED", "Approved"), ("REJECTED", "Rejected"), ("PUBLISHED", "Published")]
    )
    is_verified = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
