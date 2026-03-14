from rest_framework import serializers
from .models import Property

class PropertySerializer(serializers.ModelSerializer):
    # Mapping to match requested names if needed, but keeping snake_case for consistency
    # We can use aliases if the user specifically wanted PascalCase in API
    
    PropertyID = serializers.UUIDField(source='id', read_only=True)
    OwnerID = serializers.PrimaryKeyRelatedField(source='owner', read_only=True)
    CreatedAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Property
        fields = (
            'PropertyID', 'title', 'description', 'location', 'latitude', 
            'longitude', 'price', 'property_type', 'OwnerID', 'CreatedAt',
            'listing_type', 'beds', 'baths', 'area_sqft', 'images', 'status'
        )
        # We can also keep the original names for internal use
        extra_kwargs = {
            'title': {'required': True},
            'location': {'required': True},
            'price': {'required': True},
            'property_type': {'required': True},
        }

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
