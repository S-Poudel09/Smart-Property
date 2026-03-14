from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    """
    Chat System: Send DM and Get Chat History.
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def get_queryset(self):
        # Users should only see messages they sent or received
        user = self.request.user
        if user.role == 'admin':
            return Message.objects.all()
        return Message.objects.filter(Q(sender=user) | Q(receiver=user))

    @action(detail=False, methods=['get'], url_path='history/(?P<user_id>[^/.]+)')
    def history(self, request, user_id=None):
        """
        Get chat history with a specific user.
        """
        user = request.user
        messages = Message.objects.filter(
            (Q(sender=user) & Q(receiver_id=user_id)) |
            (Q(sender_id=user_id) & Q(receiver=user))
        ).order_by('timestamp')
        
        # Mark received messages as READ
        messages.filter(receiver=user, status="SENT").update(status="READ")
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
