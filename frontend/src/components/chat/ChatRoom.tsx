'use client';

import { useEffect, useState, useRef } from 'react';
import { getRooms, getRoomMessages, sendMessage, ChatRoom, ChatMessage } from '@/lib/api/chat';
import { getUser } from '@/lib/auth/getUser';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { MessageSquare, Send, User, Home, Clock, Search, MoreVertical, ShieldCheck, Phone, Video, ExternalLink, Calendar, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoomComponentProps {
    initialRoomId?: string | null;
}

import { WebSocketClient } from '@/lib/api/websocket';

export default function ChatRoomComponent({ initialRoomId }: ChatRoomComponentProps) {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const prevMessageCountRef = useRef(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = getUser();

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

        const pollInterval = setInterval(async () => {
            try {
                const data = await getRoomMessages(selectedRoom.RoomID);
                setMessages(prev => {
                    if (data.length !== prev.length || (data.length > 0 && prev.length > 0 && data[data.length - 1].MessageID !== prev[prev.length - 1].MessageID)) {
                        return data;
                    }
                    return prev;
                });
            } catch (e) {
                console.error('Polling failed', e);
            }
        }, 5000);

        return () => {
            clearInterval(pollInterval);
        };
    }, [selectedRoom]);

    useEffect(() => {
        const container = messagesEndRef.current?.parentElement;
        const isNearBottom = container ? (container.scrollHeight - container.scrollTop - container.clientHeight < 150) : true;
        
        if (isNearBottom && (messages.length > prevMessageCountRef.current || (messages.length > 0 && prevMessageCountRef.current === 0))) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom || sending) return;

        const textToSend = newMessage;
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: ChatMessage = {
            MessageID: tempId,
            SenderID: user?.id || '',
            RoomID: selectedRoom.RoomID,
            MessageText: textToSend,
            Status: "SENDING",
            Timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSending(true);

        try {
            const msg = await sendMessage(selectedRoom.RoomID, textToSend);
            setMessages(prev => prev.map(m => m.MessageID === tempId ? msg : m));
        } catch (e) {
            console.error('Failed to send message', e);
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m.MessageID !== tempId));
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="h-[600px] flex items-center justify-center bg-background"><Loader size="lg" /></div>;

    if (rooms.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-20 text-center">
                <EmptyState 
                    title="No Conversations Yet" 
                    description="When you contact a property owner or buyer, your conversations will appear here." 
                    icon={<MessageSquare className="h-12 w-12 text-gray-200" />}
                />
            </div>
        );
    }

    const filteredRooms = rooms.filter(room => {
        const otherParticipant = room.Participants.find(p => p.id !== user?.id);
        const nameMatch = otherParticipant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         otherParticipant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const propertyMatch = room.PropertyTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || propertyMatch;
    });

    return (
        <div className="flex h-[calc(100vh-16rem)] bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Sidebar: Room List */}
            <div className="w-80 md:w-96 border-r border-border flex flex-col bg-gray-50/30">
                <div className="p-6 border-b border-border bg-white">
                    <h2 className="font-bold text-gray-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search chats..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredRooms.map(room => {
                        const otherParticipant = room.Participants.find(p => p.id !== user?.id);
                        const isActive = selectedRoom?.RoomID === room.RoomID;
                        return (
                            <button
                                key={room.RoomID}
                                onClick={() => setSelectedRoom(room)}
                                className={`w-full text-left p-5 hover:bg-white transition-all border-b border-border/50 last:border-0 ${isActive ? 'bg-white shadow-sm ring-1 ring-primary/5' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${isActive ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-400 border-border'}`}>
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                                                {otherParticipant?.first_name || 'Anonymous User'}
                                            </p>
                                            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                                {room.LastMessage ? format(new Date(room.LastMessage.Timestamp), 'HH:mm') : ''}
                                            </span>
                                        </div>
                                        {room.PropertyTitle && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mb-2 bg-gray-50 p-1 px-2 rounded-md w-fit">
                                                <Home className="h-3 w-3 text-primary/60" />
                                                <span className="truncate max-w-[150px]">{room.PropertyTitle}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 truncate font-medium">
                                            {room.LastMessage?.MessageText || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedRoom ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-border flex justify-between items-center shadow-sm z-20 bg-white sticky top-0">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner">
                                    {selectedRoom.Participants.find(p => p.id !== user?.id)?.first_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <h3 className="font-bold text-gray-900 text-sm leading-none mb-1">
                                        {selectedRoom.Participants.find(p => p.id !== user?.id)?.first_name} {selectedRoom.Participants.find(p => p.id !== user?.id)?.last_name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Session</span>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedRoom.PropertyID && (
                                <div className="hidden lg:flex items-center gap-4 bg-gray-50 p-2 pr-4 rounded-xl border border-gray-100 max-w-md animate-in fade-in slide-in-from-right-4">
                                    <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Discussing Asset</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{selectedRoom.PropertyTitle}</p>
                                    </div>
                                    <Link 
                                        href={`/properties/${selectedRoom.PropertyID}`}
                                        className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all ml-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 sm:gap-2 mr-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 hover:bg-primary/10 transition-all hidden md:flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Schedule Visit
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all hidden md:flex items-center gap-2">
                                        <IndianRupee className="h-3 w-3" /> Make Offer
                                    </button>
                                </div>
                                <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block"></div>
                                <button className="h-10 w-10 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-border group">
                                    <MoreVertical className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.SenderID === user?.id;
                                    return (
                                        <motion.div 
                                            key={msg.MessageID || idx} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] space-y-1`}>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-right text-primary/60' : 'text-left text-gray-400'}`}>
                                                    {isMe ? 'You' : (selectedRoom.Participants.find(p => p.id === msg.SenderID)?.role || 'User')}
                                                </div>
                                                <div className={`rounded-2xl px-4 py-3 shadow-sm text-sm font-medium ${
                                                    isMe 
                                                        ? 'bg-primary text-white rounded-br-none shadow-primary/10' 
                                                        : 'bg-white text-gray-800 border border-border rounded-bl-none'
                                                }`}>
                                                    {msg.MessageText}
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isMe ? 'justify-end text-primary/60' : 'text-gray-400'}`}>
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(msg.Timestamp), 'HH:mm')}
                                                    {isMe && msg.Status === 'SENDING' && <Loader size="sm" />}
                                                    {isMe && msg.Status !== 'SENDING' && <ShieldCheck className="h-3 w-3 text-primary" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-border">
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                                <div className="flex-1 relative">
                                    <textarea 
                                        rows={1}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Write a message..."
                                        className="w-full rounded-xl border border-border bg-gray-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none max-h-32"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className="rounded-xl w-12 h-12 p-0 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20"
                                >
                                    {sending ? <Loader size="sm" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                            <MessageSquare className="h-10 w-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Your Conversations</h3>
                        <p className="text-sm text-gray-500 max-w-sm font-medium italic">
                            Select a chat from the sidebar to view messages and start communicating.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

