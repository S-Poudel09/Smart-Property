import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Check if user is participant
        if not await self.is_participant(self.room_id, self.user):
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get('message')
        
        if not message_text:
            return

        # Save message to DB
        message_obj = await self.save_message(self.room_id, self.user, message_text)
        
        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'MessageID': str(message_obj.id),
                    'SenderID': str(self.user.id),
                    'RoomID': str(self.room_id),
                    'MessageText': message_obj.text,
                    'Timestamp': message_obj.timestamp.isoformat(),
                    'Status': message_obj.status
                }
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def is_participant(self, room_id, user):
        try:
            room = ChatRoom.objects.get(id=room_id)
            return room.participants.filter(id=user.id).exists()
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, room_id, user, text):
        room = ChatRoom.objects.get(id=room_id)
        msg = Message.objects.create(room=room, sender=user, text=text)
        room.save() # trigger updated_at
        return msg
