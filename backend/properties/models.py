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
    PROPERTY_TYPE_CHOICES = [
        ('house', 'House / Ghar'),
        ('flat', 'Flat'),
        ('bungalow', 'Bungalow'),
        ('apartment', 'Apartment'),
        ('commercial', 'Commercial Building'),
        ('hostel', 'Hostel / PG'),
        ('land', 'Land / Jagga'),
    ]
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE_CHOICES, default='house')
    
    # OwnerID
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_properties')
    
    # CreatedAt
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Additional fields maintained for the platform functionality
    listing_type = models.CharField(max_length=20, choices=[("sale", "Sale"), ("rent", "Rent")], default="sale")
    beds = models.IntegerField(blank=True, null=True)
    baths = models.IntegerField(blank=True, null=True)
    area_sqft = models.FloatField(blank=True, null=True)
    
    # Nepali land measurement
    area_ropani = models.FloatField(blank=True, null=True, help_text="Area in Ropani (1 Ropani = 5,476 sq ft)")
    area_anna = models.FloatField(blank=True, null=True, help_text="Area in Aana (1 Aana = 342.25 sq ft)")
    
    # Nepali address fields
    ward = models.CharField(max_length=10, blank=True, null=True, help_text="Ward number")
    municipality = models.CharField(max_length=100, blank=True, null=True, help_text="Municipality / VDC name")
    district = models.CharField(max_length=100, blank=True, null=True, help_text="District name")
    
    city = models.CharField(max_length=100, blank=True, null=True)
    # Media handled via PropertyImage and PropertyDocument models for consistency
    status = models.CharField(
        max_length=20, 
        default="submitted", 
        choices=[("draft", "Draft"), ("submitted", "Submitted"), ("approved", "Approved"), ("rejected", "Rejected"), ("published", "Published")]
    )
    
    # Detailed Features (from datasets)
    stories = models.IntegerField(default=1)
    mainroad = models.BooleanField(default=False)
    guestroom = models.BooleanField(default=False)
    basement = models.BooleanField(default=False)
    hotwaterheating = models.BooleanField(default=False)
    airconditioning = models.BooleanField(default=False)
    parking_spaces = models.IntegerField(default=0)
    prefarea = models.BooleanField(default=False)
    furnishing_status = models.CharField(max_length=50, default="unfurnished") # furnished, semi-furnished, unfurnished
    is_verified = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # GIS and Interactive Features
    boundary_coordinates = models.JSONField(null=True, blank=True, help_text="Polygon coordinates for property boundaries")
    virtual_tour_url = models.URLField(null=True, blank=True, help_text="360-degree virtual tour link")
    model_3d_url = models.URLField(blank=True, null=True, help_text="3D model GLB/GLTF link")
    tour_360_url = models.URLField(blank=True, null=True, help_text="Alternative 360-degree virtual tour link")
    
    # Hostel Specific Fields
    HOSTEL_GENDER_CHOICES = [
        ('boys', 'Boys Only'),
        ('girls', 'Girls Only'),
        ('mixed', 'Mixed / Co-ed'),
    ]
    hostel_gender = models.CharField(max_length=20, choices=HOSTEL_GENDER_CHOICES, blank=True, null=True)
    room_type = models.CharField(max_length=50, blank=True, null=True, help_text="Single, Double, Triple, etc.")
    food_included = models.BooleanField(default=False)
    has_wifi = models.BooleanField(default=False)
    has_laundry = models.BooleanField(default=False)
    bathroom_type = models.CharField(max_length=50, blank=True, null=True, choices=[('attached', 'Attached'), ('shared', 'Shared')])
    available_beds = models.IntegerField(default=0)
    
    # Progress/Workflow State for Transactions
    # 1: Contact Seller, 2: Chat Started, 3: Payment Submitted, 4: Admin Verified, 5: Deal Completed
    workflow_step = models.IntegerField(default=1) 
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='property_images')
    image = models.ImageField(upload_to='property_images/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.property.title}"


class PropertyDocument(models.Model):
    DOCUMENT_TYPES = (
        ('deed', 'Title Deed'),
        ('tax', 'Property Tax Receipt'),
        ('utility', 'Utility Bill'),
        ('ownership', 'Ownership Certificate'),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='property_documents')
    document = models.FileField(upload_to='property_documents/')
    doc_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    is_verified = models.BooleanField(default=False)
    ocr_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_doc_type_display()} for {self.property.title}"


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5) # 1-5 stars
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('property', 'user') # One review per user per property

    def __str__(self):
        return f"Review by {self.user.email} on {self.property.title}"
