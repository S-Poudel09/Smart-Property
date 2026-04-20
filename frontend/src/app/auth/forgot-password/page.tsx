'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Loader2, Mail, Crown, Sparkles, Key, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Container from '@/components/layout/Container';
import { requestPasswordReset } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const formValues = watch();

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        try {
            await requestPasswordReset(data.email);
            setIsSubmitted(true);
            toast.success('Imperial Seal dispatched to your email.');
        } catch {
            toast.error('The dispatch failed. Verify your lineage email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Subtle background blur elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[460px] relative z-10"
            >
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform group-hover:scale-105">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 font-outfit italic">SmartProperty</span>
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-12 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div 
                                key="forgot-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="mb-10 text-center">
                                    <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit tracking-tight italic">Restore Access</h1>
                                    <p className="text-slate-500 font-medium text-sm italic">Request a security recovery seal</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Archive Email</label>
                                        <Input
                                            placeholder="Enter your registered email"
                                            {...register('email')}
                                            error={errors.email?.message}
                                            className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full rounded-[1.25rem] h-16 bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all font-black uppercase tracking-widest text-[11px] group active:scale-95"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-3">
                                                Dispatch Seal <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors group">
                                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Entry Gates
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                                    <Mail className="h-10 w-10" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 font-outfit italic">Verify Your Archive</h1>
                                <p className="text-slate-500 font-medium italic text-sm leading-relaxed">
                                    The security seal has been dispatched. Please follow the instructions in your email to restore access.
                                </p>
                                <Button 
                                    className="w-full h-16 rounded-[1.25rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 shadow-xl mt-4" 
                                    onClick={() => router.push('/auth/login')}
                                >
                                    Return to Access Gates
                                </Button>
                                <button onClick={() => setIsSubmitted(false)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors italic block w-full">
                                    Attempt another restoration
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
