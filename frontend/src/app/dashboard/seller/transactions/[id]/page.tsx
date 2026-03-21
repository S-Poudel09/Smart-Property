'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getTransactionById, sellerConfirm } from '@/lib/transactions/storage';
import { getPropertyById } from '@/lib/properties/storage';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { TransactionTimeline } from '@/components/transaction/TransactionTimeline';
import { ArrowLeft, Building2, User, DollarSign, FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

import { Transaction } from '@/types/transaction';
import { Property } from '@/types/property';
import { formatNPR } from '@/lib/utils/currency';

export default function SellerTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [transaction, setTransaction] = useState<(Transaction & { property?: Property }) | null>(() => {
        if (typeof window === 'undefined') return null;
        const trx = getTransactionById(id);
        if (trx) {
            let prop = getPropertyById(trx.propertyId);
            if (!prop) {
                prop = MOCK_PROPERTIES.find(p => p.id === trx.propertyId) as Property;
            }
            return { ...(trx as Transaction), property: prop };
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const fetchData = () => {
        const trx = getTransactionById(id);
        if (trx) {
            let prop = getPropertyById(trx.propertyId);
            if (!prop) {
                prop = MOCK_PROPERTIES.find(p => p.id === trx.propertyId);
            }
            setTransaction({ ...trx, property: prop });
        }
        setIsLoading(false);
    };

    const handleConfirmTransfer = () => {
        if (!confirm('Are you sure you have received the funds? This will mark the transaction as completed.')) {
            return;
        }

        setIsConfirming(true);
        setTimeout(() => {
            sellerConfirm(id);
            toast.success('Payment confirmed! Sale completed.');
            fetchData();
            setIsConfirming(false);
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Transaction Not Found</h2>
                <Link href="/dashboard/seller/transactions" className="mt-4 inline-block text-blue-600 hover:underline">
                    Back to My Sales
                </Link>
            </Container>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/seller/transactions" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sales
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Section */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">Sale Review: {transaction.property?.title}</h1>
                                            <p className="text-sm text-gray-500 font-medium">TRX ID: {transaction.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end">
                                        <StatusBadge status={transaction.status} className="scale-110" />
                                        <p className="text-xs text-gray-400 mt-2">Received on {new Date(transaction.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <TransactionTimeline status={transaction.status} />
                            </div>

                            {/* Proof Review Section */}
                            {transaction.status === 'PROOF_UPLOADED' && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                        Buyer Payment Proof
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border-2 border-dashed p-4 bg-gray-50">
                                            {transaction.paymentProof?.type?.startsWith('image/') ? (
                                                <div className="aspect-video relative rounded-xl overflow-hidden bg-white group">
                                                    <img
                                                        src={transaction.paymentProof.previewUrl}
                                                        alt="Payment Proof"
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a
                                                            href={transaction.paymentProof.previewUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                                                        >
                                                            <ExternalLink className="h-4 w-4" /> View Full Size
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                                                    <FileText className="h-16 w-16 mb-2" />
                                                    <p className="font-bold">{transaction.paymentProof?.name}</p>
                                                    <p className="text-sm text-gray-500">PDF Document</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                                            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-blue-900">Verify Carefully</p>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Please ensure the amount matches the property price and the funds have cleared in your bank account before confirming receipt.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleConfirmTransfer}
                                                isLoading={isConfirming}
                                                className="px-10 py-6 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                                            >
                                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                                Confirm Receipt & Complete Sale
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {transaction.status === 'CONFIRMED' && (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-green-900">Sale Successfully Completed</h3>
                                        <p className="text-green-700 mt-1">Transaction is finalized and archived. Funds should be in your account.</p>
                                    </div>
                                </div>
                            )}

                            {transaction.status === 'AWAITING_PROOF' && (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-8 flex items-center gap-4">
                                    <ClockIcon className="h-10 w-10 text-yellow-600" />
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-900">Awaiting Buyer Payment</h3>
                                        <p className="text-yellow-700">The buyer has initiated interest. You will be notified once they upload payment proof.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Sale Details</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Property Price</span>
                                        <span className="font-bold text-gray-900">{formatNPR(transaction.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-sm text-gray-500">Service Fee (0%)</span>
                                        <span className="font-bold text-gray-900">{formatNPR(0)}</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Expected Payout</span>
                                        <span className="text-xl font-bold text-green-600">{formatNPR(transaction.amount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Purchaser Info</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Buyer Account</p>
                                        <p className="font-bold text-gray-900">ID: {transaction.buyerId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    );
}
