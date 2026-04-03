'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { getMessages, sendMessage } from '@/lib/chat/storage';
import { getUser } from '@/lib/auth/getUser';
import { EmptyState } from '../common/EmptyState';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
    threadId: string;
    propertyTitle: string;
    otherUserLabel: string;
}

export const ChatWindow = ({ threadId, propertyTitle, otherUserLabel }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window === 'undefined') return [];
        return getMessages(threadId);
    });
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = getUser();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(() => {
        const msgs = getMessages(threadId);
        setMessages(msgs);
        setIsLoading(false);
    }, [threadId]);

    useEffect(() => {
        // Simple polling for "real-time" experience in mock storage
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (text: string) => {
        if (!currentUser) return;

        sendMessage({
            threadId,
            senderId: currentUser.id,
            text
        });
        fetchMessages();
    };

    return (
        <div className="flex h-full flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <ChatHeader title={propertyTitle} subtitle={otherUserLabel} />

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                {messages.length > 0 ? (
                    <>
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwn={msg.senderId === currentUser?.id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : !isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState
                            title="No messages yet"
                            description="Start the conversation by sending a message below."
                        />
                    </div>
                ) : null}
            </div>

            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};
