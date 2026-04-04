import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/auth/getUser';
import { getNotifications, Notification } from '@/lib/api/notifications';
import { motion, AnimatePresence } from 'framer-motion';

import { WebSocketClient } from '@/lib/api/websocket';

export const NotificationBell = () => {
    const [count, setCount] = useState(0);
    const user = getUser();

    const updateCountFromData = useCallback((data: any) => {
        // If data is a list (initial load), count unread. 
        // If it's a single notification object (WS update), increment.
        if (Array.isArray(data)) {
            setCount(data.filter((n: any) => !n.is_read).length);
        } else if (data.id) {
            setCount(prev => prev + 1);
        }
    }, []);

    const fetchInitialCount = useCallback(async () => {
        if (!user) return;
        
        // Check for token to avoid 401 overlay if session is stale
        const token = typeof window !== 'undefined' ? localStorage.getItem('smartproperty_token') : null;
        if (!token) return;

        try {
            const data = await getNotifications();
            const notifications = Array.isArray(data) ? data : (data as any).results || [];
            updateCountFromData(notifications);
        } catch (error) {
            console.warn('Silent failure: background notification fetch failed');
        }
    }, [user?.id, updateCountFromData]);

    useEffect(() => {
        if (!user) return;
        
        // Fetch initial state
        fetchInitialCount();

        // Connection disabled as WebSocket functionality has been removed.
        // Reverting to standard HTTP-based fetching for now.
        /*
        const ws = new WebSocketClient('ws/notifications/', (data) => {
            console.log('[WS NOTIF] Received:', data);
            updateCountFromData(data);
        });
        
        ws.connect();

        return () => ws.disconnect();
        */
    }, [user?.id, fetchInitialCount, updateCountFromData]);

    if (!user) return null;

    return (
        <Link href="/dashboard/notifications" className="relative group p-2">
            <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                count > 0 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 hover:bg-indigo-500 hover:text-white shadow-sm' 
                : 'bg-white/50 border border-slate-200/50 text-slate-400 hover:bg-white hover:text-indigo-600'
            }`}>
                <Bell className={`h-5 w-5 group-hover:rotate-12 transition-transform ${count > 0 ? 'animate-pulse' : ''}`} />
            </div>
            
            <AnimatePresence>
                {count > 0 && (
                    <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-xl bg-red-500 text-[9px] font-black text-white ring-2 ring-white shadow-2xl z-20"
                    >
                        {count > 9 ? '9+' : count}
                    </motion.span>
                )}
            </AnimatePresence>

            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${count > 0 ? 'bg-indigo-500/20' : 'bg-slate-400/10'}`} />
        </Link>
    );
};
