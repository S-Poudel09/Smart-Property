'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import { Home, DollarSign, Eye, TrendingUp, Clock, CheckCircle, XCircle, Plus, ArrowRight, Crown, Landmark, Receipt, Sparkles, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatNPR } from '@/lib/utils/currency';
import { motion } from 'framer-motion';

interface SellerStats {
    total_listings: number;
    total_revenue: number;
    pending_reviews: number;
    completed_sales: number;
    recent_listings: Array<{
        id: string;
        title: string;
        price: string;
        status: string;
        beds: number;
        baths: number;
        location: string;
        PropertyID?: string;
    }>;
    recent_transactions: Array<{
        id: string;
        total_amount: string;
        status: string;
        created_at: string;
        Property: { title: string };
        Buyer: { email: string };
        TransactionID?: string;
    }>;
}

export default function SellerDashboard() {
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [propertiesRes, transactionsRes] = await Promise.all([
                    api.get('/properties/?seller=me'),
                    api.get('/transactions/')
                ]);
                const listings = propertiesRes.data?.results ?? propertiesRes.data ?? [];
                const transactions = transactionsRes.data?.results ?? transactionsRes.data ?? [];
                const completed = transactions.filter((t: any) => t.status === 'COMPLETED');
                const revenue = completed.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || '0'), 0);

                setStats({
                    total_listings: listings.length,
                    total_revenue: revenue,
                    pending_reviews: listings.filter((p: any) => p.status === 'SUBMITTED').length,
                    completed_sales: completed.length,
                    recent_listings: listings.map((p: any) => ({ ...p, id: p.id || p.PropertyID })).slice(0, 5),
                    recent_transactions: transactions.map((t: any) => ({ ...t, id: t.id || t.TransactionID })).slice(0, 5),
                });
            } catch (e) {
                console.error(e);
                setStats({ total_listings: 0, total_revenue: 0, pending_reviews: 0, completed_sales: 0, recent_listings: [], recent_transactions: [] });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#fffdf9] flex justify-center items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Estate Portfolio', value: stats!.total_listings, icon: Home, color: 'blue' },
        { label: 'Imperial Treasury', value: formatNPR(stats!.total_revenue), icon: DollarSign, color: 'emerald' },
        { label: 'Awaiting Decree', value: stats!.pending_reviews, icon: Clock, color: 'amber' },
        { label: 'Sealed Deals', value: stats!.completed_sales, icon: CheckCircle, color: 'indigo' },
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Merchant Prince Command</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-serif text-primary">Estate Command Center</h1>
                    <p className="text-gray-400 mt-2 font-medium italic">Managing sovereign assets and imperial transaction lines</p>
                </div>
                <Link href="/dashboard/seller/add-listing">
                    <Button className="h-16 px-10 rounded-full bg-primary text-accent font-black uppercase tracking-widest text-[10px] border border-accent/30 shadow-2xl hover:bg-accent hover:text-primary transition-all flex items-center gap-3 group">
                        <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Commission New Listing
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
                {/* Recent Listings */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[3rem] border border-accent/10 shadow-xl shadow-accent/5 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-10 pb-6 border-b border-accent/5">
                        <div>
                            <h2 className="text-2xl font-serif text-primary">Active Estates</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Sovereign Property Inventory</p>
                        </div>
                        <Link href="/dashboard/seller/listings" className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                            Archive Records <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-accent/5 text-[10px] font-black uppercase tracking-widest text-accent/60">
                                    <th className="px-10 py-6">Estate Description</th>
                                    <th className="px-6 py-6">Valuation</th>
                                    <th className="px-10 py-6 text-right">Decree State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent/5">
                                {stats!.recent_listings.length === 0 ? (
                                    <tr><td colSpan={3} className="p-20 text-center font-serif text-gray-400 italic text-xl">The registry is currently vacant.</td></tr>
                                ) : stats!.recent_listings.map((p, i) => (
                                    <motion.tr 
                                        key={p.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-[#c5a059]/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-10 py-6">
                                            <div className="font-serif text-lg text-primary">{p.title}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">{p.beds}bd · {p.baths}ba · {p.location}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="font-serif text-xl text-primary">{formatNPR(p.price)}</div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <StatusBadge status={p.status} />
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 flex flex-col gap-8"
                >
                    <div className="premium-gradient p-10 rounded-[3rem] text-white border border-accent/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-accent/20 transition-all" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-serif text-accent mb-8">Imperial Ledger</h2>
                            <div className="space-y-8">
                                {stats!.recent_transactions.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500 font-serif italic">No recent deals recorded in the ledger.</div>
                                ) : stats!.recent_transactions.map((t, i) => (
                                    <motion.div 
                                        key={t.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex justify-between items-start group/item cursor-pointer"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-serif text-lg group-hover/item:text-accent transition-colors">{t.Property?.title ?? 'Estate Asset'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{t.Buyer?.email ?? 'Unknown Buyer'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-serif text-lg">{formatNPR(t.total_amount)}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mt-2 inline-block border ${t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <Link href="/dashboard/seller/transactions" className="mt-12 block">
                                <Button className="w-full h-14 rounded-full bg-white text-primary font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all shadow-xl">Full Treasury Audit</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-accent/10 shadow-xl flex items-center gap-6 group hover:shadow-2xl transition-all">
                        <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                            <Sparkles className="h-8 w-8 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest">Imperial Tip</h4>
                            <p className="text-xs text-gray-400 font-medium italic mt-1">Authentic visual evidence increases decree speed by 40%.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
