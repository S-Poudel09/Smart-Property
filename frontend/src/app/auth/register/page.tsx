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
    role: z.enum(['buyer', 'seller', 'admin'] as const),
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
            toast.success('Petition received! Verify your lineage via email.');
            setRegisteredEmail(data.email);
            setStep(2);
        } catch (error) {
            let message = 'Petition failed. The registry is closed.';
            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    const data = error.response.data;
                    message = data.message || data.detail || 'Access denied by the crown.';
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
            toast.success("Lineage Verified! You may now seek entry.");
            router.push('/auth/login');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "OTP mismatch. Verified identity denied.");
        } finally {
            setIsLoading(false);
        }
    };

    const onResendOtp = async () => {
        setIsLoading(true);
        try {
            await resendOTP(registeredEmail);
            toast.success("A new Imperial Seal has been dispatched to your email archive.");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "The herald failed to resend. Check your connection or try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-accent/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-accent/10 shadow-3xl overflow-hidden flex flex-col lg:flex-row relative z-10"
            >
                {/* Left Panel - Hero Branding */}
                <div className="lg:w-[40%] premium-gradient p-16 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-4">
                            <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center text-primary shadow-gold-glow">
                                <Crown className="h-7 w-7" />
                            </div>
                            <span className="text-xl font-serif">SmartProperty</span>
                        </Link>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-accent mb-8">
                            <Sparkles className="h-3 w-3" /> Divine Appointment
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-serif leading-tight mb-6 italic">Request <br /> <span className="not-italic text-accent">Sanctuary.</span></h2>
                        <p className="text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8 leading-relaxed max-w-[280px]">
                            "Join the exclusive circle of estate holders and manage your legacy in the realm."
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 p-10 sm:p-16 relative bg-[#fffdf9]/80 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto"
                            >
                                <div className="mb-10 text-center lg:text-left">
                                    <div className="h-1px w-12 bg-accent mb-6 hidden lg:block" />
                                    <h1 className="text-3xl font-serif text-primary mb-2 font-light">Create Your <span className="italic font-normal">Legacy</span></h1>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Step 01: Identification</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <Input
                                        label="Full Name / Lineage"
                                        placeholder="Princess Poudel"
                                        {...register('name')}
                                        error={errors.name?.message}
                                        className="h-14 rounded-2xl bg-white border-accent/10 shadow-inner"
                                    />
                                    <Input
                                        label="Email Archive"
                                        placeholder="princess@lineage.np"
                                        type="email"
                                        {...register('email')}
                                        error={errors.email?.message}
                                        className="h-14 rounded-2xl bg-white border-accent/10 shadow-inner"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Security Key"
                                            placeholder="••••••••"
                                            type="password"
                                            {...register('password')}
                                            error={errors.password?.message}
                                            className="h-14 rounded-2xl bg-white border-accent/10 shadow-inner"
                                        />
                                        <Input
                                            label="Verify Key"
                                            placeholder="••••••••"
                                            type="password"
                                            {...register('confirmPassword')}
                                            error={errors.confirmPassword?.message}
                                            className="h-14 rounded-2xl bg-white border-accent/10 shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Purpose in the Realm</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['buyer', 'seller', 'admin'] as const).map((role) => (
                                                <label
                                                    key={role}
                                                    className="group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-accent/10 bg-white p-4 text-center transition-all hover:bg-accent/5 has-[:checked]:border-accent has-[:checked]:bg-accent/10 shadow-sm"
                                                >
                                                    <input type="radio" value={role} className="sr-only" {...register('role')} />
                                                    <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-accent transition-colors peer-checked:bg-primary peer-checked:text-accent">
                                                        {role === 'buyer' ? <BadgeCheck className="h-5 w-5" /> : role === 'seller' ? <Building2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-primary">
                                                        {role === 'buyer' ? 'Acquire' : role === 'seller' ? 'Commission' : 'Oversee'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={isLoading} className="w-full h-18 text-xs font-black uppercase tracking-[0.2em] rounded-full bg-primary text-accent hover:bg-accent hover:text-primary transition-all duration-500 shadow-xl mt-6 flex items-center justify-center gap-3 group">
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Seal My Petition <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" /></>}
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
                                <div className="h-20 w-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto mb-10 shadow-gold-glow">
                                    <KeyRound className="h-10 w-10 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-serif text-primary mb-4">Verification Rite</h2>
                                <p className="text-gray-400 font-medium italic mb-12">"We have sent the Imperial Seal to your email archive. Perform the verification to finalize your petition."</p>

                                <form onSubmit={onVerifyOtp} className="space-y-10">
                                    <div className="relative">
                                        <Input
                                            label="Verification Sigil"
                                            placeholder="000 000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="h-24 text-center text-4xl border-0 bg-transparent font-serif tracking-[1rem] focus:ring-0 text-primary"
                                        />
                                        <div className="h-1px w-full bg-gradient-to-r from-transparent via-accent to-transparent" />
                                    </div>

                                    <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full h-18 text-xs font-black uppercase tracking-[0.2em] rounded-full bg-[#1a1a2e] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1a2e] transition-all duration-500 shadow-xl">
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Lineage'}
                                    </Button>

                                    <div className="flex flex-col gap-4">
                                        <button type="button" onClick={onResendOtp} disabled={isLoading} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] hover:text-[#1a1a2e] transition-colors disabled:opacity-50">
                                            Request New Seal (Resend)
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#1a1a2e] transition-colors">
                                            <ArrowLeft className="h-3 w-3" /> Ammend Petition
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <div className="mt-16 text-center">
                            <p className="text-gray-400 font-medium italic">
                                Already possess a key? {' '}
                                <Link href="/auth/login" className="text-accent font-black uppercase tracking-widest text-[11px] ml-2 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">
                                    Enter the Gates
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

