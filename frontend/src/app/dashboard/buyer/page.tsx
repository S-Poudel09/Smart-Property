'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import {
    Building, FileText, CreditCard, TrendingUp,
    Search, Home, ArrowRight, MapPin, Bath, BedDouble, Heart, Wallet, Calculator,
    LayoutDashboard
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
                    recommended_properties: properties.filter((p: any) => p.status === 'published' || p.status === 'approved').slice(0, 3),
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

    if (loading) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Viewed Properties', value: stats!.recommended_properties.length, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'My Inquiries', value: stats!.transaction_count, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Loan Requests', value: stats!.loan_count, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Saved Homes', value: '12', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                    <p className="text-gray-500 mt-1">Here's an overview of your property search and finance activity.</p>
                </div>
                <Link href="/properties">
                    <Button className="flex items-center gap-2 h-12 px-6 rounded-lg font-bold">
                        <Search className="h-5 w-5" /> Explore Properties
                    </Button>
                </Link>
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
                {/* EMI Calculator */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border bg-gray-50/50">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" /> Mortgage & EMI Calculator
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Estimate your monthly payments for your dream home.</p>
                        </div>
                        <div className="p-8">
                            <EMICalculator />
                        </div>
                    </div>

                    <div className="bg-[#F8F7FC] p-8 rounded-xl border border-border">
                        <div className="flex items-center gap-3 mb-4 text-primary font-bold">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Buyer Tip</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                            "Getting pre-approved for a loan increases your chances of closing a deal by 30%. Use our EMI calculator to find a budget that works for you."
                        </p>
                    </div>
                </div>

                {/* Sidebar: Recommended & Transactions */}
                <div className="space-y-6">
                    {/* Recommended Estates */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-foreground">Top Recommendations</h2>
                            <Link href="/properties" className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {stats!.recommended_properties.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6 italic">No recommendations yet.</p>
                            ) : (
                                stats!.recommended_properties.map((p: any, i: number) => {
                                    const rawId = p.id || p._id || p.PropertyID || p.property_id;
                                    const finalId = rawId ? String(rawId) : `recommended-${i}`;
                                    return (
                                        <Link key={finalId} href={`/properties/${finalId}`} className="block group">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-border group-hover:border-primary/20 transition-all hover:bg-white group-hover:shadow-sm">
                                                <p className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{p.title}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location}</span>
                                                </div>
                                                <div className="mt-3 flex justify-between items-center">
                                                    <p className="font-bold text-primary">{formatNPR(p.price)}</p>
                                                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Transaction Registry */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <h2 className="font-bold text-foreground">Recent Activity</h2>
                        </div>
                        <div className="space-y-3">
                            {stats!.recent_transactions.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6 italic">No recent inquiries.</p>
                            ) : (
                                stats!.recent_transactions.map((t: any, i: number) => {
                                    const rawId = t.id || t._id || t.TransactionID || t.transaction_id;
                                    const finalId = rawId ? String(rawId) : `transaction-${i}`;
                                    return (
                                        <div key={finalId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-border hover:bg-white transition-all">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{t.Property?.title ?? 'Property Inquiry'}</p>
                                                <p className="text-[10px] text-primary font-bold mt-1">{formatNPR(t.total_amount)}</p>
                                            </div>
                                            <StatusBadge status={t.status} />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <Link href="/dashboard/buyer/transactions" className="mt-6 block">
                            <Button variant="outline" className="w-full h-10 rounded-lg text-xs font-bold border-border text-gray-500 hover:bg-gray-50">Transaction History</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

