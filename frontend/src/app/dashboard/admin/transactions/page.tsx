'use client';

import { useEffect, useState } from 'react';
import { getTransactions, Transaction } from '@/lib/api/transactions';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Users, CreditCard, Home, Search, Filter, ShieldCheck, History, Download, ExternalLink, IndianRupee } from 'lucide-react';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch {
            toast.error("Failed to load transaction history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const filtered = transactions.filter((tx: any) => {
        const title = typeof tx.Property === 'object' ? tx.Property?.title : (tx.property || '');
        const buyer = tx.Buyer?.first_name || tx.user || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
               buyer.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Transaction Ledger</h1>
                        <p className="text-gray-500 mt-1">Audit and monitor all financial activities within the platform.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search transactions..." 
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-10 rounded-lg flex items-center gap-2 font-bold px-4 hover:bg-gray-50">
                            <Download className="h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>
                
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                        <EmptyState title="No transactions found" description="The transaction registry is currently empty or no results match your search." />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-border">
                                        <th className="p-4 font-semibold text-gray-700">Ref ID</th>
                                        <th className="p-4 font-semibold text-gray-700">Buyer</th>
                                        <th className="p-4 font-semibold text-gray-700">Property Asset</th>
                                        <th className="p-4 font-semibold text-gray-700">Amount</th>
                                        <th className="p-4 font-semibold text-gray-700">Status</th>
                                        <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <AnimatePresence mode="popLayout">
                                        {filtered.map((tx: any) => (
                                            <motion.tr 
                                                key={tx.TransactionID || tx.id} 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                            #{(tx.TransactionID || tx.id || 'Unknown').toString().split('-')[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {(tx.Buyer?.first_name || tx.user || '?')[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{tx.Buyer?.first_name || tx.user || 'Unknown'}</div>
                                                            <div className="text-[10px] text-gray-500 font-medium">{tx.Buyer?.email || 'No email record'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 max-w-[200px]">
                                                        <Home className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                        <span className="font-bold text-gray-900 truncate">
                                                            {typeof tx.Property === 'object' ? tx.Property?.title : (tx.property || 'Untitled Asset')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-900">
                                                    <div>{formatNPR(tx.total_amount)}</div>
                                                    <div className="text-[10px] text-emerald-600 font-medium">Reconciled: {formatNPR(tx.amount_paid || '0')}</div>
                                                </td>
                                                <td className="p-4">
                                                    <StatusBadge status={tx.status} />
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {tx.status === 'PARTIAL' || (tx.Proofs?.some((p: any) => !p.is_verified)) ? (
                                                            <button 
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 transition-all border border-emerald-500"
                                                                onClick={() => {
                                                                    // Navigate to a detail or open verify dialog
                                                                    toast.success("Ready for audit sequence");
                                                                }}
                                                            >
                                                                Audit Proofs
                                                            </button>
                                                        ) : (
                                                            <button className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary transition-all flex items-center justify-center border border-border">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                <div className="mt-10 bg-primary/5 p-8 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-primary">Cryptographically Secure</h3>
                            <p className="text-xs text-gray-600 font-medium italic mt-0.5">All transactions are backed by immutable system logs and verifying authority records.</p>
                        </div>
                    </div>
                    <Button className="rounded-lg h-11 px-8 text-xs font-bold shadow-lg shadow-primary/20">Audit Full History</Button>
                </div>
            </Container>
        </div>
    );
}

