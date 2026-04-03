'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUser } from '@/lib/auth/getUser';
import { getTransactionById, uploadPaymentProof, confirmTransaction, Transaction } from '@/lib/api/transactions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { KhaltiPaymentDemo } from '@/components/transaction/KhaltiPaymentDemo';
import { TransactionStepper } from '@/components/property/TransactionStepper';
import { ArrowLeft, Building2, Calendar, FileText, User, ShieldCheck, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatNPR } from '@/lib/utils/currency';
import { Loader } from '@/components/common/Loader';

export default function BuyerTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        try {
            const data = await getTransactionById(id);
            setTransaction(data);
        } catch (e) {
            console.error('Failed to load transaction', e);
            toast.error('Transaction records out of sync');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s for status updates
        return () => clearInterval(interval);
    }, [id]);

    const handleKhaltiSuccess = async (referenceId: string) => {
        setIsActionLoading(true);
        try {
            const blob = new Blob(["Demo Payment via Khalti Reference: " + referenceId], { type: 'text/plain' });
            const file = new File([blob], `khalti_${referenceId}.txt`, { type: 'text/plain' });
            
            await uploadPaymentProof(id, parseFloat(transaction?.total_amount || '0'), file, `Khalti Ref: ${referenceId}`);
            toast.success('Payment captured successfully!');
            fetchData();
        } catch (e) {
            toast.error('Failed to sync payment record');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <Container className="py-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Transaction Not Found</h2>
                    <Link href="/dashboard/buyer/transactions" className="mt-4 inline-block text-blue-600 hover:underline">
                        Back to My Transactions
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['buyer']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/buyer/transactions" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Transactions
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Transaction Heading */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">{transaction.Property?.title || 'Property Acquisition'}</h1>
                                            <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-tighter">Transaction: #{id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-1">
                                        <StatusBadge status={transaction.status} className="scale-110" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Started {new Date(transaction.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <TransactionStepper currentStep={transaction.status === 'COMPLETED' ? 5 : (transaction.Proofs?.length > 0 ? 4 : 3)} />
                                </div>
                            </div>

                            {/* Payment Section */}
                            {(transaction.status === 'PENDING' || transaction.status === 'PARTIAL') && (
                                <div className="space-y-8">
                                    <KhaltiPaymentDemo 
                                        amount={parseFloat(transaction.total_amount) - parseFloat(transaction.amount_paid || '0')} 
                                        propertyTitle={transaction.Property?.title || 'Property Purchase'} 
                                        onSuccess={handleKhaltiSuccess}
                                    />
                                    
                                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl flex items-start gap-4">
                                        <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-emerald-900 text-sm">Escrow Protection Active</h4>
                                            <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">
                                                In Nepal's digital economy, security is paramount. Your funds will be held in our secure internal ledger until both parties confirm documentation at Malpot.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {transaction.Proofs?.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Payment Reconciliation</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {transaction.Proofs.map((proof, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                                                        <IndianRupee className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{formatNPR(parseFloat(proof.amount))}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{proof.notes || 'Khalti Gateway Capture'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${proof.is_verified ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                                        {proof.is_verified ? 'Verified' : 'Reviewing'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {transaction.status === 'COMPLETED' && (
                                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-20 w-20 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 flex-shrink-0">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Deal Finalized</h3>
                                        <p className="text-gray-600 font-medium max-w-md">
                                            Verification complete. Detailed ownership documents have been generated. You can now access your property keys via the Seller.
                                        </p>
                                        <Button className="mt-6 font-bold uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/20">Download Deed of Sale</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-400">Negotiated Price</span>
                                        <span className="font-bold text-gray-900">{formatNPR(parseFloat(transaction.total_amount))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-400">Paid to Ledger</span>
                                        <span className="font-bold text-gray-900">{formatNPR(parseFloat(transaction.amount_paid || '0'))}</span>
                                    </div>
                                    <div className="border-t border-dashed pt-5 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Remaining Due</span>
                                        <span className="text-xl font-bold text-primary">{formatNPR(parseFloat(transaction.total_amount) - parseFloat(transaction.amount_paid || '0'))}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 h-24 w-24 bg-gray-50 rounded-full -mr-12 -mt-12" />
                                <h3 className="text-lg font-bold text-gray-900 mb-6 relative z-10">Verification Info</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Seller Principal</p>
                                            <p className="text-sm font-bold text-gray-900">{transaction.Seller?.first_name} {transaction.Seller?.last_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Agreement Type</p>
                                            <p className="text-sm font-bold text-gray-900">Digital Smart Contract</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {transaction.status === 'PENDING' && transaction.amount_paid === '0' && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-start gap-3 text-amber-600 mb-4">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <p className="text-sm font-bold">Awaiting Transaction Step</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4 font-medium italic">You can proceed to pay via Khalti above. Once paid, the seller or admin will verify the receipt.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
