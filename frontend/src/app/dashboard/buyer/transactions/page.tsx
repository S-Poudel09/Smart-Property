'use client';

import { useEffect, useState } from 'react';
import { getTransactions, Transaction } from '@/lib/api/transactions';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Search, Download, Home, Clock, CreditCard, ChevronRight } from 'lucide-react';
import Container from '@/components/layout/Container';
import Link from 'next/link';
import { Button } from '@/components/common/Button';

export default function BuyerTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getTransactions()
            .then(data => {
                const arr = Array.isArray(data) ? data : (data as any).results ?? [];
                setTransactions(arr);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = transactions.filter(tx => 
        (tx.Property?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Purchase History</h1>
                        <p className="text-gray-500 mt-1">Track your property inquiries, offers, and successful acquisitions.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Filter by property name..." 
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-10 rounded-lg flex items-center gap-2 font-bold px-4 hover:bg-gray-50">
                            <Download className="h-4 w-4" /> Export Statements
                        </Button>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-20 border border-border shadow-sm text-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Receipt className="h-8 w-8 text-gray-200" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No transaction records</h2>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium italic">
                            You haven't initiated any purchases or inquiries yet. Explore our listings to find your match.
                        </p>
                        <Link href="/properties">
                            <Button className="h-11 rounded-lg px-8 font-bold shadow-lg shadow-primary/20">Browse Properties</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((tx, idx) => (
                                <motion.div
                                    key={tx.TransactionID || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 bg-gray-50 border border-border rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors">
                                                <Home className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => tx.Property?.id && (window.location.href=`/properties/${tx.Property.id}`)}>
                                                    {tx.Property?.title ?? 'Property Inquiry'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        <Clock className="h-3 w-3" />
                                                        Ref: #{(tx.TransactionID || 'ID').toString().split('-')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        <CreditCard className="h-3 w-3" />
                                                        {tx.payment_method || 'Standard Process'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="text-left md:text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                                <p className="text-xl font-bold text-gray-900">{formatNPR(tx.total_amount)}</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <StatusBadge status={tx.status} />
                                                <Link href={`/dashboard/buyer/transactions/${tx.TransactionID}`} className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:bg-gray-50 transition-all text-gray-400 hover:text-primary">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <div className="mt-12 bg-[#F8F7FC] p-8 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 italic">Buying Information</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Transactions stay in 'PENDING' status while we verify documentation. Once both parties sign and funds are cleared, the status updates to 'COMPLETED'.
                        Need help? <Link href="/support" className="text-primary font-bold hover:underline">Contact our support desk</Link>.
                    </p>
                </div>
            </Container>
        </div>
    );
}

