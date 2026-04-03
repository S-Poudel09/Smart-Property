'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import api from '@/lib/api/http';
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Clock, Inbox, Loader2, MailOpen, Trash2, ChevronRight, Search } from 'lucide-react';
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
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('notifications/');
                const data = response.data?.results ?? response.data ?? [];
                setNotifications(Array.isArray(data) ? data : []);
            } catch (_err) {
                setError('Failed to load notifications');
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        try {
            await api.patch(`notifications/${id}/mark-read/`);
        } catch (_err) {
            console.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await api.post('notifications/mark-all-read/');
        } catch (_err) {
            console.error('Failed to mark all as read');
        }
    };

    const getIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('success') || t.includes('approved')) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        if (t.includes('warning') || t.includes('submission')) return <Bell className="h-5 w-5 text-primary" />;
        if (t.includes('error') || t.includes('rejected')) return <XCircle className="h-5 w-5 text-rose-500" />;
        if (t.includes('info') || t.includes('system')) return <Info className="h-5 w-5 text-blue-500" />;
        if (t.includes('message')) return <Bell className="h-5 w-5 text-indigo-500" />;
        return <Info className="h-5 w-5 text-primary" />;
    };

    const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.is_read);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-background">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Notifications...</p>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-gray-500 mt-1">Stay updated with property updates, messages, and platform news.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleMarkAllAsRead}
                        disabled={notifications.filter(n => !n.is_read).length === 0}
                        variant="outline"
                        className="h-11 rounded-lg text-xs font-bold px-5 border-border text-gray-600 hover:bg-gray-50 gap-2"
                    >
                        <MailOpen className="h-4 w-4" /> Mark All Read
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filter Sidebar */}
                <aside className="lg:col-span-1 space-y-2">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-primary border border-transparent hover:border-border'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Inbox className="h-4 w-4" /> All Messages
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${filter === 'all' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                            {notifications.length}
                        </span>
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'unread' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-primary border border-transparent hover:border-border'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Bell className="h-4 w-4" /> Unread
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${filter === 'unread' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                            {notifications.filter(n => !n.is_read).length}
                        </span>
                    </button>
                </aside>

                {/* Notification List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <AnimatePresence mode="popLayout">
                            {filtered.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {filtered.map((notif, index) => {
                                        const finalId = notif.id || `notif-${index}`;
                                        return (
                                            <motion.div
                                                key={finalId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`p-6 flex gap-6 hover:bg-gray-50/50 transition-all group ${!notif.is_read ? 'bg-primary/[0.02]' : ''}`}
                                            >
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${!notif.is_read ? 'bg-white border-primary/20 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                    {getIcon(notif.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-1">
                                                        <h3 className={`text-sm font-bold leading-tight ${!notif.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {notif.title}
                                                        </h3>
                                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-white transition-all">
                                                            <Clock className="h-3 w-3" />
                                                            {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Just now'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                                        {notif.message}
                                                    </p>

                                                    <div className="flex items-center gap-6">
                                                        {notif.link && (
                                                            <Link href={notif.link}>
                                                                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                                                    View Details <ChevronRight className="h-3 w-3" />
                                                                </button>
                                                            </Link>
                                                        )}
                                                        {!notif.is_read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(finalId)}
                                                                className="text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                                                            >
                                                                Mark as Read
                                                            </button>
                                                        )}
                                                        <button className="text-xs font-bold text-gray-300 hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-24 text-center px-10">
                                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Inbox className="h-8 w-8 text-gray-200" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-2">No notifications found</h2>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium italic">
                                        We couldn't find any notifications here. Sit back and relax while we monitor your property activity.
                                    </p>
                                    <Link href="/dashboard">
                                        <Button variant="outline" className="h-11 rounded-lg px-8 border-border text-gray-500 font-bold">Return to Dashboard</Button>
                                    </Link>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

