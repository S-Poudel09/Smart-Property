'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import {
    Home, DollarSign, Clock, CheckCircle, PlusCircle,
    ArrowRight, Briefcase, ShieldCheck, Zap, TrendingUp, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer 
} from 'recharts';
import { useRouter } from 'next/navigation';

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
        location: string;
    }>;
    recent_transactions: Array<{
        id: string;
        total_amount: string;
        status: string;
        created_at: string;
        Property: { title: string };
        Buyer: { email: string };
    }>;
}

const mockRevenueData = [
    { month: 'Jan', revenue: 4500000 },
    { month: 'Feb', revenue: 5200000 },
    { month: 'Mar', revenue: 4800000 },
    { month: 'Apr', revenue: 6100000 },
    { month: 'May', revenue: 5500000 },
    { month: 'Jun', revenue: 6800000 },
];

export default function SellerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [propertiesRes, transactionsRes] = await Promise.all([
                    api.get('properties/?seller=me').catch(() => ({ data: [] })),
                    api.get('transactions/').catch(() => ({ data: [] }))
                ]);
                const listings = propertiesRes.data?.results ?? propertiesRes.data ?? [];
                const transactions = transactionsRes.data?.results ?? transactionsRes.data ?? [];
                const completed = transactions.filter((t: any) => t.status === 'COMPLETED');
                const revenue = completed.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || '0'), 0);

                setStats({
                    total_listings: listings.length,
                    total_revenue: revenue,
                    pending_reviews: listings.filter((p: any) => p.status === 'submitted').length,
                    completed_sales: completed.length,
                    recent_listings: listings.slice(0, 5).map((p: any, idx: number) => ({
                        id: String(p.id || p.PropertyID || idx),
                        title: p.title || 'Untitled Property',
                        price: p.price || '0',
                        status: p.status || 'draft',
                        location: p.location || 'Nepal',
                    })),
                    recent_transactions: transactions.slice(0, 5),
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="h-[60vh] flex justify-center items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Active Inventory', value: stats!.total_listings, icon: Home, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', trend: 'Properties listed' },
        { label: 'Settled Revenue', value: formatNPR(stats!.total_revenue), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', trend: 'Total earnings' },
        { label: 'Review Queue', value: stats!.pending_reviews, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', trend: 'Awaiting site visit' },
        { label: 'Closed Deals', value: stats!.completed_sales, icon: CheckCircle, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', trend: 'Successful sales' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm">
                            <Briefcase className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Merchant Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter leading-tight italic">Portfolio Manager</h1>
                    <p className="text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-6 max-w-xl">
                        Overview of your property inventory performance and transaction settlements.
                    </p>
                </div>
                <Link href="/dashboard/seller/add-listing">
                    <button className="flex items-center gap-2.5 h-14 px-8 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/20 group">
                        <PlusCircle className="h-4 w-4 text-indigo-400 group-hover:text-white transition-colors" /> Add New Asset
                    </button>
                </Link>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`h-11 w-11 ${card.bg} ${card.color} rounded-[1.25rem] flex items-center justify-center border ${card.border} transition-transform group-hover:scale-110`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="h-3 w-3 text-slate-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-900 mb-1 tabular-nums font-outfit">{card.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 font-outfit tracking-tight leading-tight italic">Fiscal Performance</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Projected Revenue Momentum</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold">
                                <TrendingUp className="h-3.5 w-3.5" />
                                +31.2% VOLUME
                            </div>
                        </div>
                        
                        <div className="h-[300px] w-full relative z-10">
                            {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            tickFormatter={(v) => `Rs ${v/1000000}M`}
                                        />
                                        <Tooltip 
                                            formatter={(v) => formatNPR(Number(v))}
                                            contentStyle={{ 
                                                borderRadius: '16px', 
                                                border: 'none', 
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                fontWeight: '800',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#6366f1" 
                                            strokeWidth={4} 
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 font-outfit uppercase tracking-tighter italic">Recent Asset Ledger</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live status tracking</p>
                            </div>
                            <Link href="/dashboard/seller/listings" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-white px-5 py-3 rounded-xl border border-slate-200 transition-all">
                                Expand Registry <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100">
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Title</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Valuation</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats!.recent_listings.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-10 py-20 text-center">
                                                <Home className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assets registered</p>
                                                <Link href="/dashboard/seller/add-listing" className="text-xs text-indigo-600 font-black mt-4 inline-block hover:underline">Begin Onboarding Protocol →</Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        stats!.recent_listings.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                                                onClick={() => router.push(`/dashboard/seller/listings/${p.id}`)}
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{p.title}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{p.location}</div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="text-sm font-black text-slate-900 tabular-nums">{formatNPR(p.price)}</div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <StatusBadge status={p.status} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-[60px] pointer-events-none" />
                        <h2 className="text-base font-black text-slate-900 font-outfit uppercase tracking-widest mb-8 italic">Tactical Actions</h2>
                        <div className="space-y-3">
                            {[
                                { link: '/dashboard/seller/listings', label: 'Inventory Matrix', icon: Briefcase, color: 'bg-indigo-50 text-indigo-600' },
                                { link: '/dashboard/seller/transactions', label: 'Settlement Ledger', icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
                                { link: '/dashboard/profile', label: 'Node Verification', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600' },
                            ].map((item, i) => (
                                <Link key={i} href={item.link} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
                                    <div className={`h-11 w-11 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{item.label}</span>
                                    <ArrowRight className="h-4 w-4 text-slate-200 ml-auto group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -mr-24 -mt-24" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <Zap className="h-6 w-6 text-indigo-400 group-hover:animate-pulse" />
                            <h3 className="text-base font-black uppercase tracking-tighter italic font-outfit">Optimization Intel</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium italic relative z-10">
                            "Verified assets observe a 2.8x increase in registry momentum. Ensure all appraisal documentation is current to maximize visibility."
                        </p>
                        <Link href="/dashboard/profile" className="block mt-10 relative z-10">
                            <button className="w-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-[1.25rem] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/50 active:scale-95">
                                Upgrade Node Status
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
