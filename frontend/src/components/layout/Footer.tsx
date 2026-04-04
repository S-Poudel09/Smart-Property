'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    Building2, Facebook, Twitter, Instagram, 
    Linkedin, Mail, Phone, MapPin, 
    ShieldCheck, Zap, Globe, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
    const pathname = usePathname();
    const hideOnRoutes = ['/dashboard', '/auth', '/login', '/register', '/verification'];
    const shouldHide = hideOnRoutes.some(route => pathname?.startsWith(route));

    if (shouldHide) return null;

    return (
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            
            <div className="mx-auto max-w-[1400px] px-8 py-24 sm:px-12 lg:px-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-10">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white font-outfit tracking-tighter italic leading-none">
                                    SMART<span className="text-indigo-500">PROPERTY</span>
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] mt-1 text-slate-500">Advanced Node Registry</span>
                            </div>
                        </Link>
                        
                        <p className="text-base text-slate-500 font-medium italic leading-relaxed max-w-sm">
                            "Nepal's premier digital real estate interface. We unify asset discovery, institutional verification, and secure capital exchange through a high-performance protocol."
                        </p>
                        
                        <div className="flex gap-4 pt-4">
                            {[
                                { icon: Facebook, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Linkedin, href: '#' },
                            ].map((social, i) => (
                                <a 
                                    key={i} 
                                    href={social.href} 
                                    className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white hover:border-indigo-500/50 transition-all duration-500 group"
                                >
                                    <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Hub */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em] border-l-2 border-indigo-600 pl-4 italic">Registry</h3>
                        <ul className="space-y-4 text-[13px] font-bold uppercase tracking-widest">
                            <li><Link href="/" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">Network Hub <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                            <li><Link href="/properties" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">Asset Index <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                            <li><Link href="/services" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">Marketplace <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em] border-l-2 border-indigo-600 pl-4 italic">Direct Commands</h3>
                        <ul className="space-y-4 text-[13px] font-bold uppercase tracking-widest">
                            <li><Link href="/dashboard/buyer" className="hover:text-indigo-400 transition-colors">Buy Property</Link></li>
                            <li><Link href="/dashboard/seller" className="hover:text-indigo-400 transition-colors">Sell Property</Link></li>
                            <li><Link href="/auth/login" className="hover:text-indigo-400 transition-colors">Access Portal</Link></li>
                            <li><Link href="/auth/register" className="hover:text-indigo-400 transition-colors">Enlist Node</Link></li>
                        </ul>
                    </div>

                    {/* Support & Security */}
                    <div className="lg:col-span-4 space-y-8">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em] border-l-2 border-indigo-600 pl-4 italic">Operational Signal</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-indigo-500/30 transition-all">
                                <div className="h-10 w-10 bg-indigo-600/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">HQ Distribution</p>
                                    <p className="text-white text-sm font-medium italic">Kamaladi District, Kathmandu, NP</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-indigo-500/30 transition-all">
                                <div className="h-10 w-10 bg-indigo-600/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Encrypted Support</p>
                                    <p className="text-white text-sm font-medium italic">ops@smartproperty.com.np</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap className="h-3 w-3 text-indigo-500 animate-pulse" />
                        Initializing Global Real Estate Engine — &copy; {new Date().getFullYear()}
                    </p>
                    <div className="flex gap-10 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
                        <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Protocol</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Service Terms</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Security Audit</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
