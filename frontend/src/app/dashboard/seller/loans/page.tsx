'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUser } from '@/lib/auth/getUser';
import { getLoansBySeller } from '@/lib/loans/storage';
import { getPropertyById } from '@/lib/properties/storage';

import { LoanRequest } from '@/types/loan';
import { LoanStatusBadge } from '@/components/loan/LoanStatusBadge';
import { Building2, Calendar, IndianRupee } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export default function SellerLoansPage() {
    const [loans, setLoans] = useState<LoanRequest[]>(() => {
        if (typeof window === 'undefined') return [];
        const user = getUser();
        if (user) {
            const sellerLoans = getLoansBySeller(user.id);
            return sellerLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return [];
    });
    const [isLoading, setIsLoading] = useState(false);

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Inbound Financing</h1>
                        <p className="mt-1 text-gray-500">Track loan applications from potential buyers for your listings.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Property</th>
                                        <th className="px-6 py-4">Requested By</th>
                                        <th className="px-6 py-4">Requested Range</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Applied Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loans.map((loan) => {
                                        const prop = getPropertyById(loan.propertyId);
                                        return (
                                            <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 min-w-[40px] rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                                            <Building2 className="h-5 w-5" />
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-900">{prop?.title}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">ID: {loan.buyerId}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-sm font-bold text-gray-900">
                                                        <IndianRupee className="h-3 w-3 mr-0.5" />
                                                        {loan.amountRequested.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <LoanStatusBadge status={loan.status} />
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        {new Date(loan.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {loans.length === 0 && !isLoading && (
                                <div className="py-20 flex flex-col items-center justify-center px-6">
                                    <EmptyState
                                        title="No Loan Inquiries"
                                        description="No active loan applications found for your property listings."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
