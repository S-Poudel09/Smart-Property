'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import { 
    Users, Home, ReceiptText, ShieldAlert, 
    TrendingUp, TrendingDown, Activity, 
    CheckCircle, XCircle, AlertTriangle, ArrowRight,
    Crown, ScrollText, Sparkles, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, alertsRes] = await Promise.all([
                    api.get('/admin/analytics/'),
                    api.get('/admin/fraud/')
                ]);
                setStats(statsRes.data);
                setFraudAlerts(alertsRes.data);
            } catch (e) {
                console.error(e);
                setStats({
                    totalUsers: 0, totalProperties: 0, totalTransactions: 0,
                    revenue: 0, userGrowth: 0, transactionData: []
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="p-12 flex justify-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Total Users', value: stats.totalUsers, growth: stats.userGrowth, icon: Users, color: 'blue' },
        { label: 'Active Listings', value: stats.totalProperties, icon: Home, color: 'emerald' },
        { label: 'Transactions', value: stats.totalTransactions, icon: ReceiptText, color: 'amber' },
        { label: 'System Health', value: '99.9%', icon: Activity, color: 'indigo' },
    ];

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex justify-between items-end"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Crown className="h-5 w-5 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Imperial Oversight</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-serif text-primary leading-tight">System Intelligence</h1>
                        <p className="text-gray-400 mt-2 font-medium italic">Real-time monitoring and advanced fraud detection</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin/logs">
                            <Button className="h-14 px-8 bg-primary text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/30 hover:bg-accent hover:text-primary shadow-xl transition-all flex items-center gap-3 group">
                                <ScrollText className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                Sovereign Ledger
                            </Button>
                        </Link>
                        <div className="bg-red-50/50 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-red-100 shadow-sm">
                            <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
                            <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">{fraudAlerts?.length || 0} Active Threats</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {summaryCards.map((card, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-accent/10 shadow-xl shadow-accent/5 hover:shadow-2xl hover:shadow-accent/10 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="h-14 w-14 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <card.icon className="h-7 w-7" />
                                </div>
                                {card.growth && (
                                    <div className={`flex items-center text-xs font-black ${card.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {card.growth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                        {Math.abs(card.growth)}%
                                    </div>
                                )}
                            </div>
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{card.label}</h3>
                            <p className="text-4xl font-serif text-primary">{card.value?.toLocaleString()}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Analytics */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-accent/10 shadow-xl shadow-accent/5">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-serif text-primary">Transaction Volume</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Platform Performance Analytics</p>
                                </div>
                                <select className="bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full px-6 py-3 outline-none border-none shadow-lg">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Year to Date</option>
                                </select>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.transactionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" opacity={0.5} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 900}}
                                            dy={15}
                                        />
                                        <YAxis hide />
                                        <Bar dataKey="amount" fill="#4c1d95" radius={[10, 10, 10, 10]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div whileHover={{ y: -5 }} className="bg-emerald-800 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-400/20 transition-all" />
                                <h3 className="text-2xl font-serif mb-2 relative z-10">Growth Engine</h3>
                                <p className="text-emerald-100/70 text-sm mb-8 font-medium italic relative z-10">User retention is up by 15% this quarter.</p>
                                <Button className="rounded-full !py-4 w-full font-black uppercase tracking-widest text-[10px] bg-white text-emerald-800 hover:bg-emerald-50 shadow-xl relative z-10">View Imperial Reports</Button>
                            </motion.div>
                             <Link href="/dashboard/admin/logs" className="block">
                                <motion.div whileHover={{ y: -5 }} className="premium-gradient h-full p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-accent/20">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/20 transition-all" />
                                    <h3 className="text-2xl font-serif mb-2 text-accent relative z-10">Sovereign Ledger</h3>
                                    <p className="text-gray-400 text-sm mb-8 font-medium italic relative z-10">Review the eternal records of all system activities.</p>
                                    <Button className="rounded-full !py-4 w-full font-black uppercase tracking-widest text-[10px] bg-accent text-[#1a1a2e] hover:bg-accent/80 shadow-xl relative z-10 flex items-center justify-center gap-2">
                                        Audit Realm <Activity className="h-3 w-3" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Fraud Alerts Sidebar */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-red-100 shadow-xl shadow-red-900/5 border-t-8 border-t-red-500">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-14 w-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <ShieldAlert className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-serif text-primary">Fraud Alerts</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mt-1">High Risk Detections</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {fraudAlerts?.map((alert: any) => (
                                    <motion.div 
                                        key={alert.id} 
                                        whileHover={{ x: 5 }}
                                        className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                                                alert.risk === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                alert.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                                {alert.risk} Risk
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold italic">{alert.date}</span>
                                        </div>
                                        <p className="text-sm font-black text-primary mb-1">{alert.type}</p>
                                        <p className="text-[11px] text-gray-500 font-medium italic leading-relaxed">{alert.description || `Source: ${alert.property || alert.user}`}</p>
                                        
                                        <button className="absolute right-4 bottom-4 h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <ArrowRight className="h-5 w-5 text-accent" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <Button variant="outline" className="w-full mt-10 rounded-full !py-4 text-red-600 border-red-100 hover:bg-red-50 font-black uppercase tracking-widest text-[10px]">Clear Archive</Button>
                        </div>

                        <div className="premium-gradient p-8 rounded-[2.5rem] relative overflow-hidden group border border-accent/20">
                            <div className="absolute top-0 left-0 w-full h-full bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <Shield className="h-8 w-8 text-accent mb-4" />
                                <p className="text-[11px] text-gray-400 font-medium italic leading-relaxed">
                                    "Your Imperial Guard is watching. All actions are cataloged in the Sovereign Ledger for eternal oversight."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
