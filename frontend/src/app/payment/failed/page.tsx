'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft, AlertCircle, HeadphonesIcon, Loader2 } from 'lucide-react';

function FailedContent() {
    const searchParams  = useSearchParams();
    const reason        = searchParams.get('reason') ?? 'An unexpected error occurred during payment.';
    const transactionId = searchParams.get('transaction_id') ?? '';

    const isCancelled = reason.toLowerCase().includes('cancel');

    return (
        <div className="w-full max-w-2xl space-y-6">

            {/* Hero card */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-100 border border-rose-100/60 overflow-hidden"
            >
                {/* Red/amber top band */}
                <div className={`p-10 text-white relative overflow-hidden ${isCancelled ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
                    <div className="absolute -top-12 -right-12 h-48 w-48 bg-white/10 rounded-full blur-3xl" />
                    <motion.div
                        initial={{ scale: 0, rotate: 20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/30 shadow-xl"
                    >
                        <XCircle className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isCancelled ? 'text-amber-100' : 'text-rose-100'}`}>
                            {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
                        </p>
                        <h1 className="text-3xl font-black tracking-tight">
                            {isCancelled ? 'Payment Cancelled' : 'Payment Unsuccessful'}
                        </h1>
                        <p className={`font-medium mt-2 text-sm ${isCancelled ? 'text-amber-100' : 'text-rose-100'}`}>
                            {isCancelled
                                ? 'You cancelled the payment. No funds were deducted from your account.'
                                : 'Something went wrong with your Khalti payment. Please try again.'}
                        </p>
                    </motion.div>
                </div>

                {/* Detail body */}
                <div className="p-10 space-y-6">

                    {/* Reason box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                        className={`border rounded-2xl p-6 flex items-start gap-4 ${isCancelled ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}
                    >
                        <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${isCancelled ? 'text-amber-500' : 'text-rose-500'}`} />
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCancelled ? 'text-amber-700' : 'text-rose-700'}`}>
                                Reason
                            </p>
                            <p className={`text-sm font-medium leading-relaxed ${isCancelled ? 'text-amber-900' : 'text-rose-900'}`}>
                                {reason}
                            </p>
                        </div>
                    </motion.div>

                    {/* What to do next */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="space-y-3"
                    >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What you can do</p>
                        {[
                            { step: '01', text: 'Check your Khalti wallet balance and try again.' },
                            { step: '02', text: 'Ensure your internet connection is stable during payment.' },
                            { step: '03', text: 'If amount was deducted, contact Khalti support with your payment reference.' },
                            { step: '04', text: 'You can also pay manually by uploading a bank transfer receipt.' },
                        ].map(item => (
                            <div key={item.step} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-300 font-mono mt-0.5">{item.step}</span>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Ref */}
                    {transactionId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 }}
                            className="flex items-center justify-between py-4 border-t border-slate-100"
                        >
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</span>
                            <span className="text-xs font-mono font-bold text-slate-600">
                                #{transactionId.split('-')[0].toUpperCase()}
                            </span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                {transactionId ? (
                    <Link
                        href={`/dashboard/buyer/transactions/${transactionId}`}
                        className="flex-1 flex items-center justify-center gap-3 h-14 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-700 transition-all shadow-xl shadow-slate-900/20 group"
                    >
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                        Try Again
                    </Link>
                ) : (
                    <Link
                        href="/dashboard/buyer/transactions"
                        className="flex-1 flex items-center justify-center gap-3 h-14 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-700 transition-all shadow-xl shadow-slate-900/20 group"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Link>
                )}
                <Link
                    href="/dashboard/buyer"
                    className="flex-1 flex items-center justify-center gap-3 h-14 bg-white text-slate-700 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </motion.div>

            {/* Support note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
                <HeadphonesIcon className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    If your money was deducted but the transaction still shows as failed, please contact{' '}
                    <a href="https://khalti.com/support" target="_blank" rel="noopener noreferrer"
                       className="text-[#5C2D91] font-bold hover:underline">
                        Khalti Support
                    </a>{' '}
                    with your transaction reference number. Our platform team is available at{' '}
                    <span className="font-bold text-slate-700">support@smartproperty.com</span>
                </p>
            </motion.div>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50 flex items-center justify-center p-6">
            <Suspense fallback={
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-rose-500 mb-4" />
                    <p className="text-sm text-slate-500 font-medium font-outfit">Loading secure portal...</p>
                </div>
            }>
                <FailedContent />
            </Suspense>
        </div>
    );
}
