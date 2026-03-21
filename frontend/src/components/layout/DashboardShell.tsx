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
    Crown,
    Sparkles
} from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardShellProps {
    children: ReactNode;
    title: string;
}

interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType; 
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
        <div className="flex min-h-screen bg-[#fffdf9]">
            {/* Sidebar */}
            <aside className="hidden w-80 border-r border-accent/20 bg-primary md:block relative z-50 shadow-2xl">
                <div className="flex h-full flex-col">
                    <div className="p-10 border-b border-accent/20">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center text-primary shadow-gold-glow group-hover:scale-110 transition-transform">
                                <Crown className="h-7 w-7" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-serif text-white leading-none">SmartProperty</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent mt-1 italic">Sovereign Asset Registry</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto py-12 px-6 scrollbar-hide">
                        <nav className="space-y-4">
                            <div className="px-4 mb-6 text-[10px] font-black uppercase tracking-[0.5em] text-accent/60">Navigation Deeds</div>
                            {navItems.map((item: MenuItem) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-5 rounded-3xl px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative group ${pathname === item.href
                                        ? 'bg-accent text-primary shadow-gold-glow scale-[1.05]'
                                        : 'text-accent/60 hover:text-accent hover:bg-white/5'
                                        }`}
                                >
                                    {(() => {
                                        const Icon = item.icon as any;
                                        return <Icon className={`h-5 w-5 ${pathname === item.href ? 'rotate-12' : 'group-hover:rotate-12'} transition-transform`} />;
                                    })()}
                                    <span>{item.name}</span>
                                    {pathname === item.href && (
                                        <motion.div 
                                            layoutId="sidebar-active"
                                            className="absolute left-[-1.5rem] w-2 h-12 bg-accent rounded-r-full shadow-gold-glow shadow-[10px_0_20px_#c5a059]"
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-8 border-t border-accent/10">
                        <div className="bg-white/5 rounded-3xl p-6 border border-accent/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white">Pro Status</div>
                            </div>
                            <p className="text-[10px] text-accent/60 mb-4 font-medium italic">Your verification status is active and recognized by the archive.</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="px-6 py-12 sm:px-12 lg:px-20 max-w-[1600px] mx-auto">
                    <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div>
                            <Breadcrumbs />
                            <h1 className="text-4xl lg:text-5xl font-serif text-primary mt-4 tracking-tight">
                                {title || `${role.charAt(0).toUpperCase() + role.slice(1)} Archive`}
                            </h1>
                        </div>
                        <div className="bg-white shadow-xl shadow-accent/5 border border-accent/20 px-8 py-4 rounded-[2.5rem] flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-accent shadow-inner">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-accent">Authenticated as</span>
                                <span className="text-xs font-mono font-bold text-primary">{user?.name || 'Imperial Petitioner'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardShell;
