'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import { 
    Users, Home, ReceiptText, ShieldAlert, 
    TrendingUp, Activity, 
    ArrowRight, LayoutDashboard, ShieldCheck, 
    Search, Bell
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
                    api.get('admin/analytics/'),
                    api.get('admin/fraud/')
                ]);
                setStats(statsRes.data);
                setFraudAlerts(alertsRes.data || []);
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

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Properties', value: stats.totalProperties || 0, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Transactions', value: stats.totalTransactions || 0, icon: ReceiptText, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Security Health', value: 'High', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground font-sans">Admin Overview</h1>
                        <p className="text-gray-500 mt-1">Platform-wide analytics and system monitoring.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin/properties">
                            <Button className="flex items-center gap-2 h-11 px-5 rounded-lg font-bold">
                                Review Queue
                            </Button>
                        </Link>
                        <button className="h-11 w-11 bg-white border border-border flex items-center justify-center rounded-lg text-gray-400 hover:text-primary transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {summaryCards.map((card, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-xl border border-border shadow-sm group hover:shadow-md transition-all"
                        >
                            <div className={`h-12 w-12 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">{card.label}</h3>
                            <p className="text-2xl font-bold text-foreground">{card.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Analytics Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground font-sans">Platform Growth</h2>
                                    <p className="text-sm text-gray-400 mt-1">Daily transaction volume and system usage</p>
                                </div>
                                <select className="bg-gray-50 border border-border rounded-lg px-4 py-2 text-sm font-bold text-gray-600 outline-none">
                                    <option>Last 30 Days</option>
                                    <option>Last 7 Days</option>
                                </select>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.transactionData || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}}
                                            dy={10}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                            cursor={{ fill: '#F9FAFB' }}
                                        />
                                        <Bar dataKey="amount" fill="#6D28D9" radius={[4, 4, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-primary p-8 rounded-xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                <h3 className="text-xl font-bold mb-2">User Retention</h3>
                                <p className="text-white/70 text-sm mb-6 font-medium leading-relaxed">Engagement is up by 15% following the new minimal design update.</p>
                                <Button className="w-full bg-white text-primary hover:bg-gray-100 font-bold py-3 h-auto">View Detailed Analytics</Button>
                            </div>
                            <div className="bg-white p-8 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">System Health</h3>
                                    <p className="text-gray-500 text-sm mb-6">Verification servers are running at 100% capacity.</p>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-600 font-bold text-sm">
                                    <Activity className="h-5 w-5" /> Operational
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-border shadow-sm border-t-4 border-t-red-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <h2 className="font-bold text-foreground">Security Alerts</h2>
                            </div>

                            <div className="space-y-4">
                                {fraudAlerts.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm italic">No recent threats detected. Platform secure.</div>
                                ) : (
                                    fraudAlerts.map((alert: any) => (
                                        <div key={alert.id} className="p-4 bg-gray-50 rounded-lg border border-border group hover:border-primary/20 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                    alert.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {alert.risk} Risk
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">{alert.date}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">{alert.type}</p>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">{alert.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <Link href="/dashboard/admin/logs">
                                <Button variant="outline" className="w-full mt-6 h-10 text-xs font-bold text-gray-500 border-border hover:bg-gray-50">View All Alerts</Button>
                            </Link>
                        </div>

                        <div className="bg-primary/5 p-6 rounded-xl border border-border">
                            <h3 className="font-bold text-primary flex items-center gap-2 mb-3">
                                <LayoutDashboard className="h-4 w-4" /> Admin Tip
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed italic">
                                "Properties with verified document uploads are processed 40% faster. Encourage sellers to provide clear Lalpurja scans."
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

