'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import {
    Users, Building, Clock, Activity, TrendingUp,
    CheckCircle, Zap, ShieldCheck, BarChart3, ArrowUpRight, ArrowRight,
    ReceiptText
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
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const load = async () => {
            try {
                const response = await api.get('admin/analytics/');
                setStats(response.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading || !stats) return <div className="h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

    const metrics = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: `+${stats.userGrowth}% Growth` },
        { label: 'Asset Inventory', value: stats.totalProperties, icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', trend: 'Global Registry' },
        { label: 'Total Revenue', value: `Rs ${(stats.revenue / 100000).toFixed(1)}L`, icon: ReceiptText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Audit Synchronized' },
        { label: 'Fraud Alerts', value: stats.activeFraudAlerts || 0, icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', trend: 'Immediate Action' },
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
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 italic">Advanced Admin Intelligence v3.0</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 font-outfit tracking-tighter leading-tight italic uppercase">Market Registry Monitor</h1>
                    <p className="text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-8 max-w-xl">
                        "High-precision telemetry from the SmartProperty network. Monitor transactional volume, asset integrity, and ecosystem expansion."
                    </p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
                    <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Global Sync Status: NOMINAL</span>
                </div>
            </header>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`h-14 w-14 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center border ${metric.border} transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                                <metric.icon className="h-6 w-6" />
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1 font-outfit tabular-nums italic tracking-tighter">{metric.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic">{metric.label}</div>
                        <div className="text-[11px] font-bold text-slate-500 italic opacity-60 flex items-center gap-2">
                             <TrendingUp className="h-3.5 w-3.5 opacity-30" /> {metric.trend}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Secondary Analytics Content */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Main Chart */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-100/50 duration-1000" />
                        
                        <div className="flex justify-between items-center mb-12 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter leading-tight italic uppercase">Volume Topology</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mt-2 font-black italic">Network Transactional Pulse Rate</p>
                            </div>
                            <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 italic">
                                12-Day Trajectory Scan
                            </div>
                        </div>

                        <div className="h-[350px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }} />
                                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorCount)" animationDuration={2000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Fraud Monitor Section */}
                    <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-all group-hover:scale-150 duration-1000" />
                        
                        <div className="flex justify-between items-center mb-12 relative z-10">
                             <div>
                                <h2 className="text-2xl font-black text-white font-outfit tracking-tighter italic uppercase flex items-center gap-4">
                                     <ShieldCheck className="h-7 w-7 text-rose-500" />
                                     Fraud Integrity Scan
                                </h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-2 font-black italic">Active Threat Detection Nodes</p>
                            </div>
                            <Link href="/dashboard/admin/fraud" className="h-12 px-6 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 hover:bg-rose-500 hover:text-white transition-all italic flex items-center gap-3">
                                Detailed Audit <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {[
                                { label: 'Compromised Assets', value: 'None', status: 'Optimal', icon: Building, color: 'text-emerald-400' },
                                { label: 'Anomalous Transfer', value: stats.activeFraudAlerts || 0, status: 'Action Req', icon: Activity, color: stats.activeFraudAlerts > 0 ? 'text-rose-500' : 'text-slate-400' },
                                { label: 'Node Authenticity', value: 'Verified', status: 'Nominal', icon: ShieldCheck, color: 'text-emerald-400' }
                            ].map((f, i) => (
                                <div key={f.label} className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                                    <f.icon className={`h-6 w-6 ${f.color}`} />
                                    <div className="text-2xl font-black text-white font-outfit italic">{f.value}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">{f.label}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${f.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{f.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Matrix */}
                <div className="xl:col-span-4 space-y-8">
                     {/* Category Distribution */}
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <h3 className="text-xl font-black text-slate-900 font-outfit tracking-tighter italic uppercase mb-8">Asset Topology</h3>
                        <div className="space-y-6">
                            {Object.entries(stats.categoryDistribution || {}).map(([cat, count]: [any, any]) => (
                                <div key={cat} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                                        <span className="text-slate-500">{cat}</span>
                                        <span className="text-slate-900">{count} Units</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / stats.totalProperties) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-indigo-500" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Stack */}
                    <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-xl font-black font-outfit tracking-tighter italic uppercase mb-8 relative z-10">Quick Directs</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: 'Properties', icon: Building, href: '/dashboard/admin/properties' },
                                { label: 'Users', icon: Users, href: '/dashboard/admin/users' },
                                { label: 'Transact', icon: ReceiptText, href: '/dashboard/admin/transactions' },
                                { label: 'Audit', icon: ShieldCheck, href: '/dashboard/admin/logs' }
                            ].map(item => (
                                <Link key={item.label} href={item.href} className="p-6 bg-white/10 hover:bg-white hover:text-indigo-600 rounded-3xl border border-white/10 hover:border-white transition-all flex flex-col gap-4">
                                    <item.icon className="h-6 w-6" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
