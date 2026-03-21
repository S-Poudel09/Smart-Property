'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth/mockAuth';
import { getTransactionById, uploadPaymentProof, cancelTransaction } from '@/lib/transactions/storage';
import { getPropertyById } from '@/lib/properties/storage';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { TransactionTimeline } from '@/components/transaction/TransactionTimeline';
import { PaymentProofUploader } from '@/components/transaction/PaymentProofUploader';
import { ArrowLeft, Building2, Calendar, DollarSign, FileText, User, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

import { Transaction } from '@/types/transaction';
import { Property } from '@/types/property';
import { FilePreview } from '@/components/common/FileUploader';
import { formatNPR, PAYMENT_METHODS } from '@/lib/utils/currency';

export default function BuyerTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    const [isActionLoading, setIsActionLoading] = useState(false);

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

    const handleUploadProof = (fileMeta: FilePreview) => {
        setIsActionLoading(true);
        setTimeout(() => {
            uploadPaymentProof(id, {
                name: fileMeta.name,
                size: fileMeta.size || 0,
                type: fileMeta.type || 'application/pdf',
                previewUrl: fileMeta.previewUrl || '',
                uploadedAt: new Date().toISOString()
            });
            toast.success('Payment proof uploaded successfully!');
            fetchData();
            setIsActionLoading(false);
        }, 1000);
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this transaction?')) {
            cancelTransaction(id);
            toast.success('Transaction cancelled');
            fetchData();
        }
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
            <Container className="py-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Transaction Not Found</h2>
                    <Link href="/dashboard/buyer/transactions" className="mt-4 inline-block text-blue-600 hover:underline">
                        Back to My Transactions
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['buyer']}>
            <div className="min-h-screen bg-gray-50 py-12">
                <Container>
                    <Link href="/dashboard/buyer/transactions" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Transactions
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Transaction Heading */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">{transaction.property?.title}</h1>
                                            <p className="text-sm text-gray-500 font-medium">Transaction ID: {transaction.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-1">
                                        <StatusBadge status={transaction.status} className="scale-110" />
                                        <p className="text-xs text-gray-400 mt-2">Started on {new Date(transaction.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <TransactionTimeline status={transaction.status} />
                            </div>

                            {/* Payment Section */}
                            {transaction.status === 'AWAITING_PROOF' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">How to Pay</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                            {PAYMENT_METHODS.map((method) => (
                                                <div key={method.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border hover:border-blue-200 transition-colors cursor-pointer group">
                                                    <span className="text-2xl">{method.icon}</span>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600">{method.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Nepal Gateway</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                                            <p className="text-xs text-blue-800 leading-relaxed">
                                                Please make the payment of <strong>{formatNPR(transaction.amount)}</strong> to the seller using any of the Nepali payment gateways above. After payment, take a screenshot of the transaction receipt and upload it below.
                                            </p>
                                        </div>
                                    </div>
                                    <PaymentProofUploader onUpload={handleUploadProof} isLoading={isActionLoading} />
                                </div>
                            )}

                            {transaction.status === 'PROOF_UPLOADED' && transaction.paymentProof && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Proof of Payment</h3>
                                    </div>
                                    <div className="rounded-xl border bg-gray-50 p-6 flex flex-col md:flex-row items-center gap-6">
                                        <div className="h-32 w-32 rounded-lg border bg-white overflow-hidden shadow-sm flex-shrink-0">
                                            {transaction.paymentProof.type.startsWith('image/') ? (
                                                <img src={transaction.paymentProof.previewUrl} alt="Proof" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-blue-600">
                                                    <FileText className="h-12 w-12" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <p className="font-bold text-gray-900 mb-1">{transaction.paymentProof.name}</p>
                                            <p className="text-sm text-gray-500 mb-4">Uploaded on {new Date(transaction.paymentProof.uploadedAt).toLocaleString()}</p>
                                            <p className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full inline-block">
                                                Awaiting Seller Confirmation
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {transaction.status === 'CONFIRMED' && (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-900">Transaction Completed</h3>
                                        <p className="text-green-700">The seller has confirmed receipt of payment. Congratulations on your property!</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Property Price</span>
                                        <span className="font-bold text-gray-900">{formatNPR(transaction.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Service Fee</span>
                                        <span className="font-bold text-gray-900">{formatNPR(0)}</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="text-xl font-bold text-blue-600">{formatNPR(transaction.amount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Involved Parties</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Buyer</p>
                                            <p className="text-sm font-bold text-gray-900">You (ID: {transaction.buyerId})</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seller</p>
                                            <p className="text-sm font-bold text-gray-900">Owner (ID: {transaction.sellerId})</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {transaction.status === 'AWAITING_PROOF' && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-start gap-3 text-red-600 mb-4">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <p className="text-sm font-bold">Cancel Transaction</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">Changed your mind? You can cancel this request before submitting payment proof.</p>
                                    <Button variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50" onClick={handleCancel}>
                                        Cancel Transaction
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
