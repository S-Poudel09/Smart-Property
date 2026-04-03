'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthFromStorage } from '@/lib/auth/storage';
import { getUser } from '@/lib/auth/getUser';
import { UserRole } from '@/types/user';
import { Loader } from '../common/Loader';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const { accessToken: token, userRole: role } = getAuthFromStorage();
            
            if (!token) {
                router.push('/auth/login');
                return;
            }

            let userRole = role?.toLowerCase();

            // Fallback: If role is missing in storage, try to get it from token
            if (!userRole) {
                const user = getUser();
                if (user?.role) {
                    userRole = user.role.toLowerCase();
                    localStorage.setItem('userRole', userRole);
                } else {
                    router.push('/auth/login');
                    return;
                }
            }
            
            const currentPath = window.location.pathname;

            // Global routes under /dashboard that any authenticated user can access
            const globalWhitelist = [
                '/dashboard/profile',
                '/dashboard/notifications'
            ];

            const isWhitelisted = globalWhitelist.some(path => currentPath.startsWith(path));

            // Check if user role is allowed for this component
            if (allowedRoles && !allowedRoles.includes(userRole as UserRole)) {
                router.push('/');
                return;
            }

            // Route-based blocking: Buyers cannot access seller/admin dashboards, etc.
            if (currentPath.startsWith('/dashboard') && !isWhitelisted) {
                const definedRoles = ['admin', 'seller', 'buyer'];
                const targetPathRole = definedRoles.find(r => currentPath.startsWith(`/dashboard/${r}`));
                
                if (targetPathRole) {
                    if (targetPathRole !== userRole) {
                        router.push('/');
                        return;
                    }
                } else if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
                    // Redirect /dashboard to the correct role dashboard
                    if (userRole === 'buyer') router.push('/dashboard/buyer');
                    else if (userRole === 'seller') router.push('/dashboard/seller');
                    else if (userRole === 'admin') router.push('/dashboard/admin');
                    else router.push('/');
                    return;
                }
            }

            setIsAuthorized(true);
        };

        checkAuth();
    }, [router, allowedRoles]);

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader size="lg" />
                    <p className="text-gray-500 animate-pulse">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
