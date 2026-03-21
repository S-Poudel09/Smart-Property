'use client';

import { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/auth/getUser';
import { getUnreadCount } from '@/lib/notifications/storage';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBell = () => {
    const [count, setCount] = useState(0);
    const user = getUser();

    useEffect(() => {
        const updateCount = () => {
            if (user?.user_id) {
                setCount(getUnreadCount(user.user_id));
            }
        };

        updateCount();
        const handleNewNotif = () => updateCount();
        window.addEventListener('smartproperty_new_notification', handleNewNotif);

        const interval = setInterval(updateCount, 5000);

        return () => {
            window.removeEventListener('smartproperty_new_notification', handleNewNotif);
            clearInterval(interval);
        };
    }, [user?.user_id]);

    if (!user) return null;

    return (
        <Link href="/dashboard/notifications" className="relative group p-2">
            <div className="relative z-10 p-2 rounded-2xl bg-white/50 border border-accent/10 text-primary hover:bg-white hover:text-accent hover:border-accent/40 hover:shadow-xl transition-all duration-300">
                <Bell className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            </div>
            
            <AnimatePresence>
                {count > 0 && (
                    <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-xl bg-primary text-[9px] font-black text-accent ring-2 ring-white shadow-2xl z-20"
                    >
                        {count > 9 ? '9+' : count}
                    </motion.span>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
    );
};
