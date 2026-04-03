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
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
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
        <div className="min-h-screen bg-background flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Subtle Abstract Background Elements */}
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
                {/* Left Panel - Professional Branding */}
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
                            Modern Real Estate <br /><span className="text-primary italic">Simplified.</span>
                        </h2>
                        <ul className="space-y-6">
                            {[
                                { icon: ShieldCheck, text: "Verified listings only" },
                                { icon: Home, text: "Seamless property management" },
                                { icon: Key, text: "Secure digital transactions" }
                            ].map((item, i) => (
                                <motion.li 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-4 text-muted font-medium"
                                >
                                    <div className="h-8 w-8 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
                                        <item.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-foreground">{item.text}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
 
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted mb-2">Platform Registry</p>
                        <p className="text-muted text-xs font-medium">Trusted by over 5,000+ property seekers in Nepal.</p>
                    </div>
                </div>

                {/* Right Panel - Login/OTP Form */}
                <div className="flex-1 p-10 lg:p-20 flex flex-col justify-center bg-white">
                    <AnimatePresence mode="wait">
                        {step === 'login' ? (
                            <motion.div 
                                key="login-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto w-full"
                            >
                                <div className="mb-12">
                                    <h3 className="text-4xl font-bold text-foreground mb-3 font-outfit">Welcome Back</h3>
                                    <p className="text-muted text-lg">Access your secure workspace</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="space-y-6">
                                        <Input
                                            label="Email Address"
                                            placeholder="you@example.com"
                                            {...register('email')}
                                            error={errors.email?.message}
                                        />
                                        <div className="space-y-2">
                                            <Input
                                                label="Password"
                                                type="password"
                                                placeholder="••••••••"
                                                {...register('password')}
                                                error={errors.password?.message}
                                            />
                                            <div className="flex justify-end pr-1">
                                                <Link href="/auth/forgot-password" title="Recover your password" className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-primary transition-colors">
                                                    Forgot Password?
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full rounded-2xl h-14"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Authenticating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In to Dashboard</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-16 pt-10 border-t border-border/50 text-center">
                                    <p className="text-muted text-sm font-medium">
                                        New to the platform?
                                        <Link href="/auth/register" className="text-primary font-bold uppercase tracking-widest text-[10px] ml-3 hover:underline underline-offset-4">
                                            Create Account
                                        </Link>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="otp-form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-md mx-auto text-center"
                            >
                                <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-10 shadow-inner">
                                    <ShieldCheck className="h-12 w-12" />
                                </div>
                                <h2 className="text-4xl font-bold text-foreground mb-3 font-outfit">Security Check</h2>
                                <p className="text-muted text-lg mb-12">
                                    A verification code was sent to <span className="text-foreground font-bold">{otpEmail}</span>.
                                </p>

                                <form onSubmit={onVerifyOtp} className="space-y-10">
                                    <div className="relative">
                                        <Input
                                            label="One-Time Verification Code"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="h-24 text-center text-5xl border-border bg-background font-outfit font-bold tracking-[0.6rem] focus:bg-white text-foreground rounded-2xl shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full h-14 rounded-2xl">
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Sign In'}
                                        </Button>
                                        
                                        <div className="flex flex-col gap-6 pt-6">
                                            <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline underline-offset-4 disabled:opacity-50 transition-all">
                                                Resend Code
                                            </button>
                                            <button type="button" onClick={() => setStep('login')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors">
                                                ← Switch Account
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
    );
}

