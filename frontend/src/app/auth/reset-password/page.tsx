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
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-12 px-4">
                <Container className="max-w-md">
                    <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
                        <p className="text-gray-500 mb-6">Your password has been changed successfully. You can now log in with your new password.</p>
                        <Button className="w-full" onClick={() => router.push('/auth/login')}>
                            Go to Login
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-12 px-4">
            <Container className="max-w-md">
                <div className="rounded-2xl border bg-white p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
                            <Building2 className="h-8 w-8" />
                            <span>SmartProperty</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                        <p className="mt-2 text-sm text-gray-500">Enter a new secure password for your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="New Password"
                            placeholder="••••••••"
                            type="password"
                            {...register('password')}
                            value={formValues.password}
                            error={errors.password?.message}
                        />

                        <Input
                            label="Confirm New Password"
                            placeholder="••••••••"
                            type="password"
                            {...register('confirmPassword')}
                            value={formValues.confirmPassword}
                            error={errors.confirmPassword?.message}
                        />

                        <Button type="submit" className="w-full py-6 text-lg mt-4" disabled={isLoading || !uid || !token}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Resetting...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </div>
            </Container>
        </div>
    );
}
