'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/http';
import {
    Bell, CheckCircle2, Info, XCircle, Clock, Inbox,
    MailOpen, Trash2, ChevronRight, Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from '@/components/common/Loader';

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
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('notifications/');
                const data = response.data?.results ?? response.data ?? [];
                setNotifications(Array.isArray(data) ? data : []);
            } catch (_err) {
                setNotifications([]);
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
        if (t.includes('success') || t.includes('approved')) return <CheckCircle2 className="h-5 w-5 text-indigo-500" />;
        if (t.includes('warning') || t.includes('submission')) return <Zap className="h-5 w-5 text-amber-500" />;
        if (t.includes('error') || t.includes('rejected')) return <XCircle className="h-5 w-5 text-red-500" />;
        if (t.includes('info') || t.includes('system')) return <Info className="h-5 w-5 text-blue-500" />;
        return <Bell className="h-5 w-5 text-slate-400" />;
    };

    const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.is_read);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
                <div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">Inbox</p>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                    </p>
                </div>
                <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <MailOpen className="h-4 w-4" /> Mark all read
                </button>
            </header>

            <div className="flex gap-2">
                {(['all', 'unread'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            filter === f
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {f === 'all' ? <Inbox className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                        {f === 'all' ? 'All' : 'Unread'}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {f === 'all' ? notifications.length : unreadCount}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filtered.map((notif, index) => {
                                const finalId = notif.id || `notif-${index}`;
                                return (
                                    <motion.div
                                        key={finalId}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ delay: index * 0.04 }}
                                        className={`px-5 py-4 flex gap-4 hover:bg-slate-50/80 transition-all group relative ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        {!notif.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 rounded-r" />
                                        )}

                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!notif.is_read ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-50'}`}>
                                            {getIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className={`text-sm font-semibold leading-snug ${!notif.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                                                    {notif.title}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {notif.created_at && (
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {!notif.is_read && (
                                                        <div className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>

                                            <p className={`text-sm mt-1 leading-relaxed ${!notif.is_read ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {notif.message}
                                            </p>

                                            <div className="flex items-center gap-4 mt-2.5">
                                                {notif.link && (
                                                    <Link href={notif.link}>
                                                        <button className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 transition-colors">
                                                            View details <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    </Link>
                                                )}
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(finalId)}
                                                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                                <button className="ml-auto h-7 w-7 rounded-lg flex items-center justify-center text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Bell className="h-7 w-7 text-slate-300" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-700">You&apos;re all caught up</h2>
                            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                                {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
