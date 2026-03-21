from rest_framework import serializers
from .models import Service, ServiceBooking

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class ServiceBookingSerializer(serializers.ModelSerializer):
    service_details = ServiceSerializer(source='service', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = ServiceBooking
        fields = ('id', 'user', 'user_email', 'service', 'service_details', 'property_id', 'status', 'scheduled_date', 'created_at', 'notes')
        read_only_fields = ('user',)
