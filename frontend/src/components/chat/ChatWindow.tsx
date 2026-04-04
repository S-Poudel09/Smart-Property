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
    const prevMessageCountRef = useRef(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = getUser();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(() => {
        const msgs = getMessages(threadId);
        setMessages(prev => {
            if (msgs.length !== prev.length || (msgs.length > 0 && prev.length > 0 && msgs[msgs.length - 1].id !== prev[prev.length - 1].id)) {
                return msgs;
            }
            return prev;
        });
        setIsLoading(false);
    }, [threadId]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!document.hidden) fetchMessages();
        }, 3000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        const container = messagesEndRef.current?.parentElement;
        const isNearBottom = container ? (container.scrollHeight - container.scrollTop - container.clientHeight < 150) : true;
        
        if (isNearBottom && (messages.length > prevMessageCountRef.current || (messages.length > 0 && prevMessageCountRef.current === 0))) {
            scrollToBottom();
        }
        prevMessageCountRef.current = messages.length;
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
