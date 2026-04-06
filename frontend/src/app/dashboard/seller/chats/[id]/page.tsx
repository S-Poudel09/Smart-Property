'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatRoomComponent from '@/components/chat/ChatRoom';
import Container from '@/components/layout/Container';

function SellerChatDetailContent({ id }: { id: string }) {
    return (
        <Container className="py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
                <p className="text-gray-500 mt-1">Connect with potential buyers</p>
            </div>
            <ChatRoomComponent initialRoomId={id} />
        </Container>
    );
}

export default function SellerChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={<div>Loading chat...</div>}>
            <SellerChatDetailContent id={id} />
        </Suspense>
    );
}
