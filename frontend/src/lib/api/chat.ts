import api from './http';

export interface ChatMessage {
    MessageID: string;
    SenderID: string;
    RoomID: string;
    MessageText: string;
    Status: string;
    Timestamp: string;
}

export interface ChatRoom {
    RoomID: string;
    PropertyID: string | null;
    PropertyTitle: string | null;
    Participants: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
    }[];
    LastMessage: ChatMessage | null;
    created_at: string;
    updated_at: string;
}

export const getRooms = async (): Promise<ChatRoom[]> => {
    const response = await api.get('chat/rooms/');
    return response.data;
};

export const getOrCreateRoom = async (recipientId: string, propertyId?: string): Promise<ChatRoom> => {
    const response = await api.post('chat/rooms/get_or_create_room/', { 
        recipient_id: recipientId, 
        property_id: propertyId 
    });
    return response.data;
};

export const getRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`chat/messages/room/${roomId}/`);
    return response.data;
};

export const sendMessage = async (roomId: string, text: string): Promise<ChatMessage> => {
    const response = await api.post('chat/messages/', { 
        RoomID: roomId, 
        MessageText: text 
    });
    return response.data;
};
