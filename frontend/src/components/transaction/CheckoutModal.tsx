'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { KhaltiPaymentDemo } from '@/components/transaction/KhaltiPaymentDemo';
import { Transaction } from '@/lib/api/transactions';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyTitle: string;
    amount: number;
    onSuccess: (referenceId: string) => void;
}

export const CheckoutModal = ({ isOpen, onClose, propertyTitle, amount, onSuccess }: CheckoutModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgb(0,0,0,0.4)] overflow-hidden flex flex-col lg:flex-row"
                    >
                        {/* Summary Side */}
                        <div className="lg:w-2/5 bg-gray-50/50 p-10 border-r border-gray-100 flex flex-col justify-between">
                            <div>
                                <button
                                    onClick={onClose}
                                    className="mb-10 h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm group"
                                >
                                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                                </button>
                                
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">Checkout Protocol</h3>
                                <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter mb-8 leading-tight">Finalize Acquisition</h2>
                                
                                <div className="space-y-6">
                                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Property Asset</p>
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{propertyTitle}</p>
                                    </div>
                                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Valuation</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">NPR {amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                <ShieldCheck className="h-6 w-6 text-indigo-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Escrow Active</p>
                                    <p className="text-[10px] text-indigo-700/80 leading-relaxed font-medium"> Funds are secured within the system ledger until documentation is verified by authorities.</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Side */}
                        <div className="lg:w-3/5 p-10 lg:p-14 bg-white flex items-center justify-center relative">
                            <KhaltiPaymentDemo 
                                amount={amount} 
                                propertyTitle={propertyTitle} 
                                onSuccess={onSuccess} 
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
