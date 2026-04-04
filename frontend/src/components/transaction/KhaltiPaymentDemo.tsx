'use client';

/**
 * MOCK PAYMENT DEMO COMPONENT
 * This is used for demonstration and internal testing purposes only.
 * DO NOT integrate real payment keys or call real Khalti APIs here.
 * The transaction reference ID generated here is fake.
 */

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { CreditCard, Wallet, CheckCircle2, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface KhaltiPaymentDemoProps {
    amount: number;
    propertyTitle: string;
    onSuccess: (referenceId: string) => void;
}

export const KhaltiPaymentDemo = ({ amount, propertyTitle, onSuccess }: KhaltiPaymentDemoProps) => {
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
    // Generating a random mock reference ID starting with DEMO-
    const [referenceId] = useState(() => `DEMO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);

    const handlePay = () => {
        setStep('processing');
        // Simulating network delay for realistic demo
        setTimeout(() => {
            setStep('success');
            onSuccess(referenceId);
            toast.success('Mock Payment Recorded - Demo Success');
        }, 2000);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-md w-full mx-auto animate-in">
            <div className="bg-[#5C2D91] p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div className="h-10 w-24 bg-white rounded-lg flex items-center justify-center p-2">
                        <img src="https://khalti.com/static/img/logo1.png" alt="Khalti Demo" className="h-6 object-contain" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-black/20 px-3 py-1.5 rounded-full">Demo Environment</div>
                </div>
                <div className="relative z-10">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Escrow Ledger Account</p>
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
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                                <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                    NOTICE: This is a sandbox/demo payment gateway. No real funds will be moved. 
                                    Internal verification only.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Options</label>
                                <button className="w-full flex items-center justify-between p-5 bg-gray-50 border-2 border-primary/20 rounded-2xl group hover:border-primary transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#5C2D91]/10 text-[#5C2D91] rounded-lg flex items-center justify-center">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Khalti Mock Wallet</p>
                                            <p className="text-[10px] text-gray-500 font-medium tracking-tight">One-Click Demo Approval</p>
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
                                <button className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl opacity-40 grayscale cursor-not-allowed">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900">E-Banking (Demo)</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Coming in Production</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <Button 
                                className="w-full h-14 bg-[#5C2D91] hover:bg-[#4C2376] text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-[#5C2D91]/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                onClick={handlePay}
                            >
                                Submit Mock Payment Rs. {amount.toLocaleString()}
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
                                <h3 className="text-lg font-bold text-gray-900">Verifying Ledger Status</h3>
                                <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">Demo Sequence Enacted</p>
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
                                <h3 className="text-xl font-bold text-gray-900">Mock Success</h3>
                                <p className="text-[10px] text-indigo-500 font-black mt-2 uppercase tracking-[0.2em] bg-indigo-50 inline-block px-4 py-2 rounded-full border border-indigo-100">Reference Recorded</p>
                            </div>
                            <div className="bg-gray-50 p-7 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 text-left">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">Mock Ref ID</span>
                                    <span className="text-gray-900 font-mono tracking-wider bg-white px-2 py-1 rounded border border-gray-100">{referenceId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">Captured Time</span>
                                    <span className="text-gray-900">{new Date().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold pt-2 border-t border-dashed border-gray-200">
                                    <span className="text-gray-400 uppercase tracking-widest">Network Status</span>
                                    <span className="text-indigo-500 uppercase tracking-widest">Demo Confirmed</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

