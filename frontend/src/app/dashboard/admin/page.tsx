'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import {
    Users, Building, Clock, Activity, TrendingUp,
    CheckCircle, Zap, ShieldCheck, BarChart3, ArrowUpRight, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

interface AdminStats {
    total_users: number;
    total_properties: number;
    pending_properties: number;
    total_transactions: number;
    recent_activities: any[];
}

const mockChartData = [
    { day: 'Mon', volume: 45 },
    { day: 'Tue', volume: 52 },
    { day: 'Wed', volume: 38 },
    { day: 'Thu', volume: 65 },
    { day: 'Fri', volume: 48 },
    { day: 'Sat', volume: 59 },
    { day: 'Sun', volume: 42 },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [usersRes, propertiesRes, transRes] = await Promise.all([
                    api.get('/auth/users/count/').catch(() => ({ data: { count: 0 } })),
                    api.get('/properties/').catch(() => ({ data: [] })),
                    api.get('/transactions/').catch(() => ({ data: [] })),
                ]);

                const props = propertiesRes.data?.results ?? propertiesRes.data ?? [];
                const trans = transRes.data?.results ?? transRes.data ?? [];

                setStats({
                    total_users: usersRes.data?.count ?? 0,
                    total_properties: props.length,
                    pending_properties: props.filter((p: any) => p.status === 'pending').length,
                    total_transactions: trans.length,
                    recent_activities: trans.slice(0, 5),
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

    const metrics = [
        { label: 'Total Users', value: stats!.total_users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+14% New Enrollments' },
        { label: 'Asset Inventory', value: stats!.total_properties, icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', trend: '+8% Added this week' },
        { label: 'Pending Review', value: stats!.pending_properties, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', trend: 'Strategic queue' },
        { label: 'Transactions', value: stats!.total_transactions, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', trend: 'System total' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-2">
            {/* Intel Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm transition-transform hover:scale-105">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Admin Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter leading-tight">System Registry Monitor</h1>
                    <p className="text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-8 max-w-xl">
                        "Oversee the complete lifecycle of asset enrollment, user verification, and financial settlements."
                    </p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Protocol Node: ACTIVE</span>
                </div>
            </header>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`h-12 w-12 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center border ${metric.border} transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                                <metric.icon className="h-5 w-5" />
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="h-3 w-3 text-slate-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900 mb-1 font-outfit tabular-nums">{metric.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2">{metric.label}</div>
                        <div className="text-[11px] font-bold text-slate-500 italic opacity-60">{metric.trend}</div>
                    </motion.div>
                ))}
            </div>

            {/* Analytical Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 font-outfit tracking-tight leading-tight italic">Registry Volume Dynamics</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Consolidated Property Submission Flow</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold shadow-sm">
                                <TrendingUp className="h-3.5 w-3.5" />
                                14.8% APY GROWTH
                            </div>
                        </div>
                        
                        <div className="h-[300px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                    />
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
                                        dataKey="volume" 
                                        stroke="#6366f1" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorVolume)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                         <div className="flex items-center gap-4 mb-8">
                            <ShieldCheck className="h-6 w-6 text-indigo-400" />
                            <h2 className="text-xl font-black text-white font-outfit uppercase tracking-tighter italic">Operational Quick Actions</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Review Queue', href: '/dashboard/admin/properties', icon: Clock },
                                { label: 'User Matrix', href: '/dashboard/admin/users', icon: Users },
                                { label: 'Settlements', href: '/dashboard/admin/transactions', icon: ReceiptText },
                                { label: 'KYC Protocol', href: '/dashboard/admin/kyc', icon: ShieldCheck }
                            ].map((action, i) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-[1.75rem] hover:bg-white hover:border-white transition-all duration-300 group/btn shadow-xl"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover/btn:bg-indigo-500 group-hover/btn:text-white transition-colors">
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover/btn:text-slate-900">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-[60px] pointer-events-none" />
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-base font-black text-slate-900 font-outfit tracking-tight italic">Tactical Activity</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Latest Network Events</p>
                            </div>
                            <Activity className="h-5 w-5 text-indigo-600 opacity-20" />
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {(stats!.recent_activities.length > 0 ? stats!.recent_activities.slice(0, 6) : Array(6).fill({})).map((act, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        className="flex gap-4 items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group/act cursor-default"
                                    >
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${i % 2 === 0 ? 'bg-indigo-100/50 text-indigo-600 border-indigo-200/50' : 'bg-slate-100 text-slate-400 border-slate-200/50'}`}>
                                            {i % 2 === 0 ? <CheckCircle className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight truncate">
                                                {act.PropertyID ? `Settlement #${String(act.TransactionID || '').slice(0, 8)}` : (i % 2 === 0 ? 'Registry Verification' : 'Protocol Onboarding')}
                                            </p>
                                            <p className="text-[13px] font-bold text-slate-500 italic mt-0.5">
                                                {act.Amount ? `Rs ${Number(act.Amount).toLocaleString()}` : (i % 2 === 0 ? 'Asset verified' : 'New secure node')}
                                            </p>
                                        </div>
                                        <div className="text-[9px] font-black text-indigo-600/30 uppercase group-hover/act:text-indigo-600 transition-colors">{i + 1}m</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Link href="/dashboard/admin/logs" className="mt-8 flex items-center justify-center w-full p-4 bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                            Review System Logs <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}

import { ReceiptText } from 'lucide-react';
