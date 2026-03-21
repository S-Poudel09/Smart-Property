'use client';

import ChatRoomComponent from '@/components/chat/ChatRoom';
import Container from '@/components/layout/Container';

export default function SellerChatsPage() {
    return (
        <Container className="py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
                <p className="text-gray-500 mt-1">Connect with potential buyers</p>
            </div>
            <ChatRoomComponent />
        </Container>
    );
}
