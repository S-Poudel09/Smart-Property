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
import { loginUser } from '@/lib/api/auth';
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
            localStorage.setItem('smartproperty_token', response.access);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('userRole', response.user.role);
            }
            const role = response.user?.role?.toLowerCase();
            toast.success('Access Granted to the Realm!');
            if (role === 'buyer') router.push('/dashboard/buyer');
            else if (role === 'seller') router.push('/dashboard/seller');
            else if (role === 'admin') router.push('/dashboard/admin');
            else router.push('/');
        } catch (error) {
            let message = 'Access Denied. Verify your credentials.';
            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    const data = error.response.data;
                    message = data.message || data.detail || 'The gates remain closed.';
                }
            }
            toast.error(message);
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
                className="w-full max-w-6xl bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-accent/10 shadow-3xl overflow-hidden flex flex-col lg:flex-row relative z-10"
            >
                {/* Left Panel - Branding */}
                <div className="lg:w-[45%] premium-gradient p-16 text-white relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[80px]" 
                    />
                    
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
                            <ShieldCheck className="h-3.5 w-3.5" /> Identity Required
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-serif leading-[0.9]">Access the <br /> <span className="italic text-accent">Sovereign.</span></h2>
                        <p className="text-gray-400 text-lg lg:text-xl font-medium italic border-l-4 border-accent/30 pl-8 leading-relaxed max-w-sm">
                            "Enter the registry of elite estates and manage your legacy with imperial precision."
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto pt-16">
                        <div className="flex gap-4">
                            <div className="h-1px flex-1 bg-white/10 self-center" />
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 p-12 sm:p-20 relative bg-[#fffdf9]/80 flex flex-col justify-center">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="max-w-md mx-auto w-full"
                    >
                        <div className="mb-12 text-center lg:text-left">
                            <div className="h-1px w-12 bg-accent mb-6 hidden lg:block" />
                            <h3 className="text-4xl font-serif text-primary mb-4">Identify Yourself</h3>
                            <p className="text-gray-400 font-medium italic">Seek entry to the imperial registers.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                <Input
                                    label="Email Archive"
                                    placeholder="your-lineage@domain.com"
                                    {...register('email')}
                                    error={errors.email?.message}
                                    className="h-16 rounded-2xl bg-white border-[#c5a059]/10 focus:border-[#c5a059] shadow-inner font-medium"
                                />
                                <div>
                                    <Input
                                        label="Security Key"
                                        type="password"
                                        placeholder="••••••••"
                                        {...register('password')}
                                        error={errors.password?.message}
                                        className="h-16 rounded-2xl bg-white border-[#c5a059]/10 focus:border-[#c5a059] shadow-inner font-medium"
                                    />
                                    <div className="flex justify-end mt-4">
                                        <Link href="/auth/forgot-password" title="Recover your lineage credentials" className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center gap-2">
                                            <Key className="h-3 w-3" /> Lost your key?
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-20 rounded-full bg-primary text-white hover:bg-accent transition-all duration-500 shadow-3xl shadow-primary/20 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Authenticated...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Grant Access</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-16 pt-12 border-t border-accent/10 text-center">
                            <p className="text-gray-400 font-medium italic">
                                First time in the realm? {' '}
                                <Link href="/auth/register" className="inline-flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[11px] ml-2 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">
                                    Request Sanctuary <Sparkles className="h-3 w-3" />
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

