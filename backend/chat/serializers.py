from rest_framework import serializers
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    MessageID = serializers.UUIDField(source='id', read_only=True)
    SenderID = serializers.PrimaryKeyRelatedField(source='sender', read_only=True)
    ReceiverID = serializers.PrimaryKeyRelatedField(source='receiver', queryset=User.objects.all())
    MessageText = serializers.CharField(source='text')
    Timestamp = serializers.DateTimeField(source='timestamp', read_only=True)
    Status = serializers.CharField(source='status', read_only=True)

    class Meta:
        model = Message
        fields = (
            'MessageID', 'SenderID', 'ReceiverID', 'MessageText', 'Timestamp', 'Status'
        )

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
