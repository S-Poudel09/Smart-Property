from rest_framework import serializers
from .models import Message, ChatRoom
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'email', 'role')

class MessageSerializer(serializers.ModelSerializer):
    MessageID = serializers.UUIDField(source='id', read_only=True)
    SenderID = serializers.PrimaryKeyRelatedField(source='sender', read_only=True)
    RoomID = serializers.PrimaryKeyRelatedField(source='room', queryset=ChatRoom.objects.all())
    MessageText = serializers.CharField(source='text')
    Timestamp = serializers.DateTimeField(source='timestamp', read_only=True)
    Status = serializers.CharField(source='status', read_only=True)

    class Meta:
        model = Message
        fields = (
            'MessageID', 'SenderID', 'RoomID', 'MessageText', 'Timestamp', 'Status'
        )

class ChatRoomSerializer(serializers.ModelSerializer):
    RoomID = serializers.UUIDField(source='id', read_only=True)
    PropertyID = serializers.PrimaryKeyRelatedField(source='property', read_only=True)
    PropertyTitle = serializers.CharField(source='property.title', read_only=True)
    Participants = ChatUserSerializer(source='participants', many=True, read_only=True)
    LastMessage = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('RoomID', 'PropertyID', 'PropertyTitle', 'Participants', 'LastMessage', 'created_at', 'updated_at')

    def get_LastMessage(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
