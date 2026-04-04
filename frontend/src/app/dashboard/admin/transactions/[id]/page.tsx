'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getTransactionById, verifyPaymentProof, confirmTransaction, Transaction } from '@/lib/api/transactions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Building2, User, ShieldCheck, Download, History as HistoryIcon, CheckCircle2, ChevronRight, FileText, AlertCircle, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatNPR } from '@/lib/utils/currency';
import { Loader } from '@/components/common/Loader';

export default function AdminTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        try {
            const data = await getTransactionById(id);
            setTransaction(data);
        } catch {
            toast.error('Audit trail interrupted');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleVerifyProof = async (proofId: string) => {
        setIsActionLoading(true);
        try {
            await verifyPaymentProof(id, proofId);
            toast.success('Funds Verified & Ledger Updated');
            fetchData();
        } catch {
            toast.error('Verification sequence failed');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFinalConfirm = async () => {
        if (!confirm("Confirm full payment and close this transaction?")) return;
        setIsActionLoading(true);
        try {
            await confirmTransaction(id);
            toast.success('Transaction Finalized');
            fetchData();
        } catch {
            toast.error('Confirmation failed');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <div className="p-12 flex justify-center bg-background min-h-screen items-center"><Loader size="lg" /></div>;
    if (!transaction) return <div className="p-12 text-center">Transaction registry out of sync.</div>;

    const remaining = parseFloat(transaction.total_amount) - parseFloat(transaction.amount_paid || '0');

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/admin/transactions" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Return to Ledger
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Transaction Core */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <StatusBadge status={transaction.status} className="scale-125" />
                                </div>
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                                        <Building2 className="h-8 w-8 text-[#020617]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{transaction.Property?.title || 'Unknown Property Asset'}</h1>
                                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Audit Tracking ID: #{id.toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Valuation</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNPR(parseFloat(transaction.total_amount))}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Reconciled</p>
                                        <p className="text-xl font-bold text-indigo-600">{formatNPR(parseFloat(transaction.amount_paid || '0'))}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 md:col-span-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Outstanding</p>
                                        <p className="text-xl font-bold text-amber-600">{formatNPR(remaining)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Audits */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Proof of Payment Inventory</h3>
                                            <p className="text-xs text-gray-400 font-medium">Verify buyer-submitted documents against bank records.</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black bg-primary/5 text-primary px-4 py-2 rounded-full uppercase tracking-widest border border-primary/10">
                                        {transaction.Proofs?.length || 0} Submissions
                                    </div>
                                </div>

                                {(!transaction.Proofs || transaction.Proofs.length === 0) ? (
                                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Initial Submission</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transaction.Proofs.map((proof, idx) => (
                                            <div key={idx} className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-14 w-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                        <FileText className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-base font-bold text-gray-900 tracking-tight">{formatNPR(parseFloat(proof.amount))}</p>
                                                            {proof.is_verified && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500">
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">ID: {proof.ProofID?.slice(0, 8)}</span>
                                                            <span>•</span>
                                                            <span className="italic">{proof.notes || 'No merchant notes provided'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <a 
                                                        href={proof.proof_file} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-100"
                                                    >
                                                        View Data Proof
                                                    </a>
                                                    {!proof.is_verified ? (
                                                        <Button 
                                                            className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10"
                                                            onClick={() => handleVerifyProof(proof.ProofID)}
                                                            disabled={isActionLoading}
                                                        >
                                                            {isActionLoading ? 'Audit...' : 'Verify Funds'}
                                                        </Button>
                                                    ) : (
                                                        <span className="bg-indigo-50 text-indigo-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                            Ledger Updated
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-[#020617] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-gray-900/40">
                                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-white/5 rounded-full blur-3xl" />
                                <div className="relative z-10 space-y-6">
                                    <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                        <HistoryIcon className="h-7 w-7 text-primary-light" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Audit Action</h3>
                                        <p className="text-xs text-white/50 leading-relaxed font-medium">Verify all submitted proofs to reconcile this property acquisition.</p>
                                    </div>
                                    <Button 
                                        className="w-full h-14 bg-white text-[#020617] hover:bg-gray-100 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-white/5"
                                        disabled={remaining > 0 || isActionLoading}
                                        onClick={handleFinalConfirm}
                                    >
                                        Finalize Transaction
                                    </Button>
                                    <p className="text-[10px] text-center text-white/30 font-black uppercase tracking-widest pt-2">
                                        {remaining > 0 ? `Waiting for NPR ${remaining.toLocaleString()} more` : 'Balance Reconciled'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Participant Details</h4>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 uppercase font-black text-xs">
                                            {transaction.Buyer?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">Asset Buyer</p>
                                            <p className="text-sm font-bold text-gray-900">{transaction.Buyer?.first_name} {transaction.Buyer?.last_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 uppercase font-black text-xs">
                                            {transaction.Seller?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">Asset Seller</p>
                                            <p className="text-sm font-bold text-gray-900">{transaction.Seller?.first_name} {transaction.Seller?.last_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                                <div className="space-y-2">
                                    <h4 className="font-bold text-amber-900 text-sm">Auditor Responsibility</h4>
                                    <p className="text-[10px] text-amber-700/80 leading-relaxed font-medium italic">
                                        Ensure reference ID matches the bank statement exactly before reconciling funds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}

