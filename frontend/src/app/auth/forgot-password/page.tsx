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
        <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-full max-w-4xl bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-accent/10 shadow-3xl overflow-hidden flex flex-col lg:flex-row relative z-10"
            >
                {/* Left Panel - Branding */}
                <div className="lg:w-[45%] premium-gradient p-16 text-white relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-4 group/logo">
                            <div className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center text-primary shadow-gold-glow group-hover/logo:scale-110 transition-transform duration-500">
                                <Crown className="h-8 w-8" />
                            </div>
                            <span className="text-2xl font-serif tracking-tight">SmartProperty</span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                            <Key className="h-3.5 w-3.5" /> Credentials Recovery
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-serif leading-[0.9]">Restore <br /> <span className="italic text-accent">Access.</span></h2>
                        <p className="text-gray-400 text-lg lg:text-xl font-medium italic border-l-4 border-accent/30 pl-8 leading-relaxed max-w-sm">
                            "Reclaim your keys to the imperial sanctuary and continue your legacy in the realm."
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                         <p className="text-[10px] font-black uppercase tracking-widest text-accent/40 italic">System Identity Management</p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 p-12 sm:p-20 relative bg-[#fffdf9]/80 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div 
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto w-full"
                            >
                                <div className="mb-12 text-center lg:text-left">
                                    <div className="h-1px w-12 bg-accent mb-6 hidden lg:block" />
                                    <h3 className="text-4xl font-serif text-primary mb-4">Reset Security Key</h3>
                                    <p className="text-gray-400 font-medium italic">Enter your archive email to receive the Imperial Seal.</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <Input
                                        label="Email Archive"
                                        placeholder="your-lineage@domain.com"
                                        type="email"
                                        {...register('email')}
                                        value={formValues.email}
                                        error={errors.email?.message}
                                        className="h-16 rounded-2xl bg-white border-accent/10 focus:border-accent shadow-inner"
                                    />

                                    <Button 
                                        type="submit" 
                                        className="w-full h-18 rounded-full bg-primary text-white hover:bg-accent transition-all duration-500 shadow-xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 group" 
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Dispatching Seal...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Reset Seal</span>
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-16 text-center">
                                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors group">
                                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Entry Gates
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8 max-w-sm mx-auto"
                            >
                                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-accent text-primary shadow-gold-glow mb-10">
                                    <Mail className="h-12 w-12" />
                                </div>
                                <h2 className="text-3xl font-serif text-primary">Verify Your Archive</h2>
                                <p className="text-gray-400 font-medium italic leading-relaxed">
                                    "The Imperial Seal has been dispatched to your email. Please follow the instructions to restore your access."
                                </p>
                                <Button 
                                    className="w-full h-16 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-accent shadow-xl mt-8" 
                                    onClick={() => router.push('/auth/login')}
                                >
                                    Return to Gates
                                </Button>
                                <button onClick={() => setIsSubmitted(false)} className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors italic">
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
