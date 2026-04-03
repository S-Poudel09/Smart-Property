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
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
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
        <div className="min-h-screen bg-background flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
            </div>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row border border-border/50 relative z-10"
            >
                <div className="lg:w-[42%] bg-card p-12 lg:p-16 text-foreground relative flex flex-col justify-between overflow-hidden border-r border-border/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-foreground font-outfit">SmartProperty</span>
                        </Link>
                    </div>
 
                    <div className="relative z-10 py-16">
                        <div className="h-1.5 w-12 bg-primary/20 rounded-full mb-10" />
                        <h2 className="text-4xl lg:text-5xl font-bold leading-[1.1] mb-8 font-outfit">
                            Join our <br /><span className="text-primary italic">Network.</span>
                        </h2>
                        <p className="text-muted text-lg leading-relaxed max-w-xs font-medium">
                            Create an account to browse verified listings, connect with owners, and secure your next investment.
                        </p>
                    </div>
 
                    <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        Vetted Real Estate Marketplace
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-gray-50/50">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto w-full"
                            >
                                <div className="mb-10">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                                    <p className="text-gray-500">Sign up to access our comprehensive real estate platform.</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter your name"
                                        {...register('name')}
                                        error={errors.name?.message}
                                    />
                                    <Input
                                        label="Email Address"
                                        placeholder="name@company.com"
                                        type="email"
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Password"
                                            placeholder="••••••••"
                                            type="password"
                                            {...register('password')}
                                            error={errors.password?.message}
                                        />
                                        <Input
                                            label="Confirm Password"
                                            placeholder="••••••••"
                                            type="password"
                                            {...register('confirmPassword')}
                                            error={errors.confirmPassword?.message}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Type</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(['buyer', 'seller'] as const).map((role) => (
                                                <label
                                                    key={role}
                                                    className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-5 text-center transition-all hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 shadow-sm"
                                                >
                                                    <input type="radio" value={role} className="sr-only" {...register('role')} />
                                                    <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                        {role === 'buyer' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                        {role === 'buyer' ? 'Buyer' : 'Seller'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={isLoading} className="w-full h-14 font-bold uppercase tracking-widest rounded-xl mt-6 flex items-center justify-center gap-3">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
                                    </Button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-md mx-auto text-center"
                            >
                                <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8">
                                    <KeyRound className="h-10 w-10 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
                                <p className="text-gray-500 mb-10">We've sent a verification code to your email. Please enter it to complete your registration.</p>
 
                                <form onSubmit={onVerifyOtp} className="space-y-8">
                                    <div className="relative">
                                        <Input
                                            label="Verification Code"
                                            placeholder="000 000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="h-20 text-center text-4xl border-gray-100 bg-gray-50 font-bold tracking-[0.5rem] focus:bg-white text-gray-900 rounded-xl"
                                        />
                                    </div>
 
                                    <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full h-14 rounded-xl font-bold uppercase tracking-widest">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Registration'}
                                    </Button>
 
                                    <div className="flex flex-col gap-4">
                                        <button type="button" onClick={onResendOtp} disabled={isLoading} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline disabled:opacity-50">
                                            Resend Verification Code
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
                                            ← Edit Details
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <div className="mt-12 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account? {' '}
                                <Link href="/auth/login" className="text-primary font-bold uppercase tracking-widest text-[10px] ml-2 hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

