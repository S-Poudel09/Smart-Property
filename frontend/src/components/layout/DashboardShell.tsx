'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Home, 
    MessageSquare, 
    Bell, 
    Building, 
    ReceiptText, 
    PlusCircle, 
    Landmark,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardShellProps {
    children: ReactNode;
    title: string;
}

interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType<{ className?: string }>; 
}

const DashboardShell = ({ children, title }: DashboardShellProps) => {
    const pathname = usePathname();

    const user = getUser();
    const role = user?.role?.toLowerCase() || 'buyer';

    const menuItems: Record<string, MenuItem[]> = {
        admin: [
            { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
            { name: 'Users', href: '/dashboard/admin/users', icon: Users },
            { name: 'Properties', href: '/dashboard/admin/properties', icon: Home },
            { name: 'Transactions', href: '/dashboard/admin/transactions', icon: ReceiptText },
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ],
        seller: [
            { name: 'Overview', href: '/dashboard/seller', icon: LayoutDashboard },
            { name: 'Listings', href: '/dashboard/seller/listings', icon: Home },
            { name: 'Add Listing', href: '/dashboard/seller/add-listing', icon: PlusCircle },
            { name: 'Chats', href: '/dashboard/seller/chats', icon: MessageSquare },
            { name: 'Transactions', href: '/dashboard/seller/transactions', icon: ReceiptText },
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ],
        buyer: [
            { name: 'Overview', href: `/dashboard/${role}`, icon: LayoutDashboard },
            { name: 'Properties', href: '/properties', icon: Building },
            { name: 'Transactions', href: `/dashboard/${role}/transactions`, icon: ReceiptText },
            { name: 'Chats', href: `/dashboard/${role}/chats`, icon: MessageSquare },
            { name: 'Services', href: '/dashboard/services', icon: Users },
            { name: 'Loans', href: `/dashboard/${role}/loans`, icon: Landmark },
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ]
    };

    const currentMenu = menuItems[role] || menuItems.buyer;
    const navItems = currentMenu;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Professional Sidebar */}
            <aside className="hidden lg:block w-72 border-r border-border/40 bg-white sticky top-0 h-screen z-50 overflow-hidden">
                <div className="flex h-full flex-col">
                    <div className="p-8 pb-10">
                        <Link href="/" className="flex items-center gap-3.5 group">
                            <div className="h-11 w-11 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all group-hover:rotate-6">
                                <Building className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold text-foreground tracking-tight font-outfit">SmartProperty</span>
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 space-y-1">
                        <p className="px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                        <nav className="space-y-1.5">
                            {navItems.map((item: MenuItem) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link sidebar-link-inactive'}
                                    >
                                        <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && <motion.div layoutId="active-indicator" className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-8 border-t border-border/40 bg-gray-50/30">
                        <Link 
                            href="/dashboard/profile" 
                            className={pathname === '/dashboard/profile' ? 'sidebar-link sidebar-link-active' : 'sidebar-link sidebar-link-inactive'}
                        >
                            <UserCircle className="h-5 w-5" />
                            <span>My Profile</span>
                        </Link>
                        <button 
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all w-full mt-2"
                            onClick={async () => {
                                const { clearAuthFromStorage } = await import('@/lib/auth/storage');
                                clearAuthFromStorage();
                                window.location.href = '/auth/login';
                            }}
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
                {/* Sleek Header */}
                <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-border/40 sticky top-0 z-40 px-8 lg:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="lg:hidden">
                            <Building className="h-6 w-6 text-primary" />
                        </div>
                        <Breadcrumbs />
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3">
                           <Link href="/dashboard/notifications">
                               <div className="h-10 w-10 flex items-center justify-center bg-gray-50 rounded-xl border border-border/50 relative cursor-pointer hover:bg-white transition-colors">
                                    <Bell className="h-5 w-5 text-muted" />
                                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white shadow-sm"></span>
                               </div>
                           </Link>
                        </div>
                        
                        <div className="h-8 w-[1px] bg-border/40"></div>
                        
                        <div className="flex items-center gap-3 group cursor-pointer pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-foreground leading-none">{user?.name || 'User Profile'}</p>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1.5">{role}</p>
                            </div>
                            <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center text-primary border border-primary/10 shadow-sm transition-all group-hover:border-primary/30">
                                <UserCircle className="h-7 w-7" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-8 lg:px-12 py-12 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardShell;

