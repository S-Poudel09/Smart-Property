'use client';

import { useEffect, useState, useRef } from 'react';
import { getRooms, getRoomMessages, sendMessage, ChatRoom, ChatMessage } from '@/lib/api/chat';
import { getCurrentUser } from '@/lib/auth/mockAuth';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { MessageSquare, Send, User, Home, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ChatRoomComponentProps {
    initialRoomId?: string | null;
}

export default function ChatRoomComponent({ initialRoomId }: ChatRoomComponentProps) {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = getCurrentUser();

    useEffect(() => {
        const loadRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
                if (initialRoomId) {
                    const room = data.find(r => r.RoomID === initialRoomId);
                    if (room) setSelectedRoom(room);
                } else if (data.length > 0 && !selectedRoom) {
                    setSelectedRoom(data[0]);
                }
            } catch (e) {
                console.error('Failed to load rooms', e);
            } finally {
                setLoading(false);
            }
        };
        loadRooms();
    }, [initialRoomId]);

    useEffect(() => {
        if (!selectedRoom) return;

        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const data = await getRoomMessages(selectedRoom.RoomID);
                setMessages(data);
            } catch (e) {
                console.error('Failed to load messages', e);
            } finally {
                setLoadingMessages(false);
            }
        };

        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom || sending) return;

        setSending(true);
        try {
            const msg = await sendMessage(selectedRoom.RoomID, newMessage);
            setMessages(prev => [...prev, msg]);
            setNewMessage('');
        } catch (e) {
            console.error('Failed to send message', e);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader size="lg" /></div>;

    if (rooms.length === 0) {
        return <EmptyState 
            title="No Conversations Yet" 
            description="Start a conversation with a seller from any property page." 
            icon={<MessageSquare className="h-12 w-12 text-gray-300" />}
        />;
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Sidebar: Room List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-900">Recent Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {rooms.map(room => (
                        <button
                            key={room.RoomID}
                            onClick={() => setSelectedRoom(room)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b last:border-0 ${selectedRoom?.RoomID === room.RoomID ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                            {room.Participants.find(p => p.id !== user?.id)?.first_name || 'User'}
                                        </p>
                                        <span className="text-[10px] text-gray-400">
                                            {room.LastMessage ? format(new Date(room.LastMessage.Timestamp), 'p') : ''}
                                        </span>
                                    </div>
                                    {room.PropertyTitle && (
                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                                            <Home className="h-3 w-3" />
                                            <span className="truncate">{room.PropertyTitle}</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 truncate">
                                        {room.LastMessage?.MessageText || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedRoom ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {selectedRoom.Participants.find(p => p.id !== user?.id)?.first_name?.[0] || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        {selectedRoom.Participants.find(p => p.id !== user?.id)?.first_name} {selectedRoom.Participants.find(p => p.id !== user?.id)?.last_name}
                                    </h3>
                                    {selectedRoom.PropertyTitle && (
                                        <p className="text-[11px] text-gray-500">Subject: {selectedRoom.PropertyTitle}</p>
                                    )}
                                </div>
                            </div>
                            {user?.role === 'buyer' && selectedRoom.PropertyID && (
                                <Button 
                                    size="sm" 
                                    variant="primary" 
                                    onClick={async () => {
                                        try {
                                            const { createTransaction } = await import('@/lib/api/transactions');
                                            const sellerId = selectedRoom.Participants.find(p => p.id !== user?.id)?.id;
                                            if (!sellerId) return;
                                            // For demo, we'd need the property price. We'll use a placeholder or better, fetch it.
                                            // Assuming total_amount is required.
                                            await createTransaction(selectedRoom.PropertyID as string, sellerId, 100000); // Placeholder price
                                            toast.success('Transaction initiated! Redirecting...');
                                            window.location.href = '/dashboard/transactions';
                                        } catch (e) {
                                            toast.error('Failed to initiate transaction');
                                        }
                                    }}
                                    className="rounded-full !py-1.5 font-bold"
                                >
                                    Initiate Purchase
                                </Button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.MessageID} 
                                    className={`flex ${msg.SenderID === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                                        msg.SenderID === user?.id 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white text-gray-900 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm">{msg.MessageText}</p>
                                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${
                                            msg.SenderID === user?.id ? 'text-blue-100' : 'text-gray-400'
                                        }`}>
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(msg.Timestamp), 'p')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 rounded-full border-gray-100 border bg-gray-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={!newMessage.trim() || sending}
                                    className="rounded-full w-10 !! h-10 p-0 flex items-center justify-center shrink-0"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
