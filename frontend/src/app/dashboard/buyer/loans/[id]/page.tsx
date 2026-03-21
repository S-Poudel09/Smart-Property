'use client';

import { use, useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth/mockAuth';
import { getLoanById } from '@/lib/loans/storage';
import { getPropertyById } from '@/lib/properties/storage';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { LoanTimeline } from '@/components/loan/LoanTimeline';
import { LoanStatusBadge } from '@/components/loan/LoanStatusBadge';
import { ArrowLeft, Building2, IndianRupee, Briefcase, MessageSquare, AlertCircle } from 'lucide-react';
import { LoanRequest } from '@/types/loan';
import Link from 'next/link';

export default function BuyerLoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loan, setLoan] = useState<LoanRequest | null>(() => {
        if (typeof window === 'undefined') return null;
        const user = getCurrentUser();
        if (user) {
            const data = getLoanById(id);
            if (data && data.buyerId === user.id) {
                return data;
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!loan) {
        return (
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Application Not Found</h2>
                <Link href="/dashboard/buyer/loans" className="mt-4 inline-block text-blue-600 hover:underline">
                    Back to My Applications
                </Link>
            </Container>
        );
    }

    const property = getPropertyById(loan.propertyId) || MOCK_PROPERTIES.find(p => p.id === loan.propertyId);

    return (
        <ProtectedRoute allowedRoles={['buyer']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/buyer/loans" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Applications
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Main Card */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-gray-50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Building2 className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900">{property?.title}</h1>
                                                <p className="text-gray-500 font-medium">{property?.address}, {property?.city}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <LoanStatusBadge status={loan.status} />
                                            <p className="text-xs text-gray-400 mt-2 font-medium">Applied on {new Date(loan.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <IndianRupee className="h-3 w-3" /> Requested Amount
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">₹{loan.amountRequested.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <IndianRupee className="h-3 w-3" /> Monthly Income
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">₹{loan.income.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" /> Employment
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">{loan.employmentStatus}</p>
                                    </div>
                                </div>

                                {loan.message && (
                                    <div className="mx-8 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" /> Applicant Message
                                        </p>
                                        <p className="text-sm text-gray-600 italic">&quot;{loan.message}&quot;</p>
                                    </div>
                                )}
                            </div>

                            {/* Rejection Note */}
                            {loan.status === 'REJECTED' && (
                                <div className="bg-rose-50 rounded-3xl border border-rose-100 p-8 flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-rose-900 mb-1">Application Rejected</h3>
                                        <p className="text-rose-700 font-medium">Reason: <span className="text-rose-600">{loan.rejectionReason || 'No reason specified.'}</span></p>
                                        <p className="mt-4 text-sm text-rose-500">You may contact our support or re-apply after 30 days with updated financial information.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Timeline */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b">Application Timeline</h3>
                                <LoanTimeline status={loan.status} updatedAt={loan.updatedAt} />

                                <div className="mt-10 pt-8 border-t">
                                    <Link href={`/dashboard/buyer/chats`}>
                                        <button className="w-full rounded-xl border border-blue-600 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Contact Loan Officer
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
