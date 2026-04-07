'use client';

/**
 * REAL KHALTI PAYMENT COMPONENT
 * Implements the official Khalti Web Checkout flow.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Wallet, CheckCircle2, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '@/lib/api/transactions';

interface KhaltiPaymentProps {
    transactionId: string;
    amount: number; // in NPR
    propertyTitle: string;
    onSuccess: (data: any) => void;
}

export const KhaltiPaymentDemo = ({ transactionId, amount, propertyTitle, onSuccess }: KhaltiPaymentProps) => {
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
    const [isInitiating, setIsInitiating] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const pidx = searchParams.get('pidx');
        if (pidx && step === 'selection') {
            verifyPayment(pidx);
        }
    }, [searchParams]);

    const handlePay = async () => {
        try {
            setIsInitiating(true);
            const returnUrl = window.location.origin + window.location.pathname;
            const websiteUrl = window.location.origin;
            
            const response = await initiateKhaltiPayment(transactionId, returnUrl);
            
            if (response.payment_url) {
                toast.success('Redirecting to Khalti...');
                window.location.href = response.payment_url;
            } else {
                toast.error('Initiation failed: No payment URL');
            }
        } catch (error: any) {
            console.error('Khalti Initiate Error:', error);
            const backendError = error.response?.data?.error;
            toast.error(backendError || 'Failed to initiate secure payment');
        } finally {
            setIsInitiating(false);
        }
    };

    const verifyPayment = async (pidx: string) => {
        setStep('processing');
        try {
            const response = await verifyKhaltiPayment(transactionId, pidx);
            setStep('success');
            onSuccess(response.data);
            toast.success('Payment Verified Successfully');
        } catch (error: any) {
            console.error('Verification Error:', error);
            const detail = error.response?.data?.details || 'Verification node timeout';
            toast.error(`Verification Failed: ${detail}`);
            setStep('selection');
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-md w-full mx-auto animate-in">
            <div className="bg-[#5C2D91] p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div className="h-10 w-24 bg-white rounded-lg flex items-center justify-center p-2">
                        <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" className="h-6 object-contain" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-black/20 px-3 py-1.5 rounded-full">Secure Gateway</div>
                </div>
                <div className="relative z-10">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Escrow Payment for</p>
                    <h3 className="text-lg font-bold mb-4 line-clamp-1">{propertyTitle}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white/60 text-indigo-400">NPR</span>
                        <span className="text-4xl font-bold">{amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {step === 'selection' && (
                        <motion.div 
                            key="selection"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                                    NOTICE: You are initiating a secure transaction via Khalti. Funds will be recorded in the platform's verified registry.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Options</label>
                                <button 
                                    type="button"
                                    onClick={handlePay}
                                    className="w-full flex items-center justify-between p-5 bg-gray-50 border-2 border-primary/20 rounded-2xl group hover:border-primary transition-all shadow-sm relative z-10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#5C2D91]/10 text-[#5C2D91] rounded-lg flex items-center justify-center">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Pay with Khalti</p>
                                            <p className="text-[10px] text-gray-500 font-medium tracking-tight">Wallet, E-Banking, ConnectIPS</p>
                                        </div>
                                    </div>
                                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="h-2.5 w-2.5 bg-primary rounded-full" 
                                        />
                                    </div>
                                </button>
                            </div>

                            <Button 
                                type="button"
                                className="w-full h-14 bg-[#5C2D91] hover:bg-[#4C2376] text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-[#5C2D91]/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] relative z-20"
                                onClick={handlePay}
                                disabled={isInitiating}
                            >
                                {isInitiating ? 'Initializing Imperial Gateway...' : `Proceed to Pay NPR ${amount.toLocaleString()}`}
                            </Button>
                        </motion.div>
                    )}

                    {step === 'processing' && (
                        <motion.div 
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-10 text-center space-y-6"
                        >
                            <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-4 border-[#5C2D91]/10 border-t-[#5C2D91]"
                                />
                                <div className="h-12 w-12 bg-[#5C2D91]/5 rounded-2xl flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-[#5C2D91] animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Verifying Settlement</h3>
                                <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">Imperial Verification Protocol</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-10 text-center space-y-6"
                        >
                            <div className="mx-auto h-24 w-24 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/10 border border-indigo-100 rotate-12">
                                <CheckCircle2 className="h-12 w-12 -rotate-12" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Payment Confirmed</h3>
                                <p className="text-[10px] text-indigo-500 font-black mt-2 uppercase tracking-[0.2em] bg-indigo-50 inline-block px-4 py-2 rounded-full border border-indigo-100">Ledger Updated</p>
                            </div>
                            <p className="text-xs text-gray-500 font-medium px-4">
                                Your payment has been successfully verified with Khalti. The transaction records are now permanent and legally binding.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
