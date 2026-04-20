'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import { getProviderById, createBooking } from '@/lib/services/storage';
import { ServiceProvider } from '@/types/service';
import { isAuthenticated, getUser } from '@/lib/auth/getUser';
import { toast } from 'react-hot-toast';
import {
    Star,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    Calendar,
    ArrowLeft,
    ShieldCheck,
    MessageSquare,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { getAllProperties } from '@/lib/properties/storage';

const bookingSchema = z.object({
    propertyId: z.string().optional(),
    bookingDate: z.string().min(1, 'Please select a date'),
    note: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

import { Property } from '@/types/property';

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [provider, setProvider] = useState<ServiceProvider | null>(() => {
        if (typeof window === 'undefined') return null;
        return getProviderById(id) || null;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [properties, setProperties] = useState<Property[]>(() => {
        if (typeof window === 'undefined') return [];
        return getAllProperties() as Property[];
    });

    const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>();

    useEffect(() => {
        if (!provider && typeof window !== 'undefined') {
            toast.error('Provider not found');
            router.push('/services');
        }
    }, [id, router, provider]);

    if (!provider) return null;

    const onSubmit = (data: BookingFormData) => {
        if (!isAuthenticated()) {
            toast.error('Please login to book a service');
            router.push(`/auth/login?redirect=/services/${id}`);
            return;
        }

        const user = getUser();
        if (user?.role !== 'buyer') {
            toast.error('Only buyers can book services');
            return;
        }

        setIsSubmitting(true);
        try {
            createBooking({
                buyerId: user.id,
                providerId: provider.id,
                ...data,
            });
            toast.success('Service requested successfully!');
            router.push('/dashboard/buyer/services');
        } catch (error) {
            toast.error('Failed to book service');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            {/* Sub-header */}
            <div className="bg-white border-b py-4">
                <Container>
                    <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Services
                    </Link>
                </Container>
            </div>

            <Container className="mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left - Provider Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider border border-purple-100 mb-4">
                                        <Sparkles className="h-3 w-3" /> {provider.category}
                                    </div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{provider.name}</h1>
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-gray-900 font-bold">{provider.rating}</span>
                                            <span className="text-gray-400">(48 reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 border-l pl-4">
                                            <MapPin className="h-4 w-4 text-gray-300" />
                                            {provider.city}
                                        </div>
                                        {provider.verified && (
                                            <div className="flex items-center gap-1 text-indigo-600 border-l pl-4 font-bold">
                                                <ShieldCheck className="h-4 w-4" />
                                                Verified
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Estimated Cost</p>
                                    <p className="text-3xl font-extrabold text-purple-600">{provider.priceRange}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">About Provider</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {provider.description} Our professional team ensures the highest quality results, meeting all safety standards and guidelines.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 border-y border-gray-50">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Call Agency</p>
                                            <p className="text-sm font-bold text-gray-900">{provider.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900">{provider.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why choose section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Verified Background', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { title: 'Insurance Covered', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { title: 'No Hidden Fees', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center gap-3">
                                    <div className={`h-12 w-12 rounded-full ${item.bg} ${item.color} flex items-center justify-center`}>
                                        {(() => {
                                            const Icon = item.icon;
                                            return <Icon className="h-6 w-6" />;
                                        })()}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Booking Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden sticky top-24">
                            <div className="bg-purple-600 p-8 text-white">
                                <h3 className="text-xl font-bold mb-2">Request Service</h3>
                                <p className="text-purple-100 text-sm opacity-90 font-medium">No payment needed today. Request a free quote!</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        Preferred Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register('bookingDate')}
                                        className="w-full rounded-xl border-gray-200 p-4 text-sm focus:border-purple-500 font-bold transition-all"
                                    />
                                    {errors.bookingDate && <p className="text-xs text-rose-600 font-medium">{errors.bookingDate.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-purple-600" />
                                        Select Property (Optional)
                                    </label>
                                    <select
                                        {...register('propertyId')}
                                        className="w-full rounded-xl border-gray-200 p-4 text-sm focus:border-purple-500 font-bold transition-all"
                                    >
                                        <option value="">Specific property not linked</option>
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-purple-600" />
                                        Special Note / Requirements
                                    </label>
                                    <textarea
                                        {...register('note')}
                                        rows={4}
                                        placeholder="E.g. Full inspection of 3 BHK apartment..."
                                        className="w-full rounded-xl border-gray-200 p-4 text-sm focus:border-purple-500 transition-all resize-none font-medium"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-purple-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Requesting...' : 'Request Quote'}
                                </Button>

                                <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                                    The provider will contact you shortly to confirm availability and discuss pricing.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
