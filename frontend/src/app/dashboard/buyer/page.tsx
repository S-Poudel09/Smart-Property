'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import {
    Building, ReceiptText, CreditCard, Heart,
    ArrowRight, MapPin, Search, Wallet, TrendingUp, Sparkles, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer 
} from 'recharts';

interface BuyerStats {
    loan_count: number;
    transaction_count: number;
    active_loans: number;
    recent_transactions: any[];
    recommended_properties: any[];
}

const mockMarketData = [
    { name: 'Jan', index: 110 },
    { name: 'Feb', index: 115 },
    { name: 'Mar', index: 112 },
    { name: 'Apr', index: 120 },
    { name: 'May', index: 128 },
    { name: 'Jun', index: 135 },
];

export default function BuyerDashboard() {
    const [stats, setStats] = useState<BuyerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [loansRes, transactionsRes, propertiesRes] = await Promise.all([
                    api.get('loans/').catch(() => ({ data: [] })),
                    api.get('transactions/').catch(() => ({ data: [] })),
                    api.get('properties/').catch(() => ({ data: [] })),
                ]);
                const loans = loansRes.data?.results ?? loansRes.data ?? [];
                const transactions = transactionsRes.data?.results ?? transactionsRes.data ?? [];
                const properties = propertiesRes.data?.results ?? propertiesRes.data ?? [];

                setStats({
                    loan_count: loans.length,
                    transaction_count: transactions.length,
                    active_loans: loans.filter((l: any) => l.LoanStatus === 'APPROVED').length,
                    recent_transactions: transactions.slice(0, 5),
                    recommended_properties: properties
                        .filter((p: any) => p.status === 'published' || p.status === 'approved' || !p.status)
                        .slice(0, 4),
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Available Assets', value: stats!.recommended_properties.length, icon: Building, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', trend: 'Global registry' },
        { label: 'My Settlements', value: stats!.transaction_count, icon: ReceiptText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', trend: 'Signed contracts' },
        { label: 'Loan Status', value: stats!.loan_count, icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', trend: 'Bank review' },
        { label: 'Saved Items', value: '0', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', trend: 'Registry watchlist' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm">
                            <Sparkles className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Client Node</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter leading-tight italic">Registry Explorer</h1>
                    <p className="text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-6 max-w-xl">
                        Locate your next asset and track your procurement progress across the network.
                    </p>
                </div>
                <Link href="/dashboard/properties">
                    <button className="flex items-center gap-2.5 h-14 px-8 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/20 group">
                        <Search className="h-4 w-4 text-indigo-400 group-hover:text-white transition-colors" /> Scan properties
                    </button>
                </Link>
                <Link href="/dashboard/buyer/requests">
                    <button className="flex items-center gap-2.5 h-14 px-8 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-800 transition-all shadow-xl hover:shadow-indigo-900/20 ml-4">
                        My Service Requests
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
                                <h2 className="text-xl font-black text-slate-900 font-outfit tracking-tight leading-tight italic">Market Intelligence</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Registry Price Index</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold">
                                <TrendingUp className="h-3.5 w-3.5" />
                                +12.5% MOM
                            </div>
                        </div>
                        
                        <div className="h-[250px] w-full relative z-10">
                            {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockMarketData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip 
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
                                            dataKey="index" 
                                            stroke="#6366f1" 
                                            strokeWidth={4} 
                                            fillOpacity={1} 
                                            fill="url(#colorIndex)" 
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
                                <h2 className="text-xl font-black text-slate-900 font-outfit uppercase tracking-tighter italic">Discovery Stream</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recommended for your portfolio</p>
                            </div>
                            <Link href="/dashboard/properties" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-white px-5 py-3 rounded-xl border border-slate-200 transition-all">
                                Scan All <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="p-10">
                            {stats!.recommended_properties.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Building className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registry empty</p>
                                    <Link href="/properties" className="text-xs text-indigo-600 font-black mt-4 inline-block hover:underline">Establish scan criteria →</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {stats!.recommended_properties.map((p, i) => (
                                        <Link key={i} href={`/properties/${p.id || p.PropertyID}`} className="group block">
                                            <div className="rounded-[2rem] border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 bg-white">
                                                <div className="h-40 bg-slate-100 overflow-hidden relative">
                                                    <img
                                                        src={p.property_images?.[0]?.image || p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        alt={p.title}
                                                    />
                                                    <div className="absolute top-4 right-4 h-8 w-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate uppercase tracking-tight">{p.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-2 uppercase tracking-widest">
                                                        <MapPin className="h-3 w-3" /> {p.location || p.city || 'Nepal'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                                        <span className="text-base font-black text-slate-900 tabular-nums">{formatNPR(p.price)}</span>
                                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">Inspect</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-24 -mt-24" />
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-black mb-2 font-outfit uppercase tracking-tighter italic">Capital Allocation</h3>
                        <p className="text-sm text-indigo-100 mb-10 font-medium italic opacity-80 leading-relaxed">"Evaluate strategic financing paths and asset-backed debt eligibility."</p>
                        <Link href="/dashboard/mortgage">
                            <button className="w-full bg-white text-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-[1.25rem] hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/40 active:scale-95">
                                Initiate Calculation
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Wallet className="h-5 w-5 text-slate-300" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Live Ledger</h3>
                        </div>
                        <div className="space-y-3">
                            {stats!.recent_transactions.length === 0 ? (
                                <p className="text-center py-10 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero Activity Found</p>
                            ) : (
                                stats!.recent_transactions.map((t, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-900/5 transition-all rounded-[1.25rem] group">
                                        <div className="min-w-0 pr-4">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">{t.Property?.title || 'Asset Purchase'}</p>
                                            <p className="text-sm font-black text-indigo-500 mt-1 tabular-nums italic">{formatNPR(t.total_amount)}</p>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase bg-white border border-slate-100 px-3 py-1.5 rounded-lg group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">{t.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        {stats!.recent_transactions.length > 0 && (
                            <Link href="/dashboard/buyer/transactions" className="mt-8 flex items-center justify-center w-full py-4 bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                                View Full History <ArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
