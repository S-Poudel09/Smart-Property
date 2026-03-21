'use client';

import { useEffect, useState } from 'react';
import { getTransactions, confirmTransaction, Transaction } from '@/lib/api/transactions';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import { Check, ShieldCheck } from 'lucide-react';
import { formatNPR } from '@/lib/utils/currency';

export default function SellerTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-12 flex justify-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Sales</h1>

            {transactions.length === 0 ? (
                <EmptyState title="No sales found" description="You haven't received any purchase requests yet." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-gray-600">Buyer</th>
                                <th className="p-4 font-medium text-gray-600">Property</th>
                                <th className="p-4 font-medium text-gray-600">Amount</th>
                                <th className="p-4 font-medium text-gray-600">Security</th>
                                <th className="p-4 font-medium text-gray-600">Status</th>
                                <th className="p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map(tx => (
                                <tr key={tx.TransactionID} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{tx.Buyer?.email ?? '—'}</td>
                                    <td className="p-4 font-medium">{tx.Property?.title ?? '—'}</td>
                                    <td className="p-4">{formatNPR(tx.total_amount)}</td>
                                    <td className="p-4">
                                        {tx.card_on_dark_web ? (
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ High Risk</span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                <ShieldCheck className="h-3 w-3" /> Safe
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={tx.status} />
                                    </td>
                                    <td className="p-4">
                                        {tx.status === 'PENDING' && (
                                            <Button size="sm" variant="outline" className="gap-1 h-8 text-xs border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleConfirm(tx.TransactionID)}>
                                                <Check className="w-3 h-3" /> Confirm Sale
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
