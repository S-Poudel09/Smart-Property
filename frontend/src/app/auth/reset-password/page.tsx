'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Container from '@/components/layout/Container';
import { confirmPasswordReset } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // We expect ?uid=xx&token=yy in the URL
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const formValues = watch();

    useEffect(() => {
        if (!uid || !token) {
            toast.error("Invalid reset link.");
        }
    }, [uid, token]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!uid || !token) {
            toast.error("Invalid password reset token. Please request a new link.");
            return;
        }

        setIsLoading(true);
        try {
            await confirmPasswordReset(uid, token, data.password);
            setIsSuccess(true);
            toast.success('Password successfully reset.');
        } catch {
            toast.error('Failed to reset password. The link might be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 relative">
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[460px] bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 p-12 text-center"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-8 border border-indigo-100">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 font-outfit italic">Reset Complete</h1>
                    <p className="text-slate-500 font-medium italic text-sm mb-10">Your security keys have been successfully updated. You may now return to the entry gates.</p>
                    <Button className="w-full h-16 rounded-[1.25rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 shadow-xl" onClick={() => router.push('/auth/login')}>
                        Return to Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform group-hover:scale-105">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 font-outfit italic">SmartProperty</span>
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-12">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit tracking-tight italic">Set New Key</h1>
                        <p className="text-slate-500 font-medium text-sm italic">Define a new secure access sequence</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Security Sequence</label>
                            <Input
                                placeholder="••••••••"
                                type="password"
                                {...register('password')}
                                error={errors.password?.message}
                                className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all pr-10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Sequence</label>
                            <Input
                                placeholder="••••••••"
                                type="password"
                                {...register('confirmPassword')}
                                error={errors.confirmPassword?.message}
                                className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all pr-10"
                            />
                        </div>

                        <Button type="submit" className="w-full h-16 rounded-[1.25rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 shadow-xl mt-4" disabled={isLoading || !uid || !token}>
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Authorize New Key'
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
