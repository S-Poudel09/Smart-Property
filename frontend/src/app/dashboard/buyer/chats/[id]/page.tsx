'use client';

import { use } from 'react';
import { Suspense } from 'react';
import ChatRoomComponent from '@/components/chat/ChatRoom';
import Container from '@/components/layout/Container';

function BuyerChatDetailContent({ id }: { id: string }) {
    return (
        <Container className="py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500 mt-1">Connect with sellers</p>
            </div>
            <ChatRoomComponent initialRoomId={id} />
        </Container>
    );
}

export default function BuyerChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={<div>Loading chat...</div>}>
            <BuyerChatDetailContent id={id} />
        </Suspense>
    );
}
