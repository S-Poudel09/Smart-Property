'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { CreditCard, Wallet, CheckCircle2, Loader2, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { formatNPR } from '@/lib/utils/currency';

interface KhaltiPaymentDemoProps {
    amount: number;
    propertyTitle: string;
    onSuccess: (referenceId: string) => void;
}

export const KhaltiPaymentDemo = ({ amount, propertyTitle, onSuccess }: KhaltiPaymentDemoProps) => {
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
    const [referenceId] = useState(() => `KLT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            onSuccess(referenceId);
            toast.success('Payment Recorded via Khalti Demo');
        }, 2000);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-md w-full mx-auto">
            <div className="bg-[#5C2D91] p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div className="h-10 w-24 bg-white rounded-lg flex items-center justify-center p-2">
                        <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" className="h-6 object-contain" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-black/20 px-3 py-1.5 rounded-full">Secure Gateway</div>
                </div>
                <div className="relative z-10">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Paying For</p>
                    <h3 className="text-lg font-bold mb-4 line-clamp-1">{propertyTitle}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white/60">Rs</span>
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
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Options</label>
                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 border border-primary/20 rounded-xl group hover:border-primary transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#5C2D91]/10 text-[#5C2D91] rounded-lg flex items-center justify-center">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Khalti Wallet</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Instant Verification</p>
                                        </div>
                                    </div>
                                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                                        <div className="h-2.5 w-2.5 bg-primary rounded-full" />
                                    </div>
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900">E-Banking</p>
                                            <p className="text-[10px] text-gray-500 font-medium">All Nepal Banks</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <Button 
                                className="w-full h-14 bg-[#5C2D91] hover:bg-[#4C2376] text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-[#5C2D91]/20 flex items-center justify-center gap-3"
                                onClick={handlePay}
                            >
                                Pay Rs. {amount.toLocaleString()}
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
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-4 border-[#5C2D91]/20 border-t-[#5C2D91]"
                                />
                                <Loader2 className="h-8 w-8 text-[#5C2D91] animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Processing Payment</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Do not refresh this page</p>
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
                            <div className="mx-auto h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
                                <p className="text-xs text-gray-500 font-black mt-2 uppercase tracking-[0.2em]">Transaction Verified</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">Reference ID</span>
                                    <span className="text-gray-900 font-mono tracking-wider">{referenceId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">Date & Time</span>
                                    <span className="text-gray-900">{new Date().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Captured</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
