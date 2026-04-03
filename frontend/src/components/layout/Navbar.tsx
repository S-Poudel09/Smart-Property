'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, LayoutDashboard, Menu, X, Building2, LogOut, User, Briefcase, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { logout } from '@/lib/auth/getUser';
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
        toast.success('Signed out successfully');
        setIsMenuOpen(false);
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-border/40 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
            <Container>
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3.5 group">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className={`text-xl font-bold tracking-tight font-outfit ${!scrolled && !isMenuOpen ? 'text-gray-900 lg:text-white' : 'text-gray-900'}`}>
                            SmartProperty
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:text-primary ${!scrolled ? 'text-white/80 hover:text-white' : 'text-muted'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        {isAuth ? (
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-1.5 pl-4 rounded-xl border border-white/10 shadow-sm transition-all hover:bg-white/20">
                                <NotificationBell />
                                <div className="h-4 w-px bg-white/20" />
                                <Link href={user?.role?.toLowerCase() === 'admin' ? '/dashboard/admin' : user?.role?.toLowerCase() === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'}>
                                    <Button variant="secondary" className="rounded-lg h-10 px-5 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                        Dashboard
                                    </Button>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="h-10 w-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <span className={`text-sm font-bold mr-6 transition-colors ${!scrolled ? 'text-white hover:text-white/80' : 'text-muted hover:text-primary'}`}>
                                        Sign In
                                    </span>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                                        Join Platform
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`lg:hidden p-2 rounded-xl transition-colors ${!scrolled && !isMenuOpen ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'}`}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-border/40 overflow-hidden"
                    >
                        <div className="px-6 py-10 space-y-6">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.href} 
                                    className="block text-xl font-bold text-foreground hover:text-primary transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-gray-50 flex flex-col gap-4">
                                {isAuth ? (
                                    <>
                                        <Link href={user?.role?.toLowerCase() === 'admin' ? '/dashboard/admin' : user?.role?.toLowerCase() === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'} onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full h-12 rounded-xl font-bold">My Dashboard</Button>
                                        </Link>
                                        <Button variant="outline" onClick={handleLogout} className="w-full h-12 rounded-xl font-bold text-danger hover:bg-danger/5">Sign Out</Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Sign In</Button>
                                        </Link>
                                        <Link href="/auth/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full h-12 rounded-xl font-bold">Join Platform</Button>
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

const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`mx-auto w-full max-w-7xl px-6 sm:px-12 ${className}`}>
        {children}
    </div>
);

export default Navbar;
