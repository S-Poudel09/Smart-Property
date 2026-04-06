'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Loader2, KeyRound, Crown, Sparkles, User, BadgeCheck, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Container from '@/components/layout/Container';
import { registerUser, verifyOTP, resendOTP } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const registerSchema = z.object({
    name: z.string().min(1, 'Entity name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Communication channel is required').email('Invalid email address'),
    password: z.string().min(1, 'Security key is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please re-enter your key'),
    role: z.enum(['buyer', 'seller'] as const),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [otp, setOtp] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'buyer' },
    });

    const formValues = watch();

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            await registerUser(data.name, data.email, data.password, data.role);
            toast.success('Account created! Please check your email for a verification code.');
            setRegisteredEmail(data.email);
            setStep(2);
        } catch (error) {
            let message = 'Registration failed. Please try again.';
            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    const data = error.response.data;
                    const firstError = Object.values(data)[0];
                    message = data.message || data.detail || 
                             (Array.isArray(firstError) ? firstError[0] : firstError) || 
                             'Registration failed.';
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
            await verifyOTP(registeredEmail, otp);
            toast.success("Email verified successfully! You can now sign in.");
            router.push('/auth/login');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const onResendOtp = async () => {
        setIsLoading(true);
        try {
            await resendOTP(registeredEmail);
            toast.success("A new verification code has been sent to your email.");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to resend code. Please try again.");
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
                    transition={{ duration: 2.2, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img 
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200" 
                        alt="Premium Estate Enrollment" 
                        className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
                    />
                </motion.div>

                {/* Subtle Floating Orbs */}
                <motion.div 
                    animate={{ 
                        y: [0, 20, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[110px] pointer-events-none z-10" 
                />
                
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-indigo-950/40 via-transparent to-slate-950/70" />
                
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
                        Join the <br />
                        <span className="text-indigo-400">Elite Registry.</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-white/70 text-lg mt-6 font-medium italic leading-relaxed"
                    >
                        Enroll your assets in Nepal's premier digital real estate ecosystem. Verified, transparent, and direct.
                    </motion.p>
                </div>
            </div>

            {/* Right Side: Registration Layer */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white overflow-y-auto">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full max-w-[520px] relative z-10"
                >
                    {/* Header/Logo for mobile */}
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="h-11 w-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform group-hover:rotate-3">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-900 font-outfit italic">SmartProperty</span>
                        </Link>
                    </div>

                    {/* Registration Card */}
                    <div className="bg-white rounded-[2.5rem] p-4 transition-all duration-500">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div 
                                    key="register-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="mb-8 pl-1">
                                        <h1 className="text-3xl font-black text-slate-900 mb-1.5 font-outfit tracking-tight italic leading-tight">Enroll Asset</h1>
                                        <p className="text-slate-400 font-medium text-sm italic">Join the verified property registry</p>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <Input
                                            label="Entity Name"
                                            placeholder="Full legal name"
                                            {...register('name')}
                                            error={errors.name?.message}
                                        />

                                        <Input
                                            label="Communication Channel"
                                            placeholder="Official email address"
                                            type="email"
                                            {...register('email')}
                                            error={errors.email?.message}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Input
                                                label="Security Key"
                                                placeholder="••••••••"
                                                type="password"
                                                {...register('password')}
                                                error={errors.password?.message}
                                            />
                                            <Input
                                                label="Re-entry"
                                                placeholder="••••••••"
                                                type="password"
                                                {...register('confirmPassword')}
                                                error={errors.confirmPassword?.message}
                                            />
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deployment Persona</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {(['buyer', 'seller'] as const).map((role) => (
                                                    <label
                                                        key={role}
                                                        className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/20 p-4 text-center transition-all hover:bg-slate-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-white has-[:checked]:ring-4 has-[:checked]:ring-indigo-500/5 shadow-sm"
                                                    >
                                                        <input type="radio" value={role} className="sr-only" {...register('role')} />
                                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-has-[:checked]:text-indigo-600 group-has-[:checked]:border-indigo-100 shadow-sm transition-all">
                                                            {role === 'buyer' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 group-has-[:checked]:text-slate-900 transition-colors">
                                                            {role === 'buyer' ? 'Asset Acquirer' : 'Strategic Seller'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={isLoading} 
                                            className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl mt-4 hover:bg-slate-800 shadow-xl transition-all group active:scale-95"
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-3">Request Enrollment <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" /></span>}
                                        </Button>
                                    </form>

                                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                            Synchronized with the network?
                                            <Link href="/auth/login" className="text-indigo-600 font-black ml-2 hover:underline underline-offset-8">
                                                Return to Access
                                            </Link>
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full text-center"
                                >
                                    <div className="h-20 w-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-sm border border-indigo-100">
                                        <KeyRound className="h-10 w-10 animate-pulse" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-3 font-outfit tracking-tighter italic">Confirm Transmission</h2>
                                    <p className="text-slate-500 text-sm mb-10 font-medium italic">
                                        A verification sequence was dispatched to <span className="text-indigo-600 font-bold block mt-1">{registeredEmail}</span>
                                    </p>
     
                                    <form onSubmit={onVerifyOtp} className="space-y-10">
                                        <div className="relative">
                                            <Input
                                                label="Verification Code"
                                                placeholder="000000"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                className="h-24 text-center text-5xl border-slate-200 bg-slate-50/50 font-outfit font-black tracking-[0.8rem] focus:bg-white text-slate-900 rounded-[1.5rem] shadow-inner transition-all"
                                            />
                                        </div>
     
                                        <div className="space-y-6">
                                            <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full h-16 rounded-[1.25rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Activate Profile'}
                                            </Button>
                                            
                                            <div className="flex flex-col gap-6 pt-6 border-t border-slate-50">
                                                <button type="button" onClick={onResendOtp} disabled={isLoading} className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-all italic">
                                                    Re-transmit Link
                                                </button>
                                                <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                                                    ← Re-evaluate Intel
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

