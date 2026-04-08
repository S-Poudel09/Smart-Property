'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyKhaltiPayment, verifyDummyPayment } from '@/lib/api/transactions';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, XCircle } from 'lucide-react';

type Phase = 'verifying' | 'redirecting' | 'error';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('verifying');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const run = async () => {
            const pidx          = searchParams.get('pidx');
            const status        = searchParams.get('status');        // Completed | Canceled | Failed | Pending
            const transactionId = searchParams.get('transaction_id'); // our DB UUID
            const amount        = searchParams.get('amount') ?? '0'; // paisa from Khalti
            const isDummy       = searchParams.get('dummy') === 'true';

            // --- 1. Build canonical failure URL helper ---
            const failUrl = (reason: string) =>
                `/payment/failed?reason=${encodeURIComponent(reason)}&transaction_id=${transactionId ?? ''}`;

            // --- 2. Bail early for cancelled / failed without hitting backend ---
            if (!pidx || !transactionId) {
                router.replace(failUrl('Missing payment reference. Please try again.'));
                return;
            }

            // Cleanup: ensure transactionId doesn't contain query artifacts (UUID?status=...)
            const cleanId = transactionId.split('?')[0];

            if (status === 'Canceled') {
                router.replace(failUrl('Payment was cancelled. No funds were deducted.'));
                return;
            }

            if (status === 'Failed') {
                router.replace(failUrl('Payment failed on Khalti side. Please try again.'));
                return;
            }

            // --- 3. Verify with our backend (or dummy logic) ---
            try {
                if (isDummy) {
                    await verifyDummyPayment(cleanId, pidx!);
                } else {
                    await verifyKhaltiPayment(cleanId, pidx!);
                }

                setPhase('redirecting');
                // For dummy, we use a fixed 15000 NPR if amount isn't provided
                const amountNPR = isDummy ? '15000.00' : (parseInt(amount) / 100).toFixed(2);
                router.replace(
                    `/payment/success?transaction_id=${cleanId}&pidx=${pidx}&amount=${amountNPR}`
                );
            } catch (err: any) {
                console.error('Payment verify error:', err);
                const detail =
                    err.response?.data?.details ||
                    err.response?.data?.error ||
                    'Verification failed. Contact support with your payment reference.';
                setErrorMsg(detail);
                setPhase('error');

                // Auto-redirect to failed page after a short delay so user can read the error
                setTimeout(() => {
                    router.replace(failUrl(typeof detail === 'string' ? detail : JSON.stringify(detail)));
                }, 3000);
            }
        };

        run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12 text-center"
        >
            {phase === 'verifying' && (
                <>
                    <div className="relative mx-auto h-24 w-24 flex items-center justify-center mb-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-full border-4 border-[#5C2D91]/10 border-t-[#5C2D91]"
                        />
                        <div className="h-14 w-14 bg-[#5C2D91]/5 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="h-7 w-7 text-[#5C2D91]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-3">Verifying Payment</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Confirming your payment with Khalti. Please don&apos;t close this window.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Secure Verification in Progress
                    </div>
                </>
            )}

            {phase === 'redirecting' && (
                <>
                    <div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                        <ShieldCheck className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-3">Payment Confirmed</h1>
                    <p className="text-sm text-slate-500 font-medium">Redirecting to your receipt…</p>
                </>
            )}

            {phase === 'error' && (
                <>
                    <div className="h-20 w-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-100">
                        <XCircle className="h-10 w-10 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-3">Verification Issue</h1>
                    <p className="text-sm text-slate-500 font-medium mb-4">{errorMsg}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Redirecting in 3 seconds…
                    </p>
                </>
            )}
        </motion.div>
    );
}

export default function KhaltiCallbackPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Suspense fallback={
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#5C2D91] mb-4" />
                    <p className="text-sm text-slate-500 font-medium font-outfit">Loading secure protocol...</p>
                </div>
            }>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
