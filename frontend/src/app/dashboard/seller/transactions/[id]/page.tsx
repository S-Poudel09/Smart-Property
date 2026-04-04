'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getTransactionById, verifyPaymentProof, confirmTransaction, Transaction } from '@/lib/api/transactions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { TransactionStepper } from '@/components/property/TransactionStepper';
import { ArrowLeft, Building2, User, FileText, CheckCircle2, AlertCircle, ExternalLink, IndianRupee, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatNPR } from '@/lib/utils/currency';
import { Loader } from '@/components/common/Loader';

export default function SellerTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
            console.error('Failed to fetch transaction', e);
            toast.error('Could not sync transaction state');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll for updates
        return () => clearInterval(interval);
    }, [id]);

    const handleVerifyProof = async (proofId: string) => {
        setIsActionLoading(true);
        try {
            await verifyPaymentProof(id, proofId);
            toast.success('Payment proof verified!');
            fetchData();
        } catch (e) {
            toast.error('Failed to verify proof');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleConfirmSale = async () => {
        if (!confirm('Are you sure the total amount has been received correctly? This will close the deal.')) return;
        setIsActionLoading(true);
        try {
            await confirmTransaction(id);
            toast.success('Sale successfully confirmed!');
            fetchData();
        } catch (e) {
            toast.error('Failed to confirm sale');
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
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Transaction Not Found</h2>
                <Link href="/dashboard/seller/transactions" className="mt-4 inline-block text-blue-600 hover:underline">
                    Back to My Sales
                </Link>
            </Container>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/seller/transactions" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sales
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Section */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">Sale Review: {transaction.Property?.title || 'Asset Disposal'}</h1>
                                            <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-tighter">TRX: #{id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end">
                                        <StatusBadge status={transaction.status} className="scale-110" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Started {new Date(transaction.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="mt-12">
                                    <TransactionStepper currentStep={transaction.status === 'COMPLETED' ? 5 : (transaction.Proofs?.length > 0 ? 4 : 3)} />
                                </div>
                            </div>

                            {/* Proof Review Section */}
                            {transaction.Proofs?.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <FileText className="h-6 w-6 text-primary" />
                                        Payment Reconciliation
                                    </h3>
                                    <div className="space-y-6">
                                        {transaction.Proofs.map((proof, idx) => (
                                            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                                                            <IndianRupee className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-bold text-gray-900">{formatNPR(parseFloat(proof.amount))}</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{proof.notes || 'In-App Payment Capture'}</p>
                                                        </div>
                                                    </div>
                                                    {!proof.is_verified ? (
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                                            onClick={() => handleVerifyProof(proof.ProofID)}
                                                            isLoading={isActionLoading}
                                                        >
                                                            Verify Proof
                                                        </Button>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                                            <CheckCircle2 className="h-4 w-4" /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="aspect-[4/1] bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 font-mono text-[10px] uppercase tracking-widest group relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <FileText className="h-4 w-4 mr-2" /> Digital Receipt Verified
                                                </div>
                                            </div>
                                        ))}

                                        {transaction.status !== 'COMPLETED' && parseFloat(transaction.amount_paid) >= parseFloat(transaction.total_amount) && (
                                            <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-6">
                                                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-start gap-4 w-full">
                                                    <ShieldCheck className="h-6 w-6 text-indigo-500 shrink-0" />
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-indigo-900 text-sm italic underline">Accounting Ledger Status: BALANCED</h4>
                                                        <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                                                            The full negotiated amount has been verified. You may now finalize the sale to transfer digital ownership credentials to the buyer.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleConfirmSale}
                                                    isLoading={isActionLoading}
                                                    className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] bg-[#1a1a2e] hover:bg-black rounded-2xl shadow-2xl shadow-black/20"
                                                >
                                                    Finalize Sale & Close Record
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {transaction.status === 'COMPLETED' && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 animate-in fade-in zoom-in">
                                    <div className="h-20 w-20 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-indigo-900 mb-2 italic">Sale Successfully Archived</h3>
                                        <p className="text-indigo-700 font-medium max-w-md">
                                            The ledger is closed. Total valuation of {formatNPR(parseFloat(transaction.total_amount))} has been reconciled. This asset is now marked as Sold across all systems.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {transaction.status === 'PENDING' && transaction.Proofs?.length === 0 && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <ClockIcon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-amber-900">Awaiting Primary Payout</h3>
                                        <p className="text-amber-700 text-sm font-medium">The buyer has initialized the purchase process. We will alert you immediately upon payment capture.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-400">Total Asset Value</span>
                                        <span className="font-bold text-gray-900">{formatNPR(parseFloat(transaction.total_amount))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-400">Total Verified Payout</span>
                                        <span className="font-bold text-indigo-600">{formatNPR(parseFloat(transaction.amount_paid || '0'))}</span>
                                    </div>
                                    <div className="border-t border-dashed pt-5 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Pending Reconciliation</span>
                                        <span className="text-xl font-bold text-primary">{formatNPR(parseFloat(transaction.total_amount) - parseFloat(transaction.amount_paid || '0'))}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 font-serif">Purchaser Credentials</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Purchaser Legal Name</p>
                                            <p className="text-sm font-bold text-gray-900">{transaction.Buyer?.first_name} {transaction.Buyer?.last_name || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">ID Verification</p>
                                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest text-[10px]">KYC Verified (Govt of Nepal)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    );
}
