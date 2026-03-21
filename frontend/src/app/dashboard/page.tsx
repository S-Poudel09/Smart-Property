'use client';

import Link from 'next/link';
import { Building2, Banknote, CreditCard, MessageSquare, UserCircle, Crown, Sparkles, Navigation, Gem, ShieldCheck, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Container from '@/components/layout/Container';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
    const user = getUser();
    
    const cards = [
        { 
            name: 'Imperial Estates', 
            href: '/properties', 
            icon: Building2, 
            description: 'Browse the sovereign collection of verified properties.'
        },
        { 
            name: 'Treasury Support', 
            href: '/dashboard/loans', 
            icon: Banknote, 
            description: 'Apply for and manage your imperial property financing.'
        },
        { 
            name: 'Imperial Ledger', 
            href: '/dashboard/transactions', 
            icon: CreditCard, 
            description: 'View your acquisition and transaction history.'
        },
        { 
            name: 'Sovereign Chat', 
            href: '/dashboard/chats', 
            icon: MessageSquare, 
            description: 'Communicate with elite artisans and service providers.'
        },
        { 
            name: 'Personal Sanctuary', 
            href: '/dashboard/profile', 
            icon: UserCircle, 
            description: 'Manage your sovereign credentials and identity records.'
        },
    ];

    return (
        <div className="bg-[#fffdf9] min-h-screen pb-32">
            {/* Elegant Header */}
            <div className="bg-primary text-white py-24 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Crown className="h-6 w-6 text-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Imperial Gateway</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-serif mb-6 leading-[0.9]">Universal Command</h1>
                        <p className="text-xl text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8">
                            Welcome, <span className="text-white not-italic">{user?.email || 'Sovereign Seeker'}</span>. The realm's administrative conduits are at your disposal.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={card.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link 
                                href={card.href}
                                className="group relative flex flex-col items-center text-center rounded-[3rem] border border-accent/10 bg-white p-10 shadow-xl shadow-accent/5 transition-all duration-500 hover:-translate-y-4 hover:border-accent/30 hover:shadow-accent/10"
                            >
                                <div className="mb-8 h-20 w-20 bg-primary text-accent flex items-center justify-center rounded-[2rem] shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {(() => {
                                        const Icon = card.icon;
                                        return <Icon className="h-8 w-8 relative z-10" />;
                                    })()}
                                </div>
                                <h3 className="text-xl font-serif text-primary mb-4 group-hover:text-accent transition-colors leading-tight">
                                    {card.name}
                                </h3>
                                <p className="text-[10px] font-medium leading-relaxed text-gray-400 italic mb-8 h-12">
                                    "{card.description}"
                                </p>
                                <div className="mt-auto h-1px w-12 bg-accent/20 group-hover:w-20 transition-all duration-500" />
                                <div className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-0 translate-y-2">
                                    Ascend Access <ArrowRight className="ml-2 h-3 w-3" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-24 text-center max-w-2xl mx-auto p-12 bg-white/40 backdrop-blur-md rounded-[3.5rem] border border-dashed border-accent/20"
                >
                    <div className="flex justify-center gap-1 mb-6">
                        <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-sm font-medium italic text-gray-500 leading-relaxed">
                        "Your presence strengthens the realm's prosperity. Every acquisition is a pillar of legacy."
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Registry Secure</span>
                        </div>
                        <div className="h-4 w-px bg-accent/20" />
                        <div className="flex items-center gap-2">
                            <Gem className="h-4 w-4 text-accent" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Heritage Quality</span>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
}
