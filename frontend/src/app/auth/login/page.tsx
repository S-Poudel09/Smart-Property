'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Loader2, Crown, ShieldCheck, Sparkles, ArrowRight, Home, Key } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { loginUser, verifyAdminLoginOTP, resendAdminLoginOTP } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(1, 'Security key is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [otp, setOtp] = useState('');
    const [otpEmail, setOtpEmail] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const formValues = watch();

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await loginUser(data.email, data.password);
            
            if (response.requires_otp) {
                setOtpEmail(response.email);
                setStep('otp');
                toast.success(response.message || 'MFA Required: Check your email for verification code.');
                return;
            }

            const role = response.user?.role?.toLowerCase();
            const { saveAuthToStorage } = await import('@/lib/auth/storage');
            saveAuthToStorage({
                accessToken: response.access,
                user: response.user,
                userRole: role
            });
            
            toast.success('Signed in successfully!');
            if (role === 'buyer') router.push('/dashboard/buyer');
            else if (role === 'seller') router.push('/dashboard/seller');
            else if (role === 'admin') router.push('/dashboard/admin');
            else router.push('/');
        } catch (error) {
            let message = 'Invalid credentials. Please try again.';
            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    const data = error.response.data;
                    const firstError = data.message || data.detail || Object.values(data)[0];
                    message = Array.isArray(firstError) ? firstError[0] : (firstError || 'Authentication failed.');
                }
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await verifyAdminLoginOTP(otpEmail, otp);
            const role = response.user?.role?.toLowerCase();
            const { saveAuthToStorage } = await import('@/lib/auth/storage');
            
            saveAuthToStorage({
                accessToken: response.access,
                user: response.user,
                userRole: role
            });

            toast.success("Identity verified successfully.");
            router.push('/dashboard/admin');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Verification failed. Invalid code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await resendAdminLoginOTP(otpEmail);
            toast.success("A new verification code has been sent.");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send code. Try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white relative overflow-hidden font-inter">
            {/* Left Side: Immersive Visual (Hidden on mobile) */}
            <div className="hidden lg:block lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img 
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200" 
                        alt="Premium Real Estate" 
                        className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
                    />
                </motion.div>
                
                {/* Subtle Floating Orbs */}
                <motion.div 
                    animate={{ 
                        y: [0, -20, 0],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none z-10" 
                />
                <motion.div 
                    animate={{ 
                        y: [0, 20, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-[120px] pointer-events-none z-10" 
                />

                <div className="absolute inset-0 z-10 bg-gradient-to-br from-indigo-950/40 via-transparent to-slate-950/60" />
                
                <div className="absolute bottom-20 left-20 z-20 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 48 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-1 bg-indigo-500 rounded-full mb-8"
                    />
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-5xl font-black text-white leading-[1.1] font-outfit uppercase tracking-tighter italic"
                    >
                        Secure Your <br />
                        <span className="text-indigo-400">Future Registry.</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-white/70 text-lg mt-6 font-medium italic leading-relaxed"
                    >
                        Access Nepal's most secure and verified digital property network. Direct transactions, zero blindspots.
                    </motion.p>
                </div>
            </div>

            {/* Right Side: Authentication Layer */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-16 bg-white overflow-y-auto">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full max-w-[440px] relative z-10"
                >
                    {/* Header/Logo for mobile */}
                    <div className="mb-12">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="h-11 w-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform group-hover:rotate-3">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-900 font-outfit italic">SmartProperty</span>
                        </Link>
                    </div>

                    {/* Authentication Card */}
                    <div className="bg-white rounded-[2.5rem] p-4 transition-all duration-500">
                        <AnimatePresence mode="wait">
                            {step === 'login' ? (
                                <motion.div 
                                    key="login-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="mb-10 pl-1">
                                        <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit tracking-tight italic leading-tight">Welcome Back</h1>
                                        <p className="text-slate-400 font-medium text-sm italic">Authorize your session to proceed</p>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                                        <Input
                                            label="Identity Protocol"
                                            placeholder="authorized@email.com"
                                            {...register('email')}
                                            error={errors.email?.message}
                                        />

                                        <div className="space-y-1">
                                            <Input
                                                label="Security Key"
                                                type="password"
                                                placeholder="••••••••"
                                                {...register('password')}
                                                error={errors.password?.message}
                                            />
                                            <div className="flex justify-end pr-1">
                                                <Link href="/auth/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                                                    Lost Access Credentials?
                                                </Link>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="w-full rounded-2xl h-14 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-indigo-100 transition-all font-black uppercase tracking-widest text-[10px] group active:scale-95 mt-2"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                            ) : (
                                                <span className="flex items-center justify-center gap-3">
                                                    Initialize Access Protocol <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                            New registry enrollment required?
                                            <Link href="/auth/register" className="text-indigo-600 font-black ml-2 hover:underline underline-offset-8">
                                                Enroll Now
                                            </Link>
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                     key="otp-form"
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     exit={{ opacity: 0, y: -10 }}
                                     className="w-full text-center"
                                >
                                    <div className="h-20 w-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-sm border border-indigo-100">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-3 font-outfit tracking-tighter italic">Key Verification</h2>
                                    <p className="text-slate-500 text-sm mb-10 font-medium italic">
                                        A secure transmission was sent to <span className="text-indigo-600 font-bold block mt-1">{otpEmail}</span>
                                    </p>

                                    <form onSubmit={onVerifyOtp} className="space-y-10">
                                        <div className="relative">
                                            <Input
                                                label="Verification Sequence"
                                                placeholder="000000"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                className="h-24 text-center text-5xl border-slate-200 bg-slate-50/50 font-outfit font-black tracking-[0.8rem] focus:bg-white text-slate-900 rounded-[1.5rem] shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full h-16 rounded-[1.25rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Identity'}
                                            </Button>
                                            
                                            <div className="flex flex-col gap-6 pt-6 border-t border-slate-50">
                                                <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-all italic">
                                                    Re-transmit Link
                                                </button>
                                                <button type="button" onClick={() => setStep('login')} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                                                    ← Abort Protocol
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

