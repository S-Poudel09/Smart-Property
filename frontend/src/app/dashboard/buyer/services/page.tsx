'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUser } from '@/lib/auth/getUser';
import { getServiceBookings, ServiceBooking } from '@/lib/api/services';
import { BookingStatusBadge } from '@/components/services/BookingStatusBadge';
import { MapPin, Calendar, Clock, Briefcase, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';

export default function BuyerServicesPage() {
    const [bookings, setBookings] = useState<ServiceBooking[]>([]);

    useEffect(() => {
        getServiceBookings().then(data => {
            setBookings(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        });
    }, []);

    return (
        <ProtectedRoute allowedRoles={['buyer']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Service Bookings</h1>
                            <p className="mt-1 text-gray-500 font-medium tracking-tight">Track your requested professional services and experts.</p>
                        </div>
                        <Link href="/services">
                            <Button className="rounded-xl flex items-center gap-2 shadow-lg shadow-blue-100">
                                <Briefcase className="h-4 w-4" />
                                Browse Marketplace
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                        {bookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5">Service Provider</th>
                                            <th className="px-8 py-5">Scheduled Date</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.map((booking) => {
                                            return (
                                                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                                                <Briefcase className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900 capitalize">{booking.service_details?.name || 'Service'}</div>
                                                                <div className="text-xs text-gray-400 font-medium">SmartProperty Official</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                            <Calendar className="h-4 w-4 text-gray-300" />
                                                            {booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : 'TBD'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-1">
                                                            <Clock className="h-3 w-3" />
                                                            Applied {new Date(booking.created_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        <BookingStatusBadge status={booking.status as any} />
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-xs text-gray-500 font-medium italic">Managed internally</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="h-8 w-8 text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h2>
                                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                                    You haven&apos;t requested any professional services. Browse our marketplace to find experts for your home.
                                </p>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
