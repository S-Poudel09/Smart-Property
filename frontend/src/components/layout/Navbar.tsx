'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, LayoutDashboard, Menu, X, Building2, LogOut, User, Briefcase, Bell, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { logout } from '@/lib/auth/getUser';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'react-hot-toast';
import { NotificationBell } from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuth, logout: performLogout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Index', href: '/properties', icon: Search },
        { name: 'Marketplace', href: '/services', icon: Briefcase },
        { name: 'Network', href: '/', icon: Home },
    ];

    const handleLogout = () => {
        performLogout();
        toast.success('Signed out successfully');
        setIsMenuOpen(false);
    };

    const isActive = (path: string) => pathname === path;

    const hideOnRoutes = ['/dashboard', '/auth', '/login', '/register', '/verification'];
    const shouldHide = hideOnRoutes.some(route => pathname.startsWith(route));

    if (shouldHide) return null;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled || isMenuOpen ? 'bg-white/90 backdrop-blur-3xl border-b border-slate-100 py-4 shadow-2xl shadow-slate-200/40' : 'bg-transparent py-8'}`}>
            <div className="mx-auto max-w-[1400px] px-8 sm:px-12">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-2xl shadow-slate-900/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-2xl font-black tracking-tighter font-outfit italic leading-none transition-colors ${!scrolled && !isMenuOpen ? 'text-slate-900' : 'text-slate-900'}`}>
                                SMART<span className="text-indigo-600">PROPERTY</span>
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-[0.4em] mt-1 transition-opacity ${!scrolled && !isMenuOpen ? 'text-slate-400' : 'text-slate-400 opacity-60'}`}>Premium Node Registry</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-14">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${!scrolled && !isMenuOpen ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full ${isActive(link.href) ? 'w-full' : ''}`} />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-8">
                        {isAuth ? (
                            <div className={`flex items-center gap-5 p-1.5 pl-5 rounded-2xl border transition-all ${!scrolled ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                                <NotificationBell />
                                <div className={`h-4 w-px ${!scrolled ? 'bg-slate-200' : 'bg-slate-200'}`} />
                                <Link href={user?.role?.toLowerCase() === 'admin' ? '/dashboard/admin' : user?.role?.toLowerCase() === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'}>
                                    <button className="h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                        Command Hub
                                    </button>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className={`h-11 w-11 flex items-center justify-center transition-all rounded-xl hover:bg-slate-900/5 ${!scrolled ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-8">
                                <Link href="/auth/login" className="group">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all ${!scrolled ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>
                                        Initialize
                                    </span>
                                </Link>
                                <Link href="/auth/register">
                                    <button className="h-14 px-10 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3 italic">
                                        Establish Node <Sparkles className="h-3 w-3" />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`lg:hidden h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${!scrolled && !isMenuOpen ? 'text-white hover:bg-white/10 border border-white/20' : 'text-slate-900 hover:bg-slate-50 border border-slate-100'}`}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-3xl overflow-hidden z-[101]"
                    >
                        <div className="px-8 py-14 space-y-10">
                            <div className="space-y-4">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.name} 
                                        href={link.href} 
                                        className="flex items-center justify-between group py-4 border-b border-slate-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter italic group-hover:text-indigo-600 transition-colors">
                                            {link.name}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-indigo-600 transition-all" />
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="pt-6 flex flex-col gap-5">
                                {isAuth ? (
                                    <>
                                        <Link href={user?.role?.toLowerCase() === 'admin' ? '/dashboard/admin' : user?.role?.toLowerCase() === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'} onClick={() => setIsMenuOpen(false)}>
                                            <button className="w-full h-16 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] shadow-xl italic">Command Hub</button>
                                        </Link>
                                        <button onClick={handleLogout} className="w-full h-16 border border-slate-200 text-slate-400 rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] italic hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">Terminate Session</button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                            <button className="w-full h-16 border border-slate-200 text-slate-900 rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] italic">Sign In</button>
                                        </Link>
                                        <Link href="/auth/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                            <button className="w-full h-16 bg-indigo-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] shadow-xl italic">Establish Presence</button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const ChevronRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
    </svg>
);

export default Navbar;
