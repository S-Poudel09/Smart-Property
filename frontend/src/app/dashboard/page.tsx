'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { Loader } from '@/components/common/Loader';

export default function DashboardPage() {
    const router = useRouter();
    const user = getUser();
    
    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const role = user.role?.toLowerCase();
        if (role === 'admin') router.push('/dashboard/admin');
        else if (role === 'seller') router.push('/dashboard/seller');
        else router.push('/dashboard/buyer');
    }, [user, router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <Loader size="lg" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Syncing Registry Access...</p>
        </div>
    );
}
