'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatRoomComponent from '@/components/chat/ChatRoom';
import { MessageSquare } from 'lucide-react';

function DashboardChatsContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room');

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <header className="flex items-center justify-between pb-5 border-b border-slate-200">
                <div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">Messaging</p>
                    <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                    <p className="text-sm text-slate-500 mt-1">Chat with buyers, sellers, and service providers.</p>
                </div>
            </header>
            <ChatRoomComponent initialRoomId={roomId} />
        </div>
    );
}

export default function DashboardChatsPage() {
    return (
        <Suspense fallback={
            <div className="h-[70vh] flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-slate-300 animate-pulse" />
            </div>
        }>
            <DashboardChatsContent />
        </Suspense>
    );
}
