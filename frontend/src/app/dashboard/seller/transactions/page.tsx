'use client';

import { useEffect, useState } from 'react';
import { getTransactions, confirmTransaction, Transaction } from '@/lib/api/transactions';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import { Check, ShieldCheck, Search, Filter, AlertTriangle, User, Home, MoreVertical } from 'lucide-react';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';

export default function SellerTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            const arr = Array.isArray(data) ? data : (data as any).results ?? [];
            setTransactions(arr);
        } catch (e) {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const handleConfirm = async (id: string) => {
        try {
            await confirmTransaction(id);
            toast.success("Transaction confirmed");
            loadTransactions();
        } catch (e) {
            toast.error("Failed to confirm transaction");
        }
    };

    const filtered = transactions.filter(tx => 
        (tx.Property?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.Buyer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen items-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sales Registry</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage purchase requests and confirmed transactions for your properties.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by buyer or property..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                    <EmptyState 
                        title="No transactions found" 
                        description={searchTerm ? "No records match your search criteria." : "You haven't received any purchase requests yet. Make sure your listings are active!"} 
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-border">
                                    <th className="p-4 font-semibold text-gray-700">Buyer Entity</th>
                                    <th className="p-4 font-semibold text-gray-700">Property Asset</th>
                                    <th className="p-4 font-semibold text-gray-700">Valuation</th>
                                    <th className="p-4 font-semibold text-gray-700">Risk Audit</th>
                                    <th className="p-4 font-semibold text-gray-700">Status</th>
                                    <th className="p-4 font-semibold text-gray-700 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((tx) => (
                                        <motion.tr 
                                            key={tx.TransactionID} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 truncate max-w-[150px]">{tx.Buyer?.email?.split('@')[0] || 'Anonymous'}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{tx.Buyer?.email ?? '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 max-w-[200px]">
                                                    <Home className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                    <span className="font-bold text-gray-900 truncate">{tx.Property?.title ?? '—'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">{formatNPR(tx.total_amount)}</td>
                                            <td className="p-4">
                                                {tx.card_on_dark_web ? (
                                                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-red-50 text-red-600 flex items-center gap-1.5 w-fit border border-red-100">
                                                        <AlertTriangle className="h-3.5 w-3.5" /> High Risk
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-600 flex items-center gap-1.5 w-fit border border-emerald-100">
                                                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Safe
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={tx.status} />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {tx.status === 'PENDING' && (
                                                        <button 
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-sm border border-emerald-500"
                                                            onClick={() => handleConfirm(tx.TransactionID)}
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Confirm Sale
                                                        </button>
                                                    )}
                                                    <button className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-all flex items-center justify-center">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
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
            
            <div className="bg-[#F8F7FC] p-8 rounded-xl border border-border flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-primary">Secure Settlement System</h3>
                        <p className="text-xs text-gray-600 font-medium italic mt-0.5">Every inquiry is risk-audited using our proprietary security algorithms before reaching you.</p>
                    </div>
                </div>
                <Button variant="outline" className="h-10 rounded-lg text-xs font-bold border-border text-gray-500">Security Logs</Button>
            </div>
        </div>
    );
}

