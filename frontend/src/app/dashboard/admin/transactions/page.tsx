'use client';

import { useEffect, useState } from 'react';
import { getTransactions, Transaction } from '@/lib/api/transactions';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Users, CreditCard, Home, Search, Filter, Crown, Play, History, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    if (loading) return <div className="p-12 flex justify-center bg-[#fffdf9] min-h-screen"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12">
            <div className="space-y-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <History className="h-5 w-5 text-[#c5a059]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Financial Ledger</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-serif text-[#1a1a2e]">System Transactions</h1>
                        <p className="text-gray-400 mt-2 font-medium italic">Monitoring sovereign asset exchanges across the platform</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
                            <input 
                                type="text" 
                                placeholder="Search ledger..." 
                                className="pl-12 pr-6 py-4 bg-white/80 backdrop-blur-xl border border-[#c5a059]/10 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 shadow-lg"
                            />
                        </div>
                        <Button variant="outline" className="rounded-full h-14 w-14 border-[#c5a059]/20 bg-white/80 backdrop-blur-xl flex items-center justify-center shadow-lg hover:bg-royal-gold/5 transition-all">
                            <Filter className="h-5 w-5 text-[#c5a059]" />
                        </Button>
                    </div>
                </motion.div>
                
                {transactions.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-20 border border-[#c5a059]/10 shadow-xl">
                        <EmptyState title="No transactions detected" description="The imperial ledger is currently empty." />
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-[#c5a059]/5 border border-[#c5a059]/10 overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#c5a059]/10">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Imperial ID</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Beneficiary</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Sovereign Asset</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Valuation</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Method</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c5a059]/5">
                                {transactions.map((tx: any, i) => (
                                    <motion.tr 
                                        key={tx.TransactionID || tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-[#c5a059]/5 transition-colors group"
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-[#1a1a2e] rounded-lg flex items-center justify-center text-[8px] font-black text-[#c5a059] shadow-inner">
                                                    TX
                                                </div>
                                                <span className="font-mono text-[11px] text-gray-400 font-bold group-hover:text-[#1a1a2e] transition-colors">
                                                    {(tx.TransactionID || tx.id || 'Unknown').toString().split('-')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-royal-gold/10 flex items-center justify-center text-royal-gold">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-[#1a1a2e]">{tx.Buyer?.first_name || tx.user || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold italic">{tx.Buyer?.email || 'No email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <Home className="h-4 w-4 text-[#c5a059]" />
                                                <span className="text-sm font-bold text-[#1a1a2e] group-hover:text-[#c5a059] transition-colors">
                                                    {typeof tx.Property === 'object' ? tx.Property?.title : (tx.property || 'Untitled Asset')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-serif text-[#1a1a2e]">
                                                    Rs {(Number(tx.total_amount || tx.amount || 0)).toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Fully Paid</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 w-fit">
                                                <CreditCard className="h-3 w-3 text-gray-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{tx.payment_method || 'Direct Account'}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <StatusBadge status={tx.status} className="h-7 px-4 shadow-sm" />
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
                
                <div className="bg-[#1a1a2e] p-10 rounded-[3rem] relative overflow-hidden group border border-[#c5a059]/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center gap-8">
                        <div className="h-20 w-20 bg-[#c5a059]/10 rounded-full flex items-center justify-center text-[#c5a059] shadow-inner">
                            <Crown className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif text-white mb-1">Imperial Ledger Security</h3>
                            <p className="text-gray-400 text-sm font-medium italic">Every transaction is cryptographicically sealed and backed by Malpot heritage records.</p>
                        </div>
                        <Button className="ml-auto rounded-full px-10 h-16 font-black uppercase tracking-[0.2em] text-[11px] bg-[#c5a059] text-[#1a1a2e] hover:bg-white hover:text-[#1a1a2e] transition-all duration-500">Seal Archives</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
