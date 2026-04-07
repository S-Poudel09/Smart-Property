'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { getRooms, getRoomMessages, sendMessage, ChatRoom, ChatMessage } from '@/lib/api/chat';
import { getUser } from '@/lib/auth/getUser';
import { Loader } from '@/components/common/Loader';
import Link from 'next/link';
import {
    MessageSquare, Send, Building, Search,
    ChevronLeft, CheckCheck, Clock, ShieldCheck,
    ExternalLink, Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const prevMessageCountRef = useRef(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = getUser();
    const currentUserId = useMemo(() => String(user?.id || user?.user_id || ''), [user]);

    const getDisplayName = (participant: { full_name?: string; first_name?: string; last_name?: string; email?: string; role?: string } | undefined) => {
        if (!participant) return 'Anonymous User';
        if (participant.full_name) return participant.full_name;
        const fullName = `${participant.first_name || ''} ${participant.last_name || ''}`.trim();
        if (fullName) return fullName;
        if (participant.email) return participant.email.split('@')[0];
        return `Authorized ${participant.role || 'Node'}`;
    };

    const loadRooms = useCallback(async () => {
        try {
            const data = await getRooms();
            setRooms(data);
            if (initialRoomId && !selectedRoom) {
                const room = data.find(r => r.RoomID === initialRoomId);
                if (room) setSelectedRoom(room);
            }
        } catch (e) {
            console.error('Failed to load rooms', e);
        } finally {
            setLoading(false);
        }
    }, [initialRoomId, selectedRoom]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

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
            if (document.hidden) return;
            try {
                const data = await getRoomMessages(selectedRoom.RoomID);
                setMessages(prev => (data.length !== prev.length ? data : prev));
            } catch (e) {
                console.error('Polling failed', e);
            }
        }, 5000);
        return () => clearInterval(pollInterval);
    }, [selectedRoom]);

    useEffect(() => {
        if (messages.length === 0) return;
        const container = messagesEndRef.current?.parentElement;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250;
        const lastMessage = messages[messages.length - 1];
        const isMyMessage = String(lastMessage.SenderID) === currentUserId;
        const isFirstLoad = prevMessageCountRef.current === 0;
        if (isFirstLoad || isMyMessage || isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: isFirstLoad ? 'auto' : 'smooth' });
        }
        prevMessageCountRef.current = messages.length;
    }, [messages, currentUserId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom || sending) return;
        const textToSend = newMessage;
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: ChatMessage = {
            MessageID: tempId,
            SenderID: currentUserId,
            RoomID: selectedRoom.RoomID,
            MessageText: textToSend,
            Status: 'SENDING',
            Timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSending(true);
        try {
            const msg = await sendMessage(selectedRoom.RoomID, textToSend);
            setMessages(prev => prev.map(m => m.MessageID === tempId ? msg : m));
            loadRooms();
        } catch (e) {
            console.error('Failed to send message', e);
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m.MessageID !== tempId));
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="h-[750px] flex items-center justify-center bg-white rounded-[2rem] border border-slate-200">
            <Loader size="lg" />
        </div>
    );

    const filteredRooms = rooms.filter(room => {
        const other = room.Participants.find(p => String(p.id) !== currentUserId);
        const name = getDisplayName(other).toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || (room.PropertyTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex h-[750px] bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden relative">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-[340px]' : 'w-0'} transition-all duration-500 border-r border-slate-100 bg-white flex flex-col shrink-0 overflow-hidden relative z-20`}>
                <div className="p-8 border-b border-slate-100 shrink-0 bg-slate-50/30">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900 font-outfit uppercase tracking-tighter italic">Channels</h2>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">{rooms.length} NODES</span>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search identities or assets..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 outline-none transition-all placeholder:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredRooms.length === 0 ? (
                        <div className="text-center py-24 px-8">
                            <MessageSquare className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero Active Signals</p>
                        </div>
                    ) : filteredRooms.map(room => {
                        const otherParticipant = room.Participants.find(p => String(p.id) !== currentUserId);
                        const isActive = selectedRoom?.RoomID === room.RoomID;
                        const name = getDisplayName(otherParticipant);
                        
                        return (
                            <button
                                key={room.RoomID}
                                onClick={() => setSelectedRoom(room)}
                                className="w-full group px-2"
                            >
                                <div className={`flex gap-4 p-4 rounded-2xl items-center transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-50 border border-transparent'}`}>
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-indigo-400 shadow-xl shadow-slate-900/10'}`}>
                                        {name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className={`text-[11px] font-black truncate uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                                {name}
                                            </p>
                                            <span className={`text-[9px] font-bold ml-2 flex-shrink-0 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                                {room.LastMessage ? format(new Date(room.LastMessage.Timestamp), 'HH:mm') : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            {room.PropertyTitle && (
                                              <Building className={`h-2.5 w-2.5 shrink-0 ${isActive ? 'text-white/40' : 'text-indigo-400'}`} />
                                            )}
                                            <p className={`text-[10px] truncate font-medium italic ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                                {room.LastMessage?.MessageText || room.PropertyTitle || 'Signal established...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30 relative">
                {selectedRoom ? (
                    <>
                        <header className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
                            <div className="flex items-center gap-4 min-w-0">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors lg:hidden rounded-xl border border-slate-100"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div className="h-12 w-12 bg-slate-900 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-slate-900/10 border-2 border-white shrink-0">
                                    {getDisplayName(selectedRoom.Participants.find(p => String(p.id) !== currentUserId))[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">
                                        {getDisplayName(selectedRoom.Participants.find(p => String(p.id) !== currentUserId))}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        {selectedRoom.PropertyTitle ? (
                                            <div className="flex items-center gap-1.5">
                                                <Building className="h-3 w-3 text-indigo-500" />
                                                <p className="text-[9px] font-black text-slate-400 truncate max-w-[200px] uppercase tracking-widest">{selectedRoom.PropertyTitle}</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3 text-indigo-500" />
                                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] animate-pulse">Encrypted Session</p>
                                            </div>
                                        )}
                                        {selectedRoom.Participants.find(p => String(p.id) !== currentUserId)?.role && (
                                            <span className="h-4 px-2 bg-slate-50 border border-slate-100 rounded text-[8px] font-black uppercase text-slate-500 flex items-center">
                                                {selectedRoom.Participants.find(p => String(p.id) !== currentUserId)?.role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedRoom.PropertyID && (
                                    <Link href={`/properties/${selectedRoom.PropertyID}`}>
                                        <button className="h-10 px-5 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 rounded-xl transition-all group active:scale-95">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Asset Specs</span>
                                            <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </Link>
                                )}
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked</span>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 custom-scrollbar pb-36">
                            <AnimatePresence mode="popLayout">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-24"><Loader /></div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-200">
                                        <Tag className="h-8 w-8 mb-4 opacity-50" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] font-outfit italic">System established. Send a signal.</p>
                                    </div>
                                ) : messages.map((msg, idx) => {
                                    const isMe = String(msg.SenderID) === currentUserId;
                                    const isFirstOfDay = idx === 0 || format(new Date(msg.Timestamp), 'yyyyMMdd') !== format(new Date(messages[idx - 1].Timestamp), 'yyyyMMdd');
                                    return (
                                        <div key={msg.MessageID || idx}>
                                            {isFirstOfDay && (
                                                <div className="flex justify-center my-12">
                                                    <span className="bg-white border border-slate-100 px-6 py-2 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] shadow-sm italic">
                                                        {format(new Date(msg.Timestamp), 'EEEE, MMMM dd')}
                                                    </span>
                                                </div>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, x: isMe ? 20 : -20, y: 10 }}
                                                animate={{ opacity: 1, x: 0, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`
                                                    max-w-[75%] group relative
                                                    ${isMe ? 'items-end' : 'items-start'}
                                                `}>
                                                    <div className={`
                                                        px-7 py-5 rounded-[2rem] text-[13px] font-medium leading-relaxed italic
                                                        ${isMe
                                                            ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 rounded-tr-sm'
                                                            : 'bg-white text-slate-900 border border-slate-100 shadow-xl shadow-slate-200/40 rounded-tl-sm'
                                                        }
                                                    `}>
                                                        <p className="break-words">{msg.MessageText}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 mt-2 px-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                            {format(new Date(msg.Timestamp), 'HH:mm:ss')}
                                                        </span>
                                                        {isMe && (
                                                            msg.Status === 'SENDING'
                                                                ? <Clock className="h-2.5 w-2.5 text-slate-300 animate-pulse" />
                                                                : <CheckCheck className="h-2.5 w-2.5 text-indigo-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        <footer className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pt-12 z-10">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-end bg-white border border-slate-200 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-200/50 focus-within:ring-8 focus-within:ring-indigo-600/5 focus-within:border-indigo-600/20 transition-all">
                                <div className="flex-1 px-5">
                                    <textarea
                                        rows={1}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Transmit signal..."
                                        className="w-full bg-transparent py-4 text-sm font-semibold outline-none resize-none max-h-32 text-slate-900 placeholder:text-slate-300 italic"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="h-16 w-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all disabled:opacity-20 disabled:grayscale shadow-xl shadow-slate-900/10 flex-shrink-0 group active:scale-95"
                                >
                                    {sending ? <Loader size="sm" /> : <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden bg-white">
                        <div className="absolute inset-0 bg-slate-50/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                        <div className="relative z-10">
                            <div className="h-28 w-28 bg-slate-50 border border-slate-100 rounded-[3rem] flex items-center justify-center mb-10 mx-auto shadow-inner group hover:scale-110 transition-transform duration-700">
                                <MessageSquare className="h-12 w-12 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter italic">Establish Connection</h3>
                            <p className="text-sm font-medium text-slate-400 mt-4 max-w-xs mx-auto italic leading-relaxed">
                                &quot;Select a transmission node from the sidebar to initialize encrypted data exchange.&quot;
                            </p>
                            <div className="mt-12 flex flex-wrap justify-center gap-4">
                                <div className="px-5 py-2.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100/50 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" /> E2E Protocol Active
                                </div>
                                <div className="px-5 py-2.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 flex items-center gap-2">
                                    <VerifiedIcon className="h-3 w-3" /> Verified Channel
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const VerifiedIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
