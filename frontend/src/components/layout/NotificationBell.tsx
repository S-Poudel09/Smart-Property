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
        try {
            const data = await getNotifications();
            const notifications = Array.isArray(data) ? data : (data as any).results || [];
            updateCountFromData(notifications);
        } catch (error) {
            console.error('Failed to fetch initial notification count:', error);
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
            <div className={`relative z-10 p-2 rounded-2xl transition-all duration-300 ${
                count > 0 
                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white' 
                : 'bg-white/50 border border-accent/10 text-gray-400 hover:bg-white hover:text-primary'
            }`}>
                <Bell className={`h-6 w-6 group-hover:rotate-12 transition-transform ${count > 0 ? 'animate-pulse' : ''}`} />
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

            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${count > 0 ? 'bg-primary/20' : 'bg-gray-400/10'}`} />
        </Link>
    );
};
