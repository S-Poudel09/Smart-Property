'use client';

/**
 * KHALTI PAYMENT COMPONENT — KPG v2
 *
 * Flow:
 *  1. User clicks "Proceed to Pay"
 *  2. We call backend /transactions/{id}/khalti-initiate/ → receive payment_url + pidx
 *  3. User is redirected to Khalti's hosted payment page (test-pay.khalti.com)
 *  4. Khalti redirects to /payment/callback?pidx=...&status=...&transaction_id={id}
 *  5. The callback page verifies with our backend and routes to /payment/success or /payment/failed
 *
 * This component ONLY handles step 2-3. Verification is handled by /payment/callback.
 */

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Wallet, Info, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { initiateKhaltiPayment, initiateDummyPayment } from '@/lib/api/transactions';

interface KhaltiPaymentProps {
    transactionId: string;
    amount: number;       // remaining NPR amount
    propertyTitle: string;
    onSuccess: (data: any) => void;
}

export const KhaltiPaymentDemo = ({
    transactionId,
    amount,
    propertyTitle,
    onSuccess,
}: KhaltiPaymentProps) => {
    const [isInitiating, setIsInitiating] = useState(false);

    const handlePay = async () => {
        console.log("KhaltiInitiate: Preparing redirect for transaction:", transactionId);
        if (amount <= 0) {
            toast.error('Invalid payment amount. Please refresh and try again.');
            return;
        }

        try {
            setIsInitiating(true);
            // Sanitize transactionId in case it has query params already
            const cleanId = transactionId.split('?')[0];

            // Khalti will redirect back to our dedicated callback page.
            // We embed transaction_id in the URL so the callback knows which record to verify.
            const returnUrl  = `${window.location.origin}/payment/callback?transaction_id=${cleanId}`;
            const websiteUrl = window.location.origin;

            console.log("KhaltiInitiate: Requesting payment URL...");
            const response = await initiateKhaltiPayment(cleanId, returnUrl, websiteUrl);

            if (response.payment_url) {
                console.log("KhaltiInitiate: Success. Redirecting to:", response.payment_url);
                toast.success('Redirecting to Khalti secure gateway…');
                setTimeout(() => {
                    window.location.href = response.payment_url;
                }, 500);
            } else {
                console.error("KhaltiInitiate: Missing payment_url in response", response);
                toast.error('No payment URL returned. Please try again.');
            }
        } catch (error: any) {
            console.error('Khalti Initiate Error:', error);
            const backendMsg    = error.response?.data?.error;
            const khaltiDetails = error.response?.data?.details;
            const detailStr =
                typeof khaltiDetails === 'object'
                    ? JSON.stringify(khaltiDetails)
                    : khaltiDetails;
            const displayMsg = detailStr
                ? `${backendMsg}: ${detailStr}`
                : backendMsg || 'Failed to initiate payment. Please try again.';
            toast.error(displayMsg, { duration: 7000 });
        } finally {
            setIsInitiating(false);
        }
    };

    const handleDummyPay = async () => {
        console.log("SimulationInitiate: Starting dummy flow for transaction:", transactionId);
        try {
            setIsInitiating(true);
            toast.loading("Simulating Protocol Initiation...", { id: "simulation" });

            const cleanId = transactionId.split('?')[0];
            const returnUrl = `${window.location.origin}/payment/callback?transaction_id=${cleanId}&dummy=true`;
            
            // Mock call delay
            await new Promise(r => setTimeout(r, 800));
            const response  = await initiateDummyPayment(cleanId, returnUrl);

            if (response.payment_url) {
                console.log("SimulationInitiate: Redirecting to mock callback:", returnUrl);
                toast.success("Simulation Started: Redirecting...", { id: "simulation" });
                setTimeout(() => {
                    window.location.href = returnUrl;
                }, 800);
            }
        } catch (error) {
            console.error("Simulation Error:", error);
            toast.error("Simulation failed. Check console.", { id: "simulation" });
        } finally {
            setIsInitiating(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-md w-full mx-auto">

            {/* ── Purple Khalti header ── */}
            <div className="bg-[#5C2D91] p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 flex justify-between items-center mb-6">
                    {/* Khalti logo */}
                    <div className="h-10 w-24 bg-white rounded-lg flex items-center justify-center p-2">
                        <img
                            src="https://khalti.com/static/img/logo1.png"
                            alt="Khalti"
                            className="h-6 object-contain"
                        />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-black/20 px-3 py-1.5 rounded-full">
                        Secure Gateway
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                        Escrow Payment for
                    </p>
                    <h3 className="text-base font-bold mb-4 line-clamp-1">{propertyTitle}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white/60">NPR</span>
                        <span className="text-4xl font-black tabular-nums">
                            {amount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="p-8 space-y-4">

                {/* Notice */}
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-purple-700 font-medium leading-relaxed">
                        You will be redirected to Khalti&apos;s secure payment page. After completion,
                        you&apos;ll be brought back here automatically.
                    </p>
                </div>

                {/* Real Payment Trigger */}
                <button
                    type="button"
                    onClick={handlePay}
                    disabled={isInitiating}
                    className="w-full h-14 bg-[#5C2D91] hover:bg-[#4C2376] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl shadow-xl shadow-[#5C2D91]/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                    {isInitiating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Connecting to gateway…
                        </>
                    ) : (
                        <>
                            Proceed to Pay · NPR {amount.toLocaleString()}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>

                {/* Simulation Mode Integration */}
                <div className="pt-2 border-t border-gray-50">
                    <button
                        type="button"
                        onClick={handleDummyPay}
                        disabled={isInitiating}
                        className="w-full h-12 bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 font-bold uppercase tracking-[0.1em] text-[10px] rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        {isInitiating ? "Running Simulation..." : "Simulate Payment Flow (Dummy Mode)"}
                    </button>
                    <p className="text-center text-[9px] text-gray-400 font-medium mt-3">
                        Use dummy mode for demonstration without live transactions.
                    </p>
                </div>
            </div>
        </div>
    );
};
