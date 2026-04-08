'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Clock, ShieldCheck, Wallet, Loader2 } from 'lucide-react';
import { getTransactionById } from '@/lib/api/transactions';
import { formatNPR } from '@/lib/utils/currency';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const transactionId = searchParams.get('transaction_id') ?? '';
    const pidx          = searchParams.get('pidx') ?? '';
    const amountParam   = searchParams.get('amount') ?? '0';

    const [property, setProperty] = useState<string>('Property Purchase');
    const [totalAmount, setTotalAmount] = useState<number>(parseFloat(amountParam));
    const [timestamp] = useState(() => new Date().toLocaleString('en-NP', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }));

    useEffect(() => {
        if (!transactionId) return;
        getTransactionById(transactionId)
            .then(tx => {
                setProperty(tx.Property?.title ?? 'Property Purchase');
                setTotalAmount(parseFloat(tx.total_amount));
            })
            .catch(() => {/* non-critical, use params */});
    }, [transactionId]);

    const shortRef = pidx ? pidx.slice(0, 12).toUpperCase() : transactionId.split('-')[0].toUpperCase();

    return (
        <div className="w-full max-w-2xl space-y-6">
            {/* Hero card */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-100 border border-emerald-100/60 overflow-hidden"
            >
                {/* Green top band */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-10 text-white relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 h-48 w-48 bg-white/10 rounded-full blur-3xl" />
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/30 shadow-xl"
                    >
                        <CheckCircle2 className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                            Payment Verified
                        </p>
                        <h1 className="text-3xl font-black tracking-tight">Payment Successful!</h1>
                        <p className="text-emerald-100 font-medium mt-2 text-sm">
                            Your Khalti payment has been verified and recorded on the platform.
                        </p>
                    </motion.div>
                </div>

                {/* Details */}
                <div className="p-10 space-y-6">
                    {/* Amount highlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Amount Paid</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatNPR(totalAmount)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">via Khalti</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600">Escrow Secured</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Receipt grid */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {[
                            { label: 'Property',        value: property },
                            { label: 'Khalti Reference', value: shortRef, mono: true },
                            { label: 'Transaction ID',  value: transactionId ? transactionId.slice(0, 16).toUpperCase() + '…' : 'N/A', mono: true },
                            { label: 'Date & Time',     value: timestamp },
                            { label: 'Status',          value: 'Completed', badge: true },
                        ].map(row => (
                            <div
                                key={row.label}
                                className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0"
                            >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                {row.badge ? (
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full">
                                        {row.value}
                                    </span>
                                ) : (
                                    <span className={`text-sm font-bold text-slate-900 ${row.mono ? 'font-mono text-xs' : ''}`}>
                                        {row.value}
                                    </span>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <Link
                    href={transactionId ? `/dashboard/buyer/transactions/${transactionId}` : '/dashboard/buyer/transactions'}
                    className="flex-1 flex items-center justify-center gap-3 h-14 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 group"
                >
                    View Transaction <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                    href="/dashboard/buyer"
                    className="flex-1 flex items-center justify-center gap-3 h-14 bg-white text-slate-700 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                >
                    Back to Dashboard
                </Link>
            </motion.div>

            {/* Info note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
                <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    The seller has been notified. Your payment proof is now pending manual verification by the seller or admin. 
                    You&apos;ll receive a notification once it&apos;s confirmed. For records, save your Khalti reference: <span className="font-black text-slate-700 font-mono">{shortRef}</span>
                </p>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-6">
            <Suspense fallback={
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500 mb-4" />
                    <p className="text-sm text-slate-500 font-medium font-outfit">Loading receipt...</p>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
