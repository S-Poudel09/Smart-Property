'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Home, MessageSquare, Bell, Building, ReceiptText,
    PlusCircle, Landmark, Users, LogOut, UserCircle, Compass, Sparkles, ShieldCheck
} from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardShellProps {
    children: ReactNode;
    title?: string;
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
            { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
            { name: 'Properties', href: '/dashboard/admin/properties', icon: Home },
            { name: 'Users', href: '/dashboard/admin/users', icon: Users },
            { name: 'Transactions', href: '/dashboard/admin/transactions', icon: ReceiptText },
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ],
        seller: [
            { name: 'Dashboard', href: '/dashboard/seller', icon: LayoutDashboard },
            { name: 'My Listings', href: '/dashboard/seller/listings', icon: Home },
            { name: 'Add Listing', href: '/dashboard/seller/add-listing', icon: PlusCircle },
            { name: 'Transactions', href: '/dashboard/seller/transactions', icon: ReceiptText },
            { name: 'Messages', href: '/dashboard/chats', icon: MessageSquare },
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ],
        buyer: [
            { name: 'Dashboard', href: '/dashboard/buyer', icon: LayoutDashboard },
            { name: 'Browse Properties', href: '/dashboard/properties', icon: Compass },
            { name: 'Transactions', href: '/dashboard/buyer/transactions', icon: ReceiptText },
            { name: 'Messages', href: '/dashboard/chats', icon: MessageSquare },
            { name: 'Services', href: '/dashboard/services', icon: Sparkles },
            { name: 'Loan Calculator', href: '/dashboard/mortgage', icon: Landmark },
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        ],
    };

    const currentMenu = menuItems[role] || menuItems.buyer;

    return (
        <div className="flex min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-80 border-r border-slate-200 bg-white sticky top-0 h-screen z-50 flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3.5 group">
                        <div className="h-11 w-11 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <Building className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <span className="text-lg font-black text-slate-900 block leading-tight font-outfit tracking-tight">SmartProperty</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-0.5 block italic">Nexus Portal</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 mt-2">Main Navigation</p>
                    <nav className="space-y-1.5">
                        {currentMenu.map((item: MenuItem) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3.5 px-4 py-3 rounded-[1.25rem] text-sm font-semibold transition-all duration-300 group",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/10"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500")} />
                                    <span className="tracking-tight">{item.name}</span>
                                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/40" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-slate-100 space-y-2">
                    <Link
                        href="/dashboard/profile"
                        className={cn(
                            "flex items-center gap-3.5 px-4 py-3 rounded-[1.25rem] text-sm font-semibold transition-all group",
                            pathname === '/dashboard/profile'
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <UserCircle className={cn("h-5 w-5", pathname === '/dashboard/profile' ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-900")} />
                        <span className="tracking-tight">My Profile</span>
                    </Link>
                    <button
                        className="flex items-center gap-3.5 px-4 py-3 rounded-[1.25rem] text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all w-full group/logout"
                        onClick={async () => {
                            const { clearAuthFromStorage } = await import('@/lib/auth/storage');
                            clearAuthFromStorage();
                            window.location.href = '/auth/login';
                        }}
                    >
                        <div className="h-5 w-5 flex items-center justify-center transition-transform group-hover/logout:-translate-x-0.5">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <span className="tracking-tight">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <header className="h-20 border-b border-slate-200 bg-white/70 backdrop-blur-2xl px-8 lg:px-10 flex items-center justify-between sticky top-0 z-[45]">
                    <div className="flex items-center gap-6">
                        <div className="lg:hidden h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Building className="h-5 w-5" />
                        </div>
                        <div className="hidden sm:block">
                            <Breadcrumbs />
                        </div>
                        {title && <h1 className="text-lg font-black text-slate-900 ml-4 border-l-2 border-indigo-600/20 pl-6 tracking-tight font-outfit uppercase">{title}</h1>}
                    </div>

                    <div className="flex items-center gap-5">
                        <Link href="/dashboard/notifications">
                            <div className="h-11 w-11 flex items-center justify-center bg-white rounded-2xl border border-slate-200 relative cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group shadow-sm">
                                <Bell className="h-5 w-5 text-slate-500 group-hover:text-indigo-600 group-hover:animate-swing" />
                                <span className="absolute top-3 right-3 h-2 w-2 bg-indigo-500 rounded-full border-2 border-white shadow-sm" />
                            </div>
                        </Link>
                        
                        <div className="h-8 w-px bg-slate-200 mx-1" />
                        
                        <div className="flex items-center gap-3.5 pl-2 group cursor-pointer">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-black text-slate-900 leading-none tracking-tight">{user?.name || 'Authorized User'}</p>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 opacity-70">{role} NODE</p>
                            </div>
                            <div className="h-11 w-11 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/10 border-2 border-white transition-transform group-hover:scale-105">
                                <UserCircle className="h-6 w-6 text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-8 lg:px-12 py-10 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] relative">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48 opacity-40" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardShell;
