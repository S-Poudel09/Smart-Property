'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import {
    Building, FileText, CreditCard, TrendingUp,
    Search, Filter, Home, ArrowRight, MapPin, Bath, BedDouble, Crown, Heart, Sparkles, Navigation, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import EMICalculator from '@/components/loans/EMICalculator';
import { formatNPR } from '@/lib/utils/currency';
import { motion } from 'framer-motion';

interface BuyerStats {
    loan_count: number;
    transaction_count: number;
    active_loans: number;
    recent_transactions: any[];
    recommended_properties: any[];
}

export default function BuyerDashboard() {
    const [stats, setStats] = useState<BuyerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [loansRes, transactionsRes, propertiesRes] = await Promise.all([
                    api.get('/loans/'),
                    api.get('/transactions/'),
                    api.get('/properties/'),
                ]);
                const loans = loansRes.data?.results ?? loansRes.data ?? [];
                const transactions = transactionsRes.data?.results ?? transactionsRes.data ?? [];
                const properties = propertiesRes.data?.results ?? propertiesRes.data ?? [];

                setStats({
                    loan_count: loans.length,
                    transaction_count: transactions.length,
                    active_loans: loans.filter((l: any) => l.LoanStatus === 'APPROVED').length,
                    recent_transactions: transactions.slice(0, 4),
                    recommended_properties: properties.filter((p: any) => p.status === 'PUBLISHED' || p.status === 'APPROVED').slice(0, 3),
                });
            } catch (e) {
                console.error(e);
                setStats({ loan_count: 0, transaction_count: 0, active_loans: 0, recent_transactions: [], recommended_properties: [] });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#fffdf9] flex justify-center items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Estates Explored', value: stats!.recommended_properties.length, icon: Building, color: 'blue' },
        { label: 'Imperial Deeds', value: stats!.transaction_count, icon: CreditCard, color: 'emerald' },
        { label: 'Loan Petitions', value: stats!.loan_count, icon: FileText, color: 'purple' },
        { label: 'Active Endowments', value: stats!.active_loans, icon: TrendingUp, color: 'amber' },
    ];

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12 px-4 sm:px-8">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Crown className="h-5 w-5 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Sovereign Explorer Hub</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-serif text-primary">Portfolio Sanctuary</h1>
                    <p className="text-gray-400 mt-2 font-medium italic">Discovering prestigious estates and managing imperial acquisitions</p>
                </div>
                <Link href="/properties">
                    <Button className="h-16 px-10 rounded-full bg-primary text-accent font-black uppercase tracking-widest text-[10px] border border-accent/30 shadow-2xl hover:bg-accent hover:text-primary transition-all flex items-center gap-3 group">
                        <Search className="h-5 w-5 group-hover:scale-110 transition-transform" /> Browse Royal Estates
                    </Button>
                </Link>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {summaryCards.map((card, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-accent/10 shadow-xl shadow-accent/5 group hover:shadow-2xl transition-all"
                    >
                        <div className="h-14 w-14 bg-primary text-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <card.icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{card.label}</h3>
                        <p className="text-3xl font-serif text-primary">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* EMI Calculator */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[3rem] border border-accent/10 shadow-xl p-0 overflow-hidden"
                >
                    <div className="premium-gradient p-10 text-white border-b border-accent/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-serif text-accent mb-2">Imperial Treasury Calculator</h2>
                            <p className="text-gray-400 text-sm font-medium italic">Estimating endowments for sovereign acquisitions</p>
                        </div>
                    </div>
                    <div className="p-10">
                        <EMICalculator />
                    </div>
                </motion.div>

                {/* Sidebar: Recommended & Purchases */}
                <div className="space-y-8">
                    {/* Recommended Estates */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-accent/10 shadow-xl p-10"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-serif text-primary">Selected Estates</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent mt-1 italic">Curated for your lineage</p>
                            </div>
                            <Link href="/properties" className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-accent shadow-lg hover:scale-110 transition-transform">
                                <Navigation className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {stats!.recommended_properties.length === 0 ? (
                                <p className="text-sm font-serif text-gray-400 text-center py-8">The royal archive is searching for your match.</p>
                            ) : stats!.recommended_properties.map((p: any, index: number) => (
                                <Link key={p.id || index} href={`/properties/${p.id}`} className="block group">
                                    <div className="p-5 bg-[#fffdf9] border border-accent/10 rounded-3xl hover:bg-white hover:border-accent/30 transition-all shadow-sm group-hover:shadow-md">
                                        <p className="font-serif text-lg text-primary group-hover:text-accent transition-colors">{p.title}</p>
                                        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-accent" /> {p.beds}</span>
                                            <span className="flex items-center gap-1"><Bath className="h-3 w-3 text-accent" /> {p.baths}</span>
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent" /> {p.location}</span>
                                        </div>
                                        <div className="mt-4 flex justify-between items-end">
                                            <p className="font-serif text-xl text-primary">{formatNPR(p.price)}</p>
                                            <ArrowRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Imperial Purchases */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-accent/10 shadow-xl p-10"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-accent shadow-lg">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-primary">Purse Registry</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent mt-1 italic">Acquisition History</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {stats!.recent_transactions.length === 0 ? (
                                <p className="text-sm font-serif text-gray-400 text-center py-8 italic">No imperial purchases recorded in the current era.</p>
                            ) : stats!.recent_transactions.map((t: any, index: number) => (
                                <div key={t.id || index} className="flex justify-between items-center p-5 bg-[#fffdf9] border border-accent/10 rounded-2xl group hover:bg-white transition-all shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-sm font-serif text-primary">{t.Property?.title ?? 'Estate Asset'}</p>
                                        <p className="text-[10px] text-accent font-black uppercase tracking-tighter">{formatNPR(t.total_amount)}</p>
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                            ))}
                        </div>
                        <Link href="/dashboard/buyer/transactions" className="mt-8 block">
                            <Button className="w-full h-14 rounded-full border border-primary text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-lg">View Entire Ledger</Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
