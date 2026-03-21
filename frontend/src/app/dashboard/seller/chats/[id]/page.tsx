'use client';

import { use, useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth/mockAuth';
import { getThreadById, getThreadsForSeller } from '@/lib/chat/storage';
import { getPropertyById } from '@/lib/properties/storage';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { ChatThreadList } from '@/components/chat/ChatThreadList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatThread } from '@/types/chat';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const user = getCurrentUser();
    const [threads, setThreads] = useState<ChatThread[]>(() => {
        if (typeof window === 'undefined' || !user) return [];
        const sellerThreads = getThreadsForSeller(user.id);
        return sellerThreads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    });
    const [isLoading, setIsLoading] = useState(false);

    const thread = getThreadById(id);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    const isUnauthorized = thread && thread.sellerId !== user?.id;

    if (!thread || isUnauthorized) {
        return (
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isUnauthorized ? 'Unauthorized Access' : 'Conversation Not Found'}
                </h2>
                <p className="mt-2 text-gray-500">
                    {isUnauthorized
                        ? 'You do not have permission to view this conversation.'
                        : 'The conversation you are looking for does not exist.'}
                </p>
                <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
                    Back to Home
                </Link>
            </Container>
        );
    }

    const property = getPropertyById(thread.propertyId) || MOCK_PROPERTIES.find(p => p.id === thread.propertyId);

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/seller/chats" className="mb-6 inline-flex lg:hidden items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Inquiries
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
                        <div className="lg:col-span-1 hidden lg:block h-full overflow-hidden">
                            <ChatThreadList
                                threads={threads}
                                activeThreadId={id}
                                baseUrl="/dashboard/seller/chats"
                            />
                        </div>
                        <div className="lg:col-span-2 h-full">
                            <ChatWindow
                                threadId={id}
                                propertyTitle={property?.title || 'Unknown Property'}
                                otherUserLabel={`Potential Buyer (ID: ${thread.buyerId})`}
                            />
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
