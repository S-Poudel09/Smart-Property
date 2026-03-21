'use client';

import { useEffect, useState } from 'react';
import { getTransactions, Transaction } from '@/lib/api/transactions';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Receipt, ArrowRight, Navigation, Sparkles, Fingerprint } from 'lucide-react';
import Container from '@/components/layout/Container';

export default function BuyerTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTransactions()
            .then(data => {
                const arr = Array.isArray(data) ? data : (data as any).results ?? [];
                setTransactions(arr);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-[#fffdf9] flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-16">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Crown className="h-6 w-6 text-accent" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Imperial Ledger</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif text-primary leading-tight">Purchase Manifest</h1>
                    <p className="text-xl text-gray-400 mt-4 font-medium italic border-l-4 border-accent/30 pl-8">
                        "The eternal record of all sovereign estate acquisitions and financial transfers."
                    </p>
                </motion.div>

                {transactions.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-white/60 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-accent/20"
                    >
                        <div className="h-24 w-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-gold-glow">
                            <Receipt className="h-10 w-10 text-accent" />
                        </div>
                        <h2 className="text-4xl font-serif text-primary mb-4 leading-tight">Ledger Currently Empty</h2>
                        <p className="text-gray-400 max-w-md mx-auto font-medium italic mb-12">
                            "The royal archives contain no purchase records for your account. Begin your journey by selecting a worthy estate."
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-accent/10 shadow-3xl overflow-hidden shadow-accent/5"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-accent/5 text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">
                                        <th className="px-12 py-10">Verification Key</th>
                                        <th className="px-8 py-10">Estate Identity</th>
                                        <th className="px-8 py-10">Investment</th>
                                        <th className="px-8 py-10">Method</th>
                                        <th className="px-12 py-10 text-right">Decree State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-accent/5">
                                    <AnimatePresence>
                                        {transactions.map((tx, idx) => (
                                            <motion.tr 
                                                key={tx.TransactionID}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-accent/[0.03] transition-colors group cursor-pointer"
                                            >
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <Fingerprint className="h-4 w-4 text-accent opacity-40 group-hover:opacity-100 transition-opacity" />
                                                        <span className="font-mono text-[10px] font-black text-gray-400 tracking-tighter uppercase">{tx.TransactionID?.split('-')[0]}...</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="font-serif text-lg text-primary">{tx.Property?.title ?? '—'}</div>
                                                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 italic">Estate ID: {tx.Property?.id ?? 'N/A'}</div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="font-serif text-xl text-primary">{formatNPR(tx.total_amount)}</div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-gray-500 text-[9px] font-black uppercase tracking-widest border border-gray-100 group-hover:bg-white group-hover:border-accent/20 transition-all">
                                                        <Sparkles className="h-3 w-3 text-accent" />
                                                        {tx.payment_method}
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8 text-right">
                                                    <StatusBadge status={tx.status} />
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </Container>
        </div>
    );
}
