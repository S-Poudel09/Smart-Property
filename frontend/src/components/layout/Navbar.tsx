'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, LayoutDashboard, Menu, X, Building2, LogOut, Crown, Sparkles, User, Briefcase, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { logout } from '@/lib/auth/mockAuth';
import { getUser, DecodedUser } from '@/lib/auth/getUser';
import { toast } from 'react-hot-toast';
import { NotificationBell } from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<DecodedUser | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        const checkAuth = () => {
            const currentUser = getUser();
            setUser(currentUser);
            setIsAuth(!!localStorage.getItem('smartproperty_token'));
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        const interval = setInterval(checkAuth, 2000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkAuth);
            clearInterval(interval);
        };
    }, []);

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Properties', href: '/properties', icon: Search },
        { name: 'Marketplace', href: '/services', icon: Briefcase },
    ];

    const handleLogout = () => {
        logout();
        toast.success('Safely exited the sovereign realm');
        setIsMenuOpen(false);
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 ${
            scrolled ? 'py-4 bg-white/70 backdrop-blur-2xl border-b border-accent/20 shadow-xl' : 'py-8 bg-transparent'
        }`}>
            <Container className="max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* Brand Identifier */}
                    <Link href="/" className="group flex items-center gap-4 relative z-10 transition-transform active:scale-95">
                        <motion.div 
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-accent shadow-gold-glow border border-accent/30"
                        >
                            <Crown className="h-7 w-7" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-xl font-serif text-primary leading-none tracking-tight">SmartProperty</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mt-1">Universal Registry</span>
                        </div>
                    </Link>

                    {/* Desktop Command Center */}
                    <div className="hidden lg:flex items-center gap-12 bg-primary/5 backdrop-blur-md px-10 py-3 rounded-full border border-accent/5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`group relative text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-accent ${
                                    isActive(link.href) ? 'text-accent' : 'text-primary/60'
                                }`}
                            >
                                {link.name}
                                <motion.div 
                                    initial={false}
                                    animate={isActive(link.href) ? { width: '100%', opacity: 1 } : { width: '0%', opacity: 0 }}
                                    className="absolute -bottom-2 left-0 h-0.5 bg-accent shadow-gold-glow"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Sovereign Actions */}
                    <div className="hidden lg:flex items-center gap-6">
                        {isAuth ? (
                            <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl p-2 pl-6 rounded-full border border-accent/10 shadow-lg">
                                <NotificationBell />
                                <div className="h-6 w-px bg-accent/20" />
                                
                                <Link
                                    href={`/dashboard/${user?.role?.toLowerCase() || 'buyer'}`}
                                    className="px-6 py-2.5 bg-primary text-accent rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300 shadow-xl flex items-center gap-3 group"
                                >
                                    <LayoutDashboard className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    <span>Dashboard</span>
                                </Link>

                                <button 
                                    onClick={handleLogout}
                                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                    title="Exit the Realm"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth/login">
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary">Sign In</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="h-12 px-8 bg-primary text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/30 hover:bg-accent hover:text-primary shadow-xl transition-all flex items-center gap-2 group">
                                        Request Access <Sparkles className="h-3 w-3 group-hover:scale-125 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden h-12 w-12 bg-white rounded-2xl flex items-center justify-center border border-accent/20 shadow-lg text-primary"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </Container>

            {/* Mobile Navigation Portal */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl border-b border-accent/20 shadow-2xl p-8"
                    >
                        <div className="space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-black uppercase tracking-widest ${
                                        isActive(link.href) ? 'bg-accent text-white' : 'text-primary hover:bg-gray-50'
                                    }`}
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.name}
                                </Link>
                            ))}
                            
                            <div className="h-px w-full bg-gray-100" />
                            
                            {isAuth ? (
                                <div className="space-y-4">
                                    <Link
                                        href={`/dashboard/${user?.role?.toLowerCase() || 'buyer'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-primary text-accent"
                                    >
                                        <LayoutDashboard className="h-5 w-5" /> Imperial Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-red-50 text-red-600"
                                    >
                                        <LogOut className="h-5 w-5" /> Exit Realm
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex h-12 items-center justify-center rounded-2xl border border-gray-200 text-sm font-black uppercase tracking-widest text-primary">Sign In</div>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex h-12 items-center justify-center rounded-2xl bg-primary text-accent text-sm font-black uppercase tracking-widest border border-accent/30">Join Us</div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`mx-auto w-full px-6 sm:px-12 ${className}`}>
        {children}
    </div>
);

export default Navbar;
