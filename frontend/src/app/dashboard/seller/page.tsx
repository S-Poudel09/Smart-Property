'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import { Home, DollarSign, Clock, CheckCircle, PlusCircle, ArrowRight, LayoutDashboard, Briefcase, FileText } from 'lucide-react';
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
        bedrooms: number;
        bathrooms: number;
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
                    pending_reviews: listings.filter((p: any) => p.status === 'submitted').length,
                    completed_sales: completed.length,
                    recent_listings: listings.slice(0, 5).map((p: any, index: number) => ({
                        id: String(p.id || p._id || p.PropertyID || p.property_id || `listing-${index}`),
                        title: p.title || 'Untitled',
                        price: p.price || '0',
                        status: p.status || 'DRAFT',
                        bedrooms: p.bedrooms || 0,
                        bathrooms: p.bathrooms || 0,
                        location: p.location || 'Nepal'
                    })),
                    recent_transactions: transactions.slice(0, 5),
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

    if (loading) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader size="lg" /></div>;

    const summaryCards = [
        { label: 'Total Listings', value: stats!.total_listings, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Revenue', value: formatNPR(stats!.total_revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Review', value: stats!.pending_reviews, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Sold Properties', value: stats!.completed_sales, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your properties and track your sales performance.</p>
                </div>
                <Link href="/dashboard/seller/add-listing">
                    <Button className="flex items-center gap-2 px-6 h-12 rounded-lg font-bold">
                        <PlusCircle className="h-5 w-5" /> Add New Listing
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
                {/* Recent Listings */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 className="text-lg font-bold text-foreground">My Recent Listings</h2>
                        <Link href="/dashboard/seller/listings" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-border">
                                    <th className="px-6 py-4 font-semibold text-gray-700">Property</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats!.recent_listings.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-gray-500 italic">
                                            You haven't added any listings yet.
                                        </td>
                                    </tr>
                                ) : (
                                    stats!.recent_listings.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => window.location.href=`/dashboard/seller/listings/edit/${p.id}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{p.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">{p.location}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                Rs {Number(p.price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <StatusBadge status={p.status} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions & Tips */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href="/dashboard/seller/listings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                                <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">Manage Listings</span>
                            </Link>
                            <Link href="/dashboard/seller/transactions" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                                <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">Sales History</span>
                            </Link>
                            <Link href="/dashboard/seller/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                                <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">Update KYC Documents</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-3 mb-4 text-primary">
                            <LayoutDashboard className="h-5 w-5" />
                            <h3 className="font-bold">Seller Tip</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Verified properties with clear images of Lalpurja and the site get 3x more views and faster approvals from our team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

