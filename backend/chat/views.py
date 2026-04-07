from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message, ChatRoom
from .serializers import MessageSerializer, ChatRoomSerializer
from properties.models import Property

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user).order_by('-updated_at')

    @action(detail=False, methods=['post'])
    def get_or_create_room(self, request):
        property_id = request.data.get('property_id')
        recipient_id = request.data.get('recipient_id')
        
        if not recipient_id:
            return Response({"error": "recipient_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing room for this property and participants
        rooms = ChatRoom.objects.filter(participants=request.user).filter(participants=recipient_id)
        if property_id:
            rooms = rooms.filter(property_id=property_id)
        else:
            rooms = rooms.filter(property__isnull=True)

        if rooms.exists():
            room = rooms.first()
        else:
            try:
                from accounts.models import User
                try:
                    import uuid
                    # Validate identifier format before query to prevent 500 errors on invalid strings
                    uuid.UUID(str(recipient_id))
                    recipient = User.objects.get(id=recipient_id)
                except (ValueError, User.DoesNotExist):
                    return Response({"error": "Recipient identity not verified or does not exist"}, status=status.HTTP_404_NOT_FOUND)
                
                room = ChatRoom.objects.create(property_id=property_id)
                room.participants.add(request.user, recipient)
            except User.DoesNotExist:
                return Response({"error": "Recipient does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(ChatRoomSerializer(room).data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return Message.objects.filter(room_id=room_id, room__participants=self.request.user)
        return Message.objects.filter(room__participants=self.request.user)

    def perform_create(self, serializer):
        room = serializer.validated_data.get('room')
        # Security check: Ensure sender is a participant
        if not room.participants.filter(id=self.request.user.id).exists():
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You are not a participant in this room")
        serializer.save(sender=self.request.user)
        room.save() # Update room's updated_at timestamp

    @action(detail=False, methods=['get'], url_path='room/(?P<room_id>[^/.]+)')
    def room_messages(self, request, room_id=None):
        import uuid
        try:
            uuid.UUID(str(room_id))
        except ValueError:
            return Response({"error": "Invalid room ID format"}, status=status.HTTP_400_BAD_REQUEST)
            
        messages = Message.objects.filter(room_id=room_id, room__participants=request.user).order_by('timestamp')
        # Mark as read
        messages.exclude(sender=request.user).update(status="READ")
        return Response(self.get_serializer(messages, many=True).data)
