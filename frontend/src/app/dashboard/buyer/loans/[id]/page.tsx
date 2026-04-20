'use client';

import { use, useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ArrowLeft, Building2, IndianRupee, Briefcase, MessageSquare, AlertCircle, Landmark, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/http';
import { format } from 'date-fns';
import { Loader } from '@/components/common/Loader';

export default function BuyerLoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loan, setLoan] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!id || id === 'undefined') return;
            try {
                setIsLoading(true);
                const res = await api.get(`loans/${id}/`);
                setLoan(res.data);
            } catch (e: any) {
                setError(e.response?.status === 404 ? 'Loan application not found.' : 'Failed to load loan details.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader size="lg" />
        </div>
    );

    if (error || !loan) {
        return (
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{error || 'Application Not Found'}</h2>
                <Link href="/dashboard/buyer/loans" className="mt-4 inline-block text-indigo-600 hover:underline">
                    Back to My Applications
                </Link>
            </Container>
        );
    }

    const statusColors: Record<string, string> = {
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-200',
        SUBMITTED: 'bg-purple-50 text-purple-700 border-purple-200',
        UNDER_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    return (
        <ProtectedRoute allowedRoles={['buyer']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/buyer/loans" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Applications
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-gray-50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Landmark className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900">Loan Application</h1>
                                                <p className="text-gray-500 font-medium text-sm">Property ID: {loan.PropertyID || loan.property || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColors[loan.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                {(loan.status || '').replace('_', ' ')}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                                Applied on {loan.application_date ? format(new Date(loan.application_date), 'MMM d, yyyy') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <IndianRupee className="h-3 w-3" /> Loan Amount
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            Rs. {parseFloat(loan.LoanAmount || loan.loan_amount || '0').toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" /> Interest Rate
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loan.InterestRate || loan.interest_rate || 'N/A'}% Fixed APR
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Loan Term
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loan.LoanTerm || loan.loan_term ? `${Math.round((loan.LoanTerm || loan.loan_term) / 12)} Years` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loan.status === 'REJECTED' && (
                                <div className="bg-rose-50 rounded-3xl border border-rose-100 p-8 flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-rose-900 mb-1">Application Rejected</h3>
                                        <p className="text-rose-700 font-medium">Reason: <span className="text-rose-600">{loan.rejection_reason || 'No reason specified.'}</span></p>
                                        <p className="mt-4 text-sm text-rose-500">You may contact our support or re-apply after 30 days with updated financial information.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b">Application Timeline</h3>
                                <div className="space-y-6">
                                    {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].map((step) => {
                                        const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
                                        const currentIdx = statuses.indexOf(loan.status);
                                        const stepIdx = statuses.indexOf(step);
                                        const isDone = currentIdx >= stepIdx && loan.status !== 'REJECTED';
                                        const isCurrent = loan.status === step;
                                        return (
                                            <div key={step} className="flex gap-4 items-start">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 ${isDone ? 'bg-indigo-600 border-indigo-600 text-white' : isCurrent ? 'border-indigo-400 text-indigo-400' : 'border-gray-200 text-gray-300'}`}>
                                                    {stepIdx + 1}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isDone ? 'text-gray-900' : 'text-gray-300'}`}>{step.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {loan.status === 'REJECTED' && (
                                        <div className="flex gap-4 items-start">
                                            <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 bg-red-600 border-red-600 text-white">✗</div>
                                            <div>
                                                <p className="text-sm font-bold text-red-700">REJECTED</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 pt-8 border-t">
                                    <Link href="/dashboard/chats">
                                        <button className="w-full rounded-xl border border-indigo-600 px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Contact Support
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
