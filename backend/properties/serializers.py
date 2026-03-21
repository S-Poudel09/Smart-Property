from rest_framework import serializers
from .models import Property, PropertyImage, PropertyDocument

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'is_primary', 'created_at')

class PropertyDocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    
    class Meta:
        model = PropertyDocument
        fields = ('id', 'document', 'doc_type', 'doc_type_display', 'is_verified', 'ocr_data', 'created_at')

class PropertySerializer(serializers.ModelSerializer):
    # Mapping to match requested names if needed, but keeping snake_case for consistency
    # We can use aliases if the user specifically wanted PascalCase in API
    
    PropertyID = serializers.UUIDField(source='id', read_only=True)
    OwnerID = serializers.PrimaryKeyRelatedField(source='owner', read_only=True)
    seller_id = serializers.PrimaryKeyRelatedField(source='owner', read_only=True)
    CreatedAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    # Nested serializers
    property_images = PropertyImageSerializer(many=True, read_only=True)
    property_documents = PropertyDocumentSerializer(many=True, read_only=True)
    
    # For uploading
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )
    uploaded_documents = serializers.ListField(
        child=serializers.FileField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = (
            'PropertyID', 'title', 'description', 'location', 'latitude', 
            'longitude', 'price', 'property_type', 'OwnerID', 'seller_id', 'CreatedAt',
            'listing_type', 'beds', 'baths', 'area_sqft', 'status', 'is_verified',
            'property_images', 'property_documents', 'uploaded_images', 'uploaded_documents',
            'boundary_coordinates', 'virtual_tour_url',
            'stories', 'mainroad', 'guestroom', 'basement', 'hotwaterheating',
            'airconditioning', 'parking_spaces', 'prefarea', 'furnishing_status'
        )
        # We can also keep the original names for internal use
        extra_kwargs = {
            'title': {'required': True},
            'location': {'required': True},
            'price': {'required': True},
            'property_type': {'required': True},
        }

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_documents = validated_data.pop('uploaded_documents', [])
        
        validated_data['owner'] = self.context['request'].user
        property_obj = Property.objects.create(**validated_data)
        
        for image in uploaded_images:
            PropertyImage.objects.create(property=property_obj, image=image)
            
        for doc in uploaded_documents:
            # For simplicity, default to 'deed' if not specified in a more complex payload
            # In a real app, you'd send a list of objects with doc_type
            PropertyDocument.objects.create(property=property_obj, document=doc, doc_type='deed')
            
        return property_obj
