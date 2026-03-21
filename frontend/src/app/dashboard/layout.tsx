'use client';

import { ReactNode } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <DashboardShell title="">
                {children}
            </DashboardShell>
        </ProtectedRoute>
    );
}
