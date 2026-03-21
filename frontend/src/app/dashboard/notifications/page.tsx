'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import api from '@/lib/api/http';
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Clock, Check, Inbox, Loader2, Crown, Sparkles, ScrollText, MailOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at?: string;
    link?: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/notifications/');
                const data = response.data?.results ?? response.data ?? [];
                setNotifications(Array.isArray(data) ? data : []);
            } catch (_err) {
                setError('Failed to summon imperial correspondence');
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        try {
            await api.patch(`/notifications/${id}/mark_read/`);
        } catch (_err) {
            console.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await api.post('/notifications/mark_all_read/');
        } catch (_err) {
            console.error('Failed to mark all as read');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'ERROR': return <XCircle className="h-5 w-5 text-rose-500" />;
            default: return <Info className="h-5 w-5 text-accent" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 min-h-screen bg-[#fffdf9]">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-16 w-16 border-4 border-accent border-t-transparent rounded-full shadow-gold-glow mb-8"
                />
                <p className="text-accent font-black uppercase tracking-[0.3em] text-[10px]">Summoning Correspondence...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-40 bg-[#fffdf9] min-h-screen">
                <p className="font-serif text-2xl text-red-600 mb-8 italic">"{error}"</p>
                <Button 
                    onClick={() => window.location.reload()}
                    className="h-14 px-10 bg-primary text-accent rounded-full font-black uppercase tracking-widest text-[10px] border border-accent/30"
                >
                    Retry Manifest
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#fffdf9] min-h-screen pb-32">
            {/* Elegant Header */}
            <div className="bg-primary text-white py-24 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-end gap-12"
                    >
                        <div className="max-w-4xl text-left">
                            <div className="flex items-center gap-3 mb-6">
                                <Crown className="h-6 w-6 text-accent" />
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Imperial Messenger</span>
                            </div>
                            <h1 className="text-6xl lg:text-8xl font-serif mb-6 leading-[0.9]">Correspondence</h1>
                            <p className="text-xl text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8">
                                Staying updated with the latest decrees and activities within the realm.
                            </p>
                        </div>
                        <Button
                            onClick={handleMarkAllAsRead}
                            disabled={notifications.filter(n => !n.is_read).length === 0}
                            className="h-16 px-10 bg-white/10 backdrop-blur-xl border border-white/20 text-accent rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-accent hover:text-primary shadow-xl gap-3 transition-all group"
                        >
                            <MailOpen className="h-4 w-4 group-hover:scale-110 transition-transform" /> Seal All Correspondence
                        </Button>
                    </motion.div>
                </Container>
            </div>

            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-accent/10 shadow-3xl overflow-hidden shadow-gold-glow/5">
                        <AnimatePresence mode="popLayout">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-accent/5">
                                    {notifications.map((notif, idx) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-8 flex gap-8 hover:bg-white/80 transition-all relative group ${!notif.is_read ? 'bg-white shadow-inner' : ''}`}
                                        >
                                            {!notif.is_read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent shadow-gold-glow"></div>
                                            )}

                                            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${!notif.is_read ? 'bg-primary text-accent border border-accent/30' : 'bg-gray-50 border border-gray-100 text-gray-400'
                                                }`}>
                                                {getIcon(notif.type)}
                                            </div>

                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex items-start justify-between gap-6 mb-3">
                                                    <h3 className={`text-xl font-serif leading-tight ${!notif.is_read ? 'text-primary' : 'text-gray-500'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <div className="flex items-center text-[9px] text-accent font-black uppercase tracking-widest gap-2 shrink-0 bg-accent/5 px-3 py-1 rounded-full border border-accent/10">
                                                        <Clock className="h-3 w-3" />
                                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Now'}
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 font-medium italic mb-6 line-clamp-2 leading-relaxed">
                                                    "{notif.message}"
                                                </p>

                                                <div className="flex items-center gap-6">
                                                    {notif.link && (
                                                        <Link href={notif.link}>
                                                            <Button className="h-10 px-6 text-[9px] font-black uppercase tracking-widest rounded-full bg-primary text-white hover:bg-accent hover:text-primary transition-all">
                                                                Follow Decree
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {!notif.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notif.id)}
                                                            className="text-[9px] font-black text-accent hover:text-primary uppercase tracking-[0.2em] flex items-center gap-2 group/mark"
                                                        >
                                                            <div className="h-px w-4 bg-accent group-hover/mark:w-8 transition-all" /> Seal Individual
                                                        </button>
                                                    )}
                                                    {notif.is_read && (
                                                         <button className="text-[9px] font-black text-gray-300 hover:text-red-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-auto group/del">
                                                            <Trash2 className="h-3 w-3 group-hover/del:scale-110 transition-transform" /> Purge Records
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-40 text-center"
                                >
                                    <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white shadow-inner">
                                        <Inbox className="h-10 w-10 text-gray-200" />
                                    </div>
                                    <h2 className="text-4xl font-serif text-primary mb-4">Total Silence</h2>
                                    <p className="text-gray-400 max-w-sm mx-auto font-medium italic">
                                        The imperial messengers have no decrees for you at this hour. Revel in the tranquility.
                                    </p>
                                    <div className="mt-12 flex justify-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-accent/10" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-accent/30" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-accent/10" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Container>
        </div>
    );
}

