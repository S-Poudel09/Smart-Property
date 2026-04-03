'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    MapPin,
    Bed,
    Bath,
    Square,
    Building2,
    Calendar,
    FileText,
    CheckCircle2,
    AlertCircle,
    Send,
    Loader2,
    Trash2,
    Edit
} from 'lucide-react';

import DashboardShell from '@/components/layout/DashboardShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { ListingStatusBadge } from '@/components/property/ListingStatusBadge';
import { getPropertyById, submitProperty, deleteProperty } from '@/lib/properties/storage';
import { getUser } from '@/lib/auth/getUser';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';

export default function SellerListingDetailsPage() {
    const { id } = useParams();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();
    const user = getUser();

    useEffect(() => {
        const data = getPropertyById(id as string);
        if (!data) {
            toast.error('Listing not found');
            router.push('/dashboard/seller');
            return;
        }

        // Check ownership
        if (user && data.sellerId !== user.id) {
            toast.error('Unauthorized');
            router.push('/dashboard/seller');
            return;
        }

        setProperty(data);
        setIsLoading(false);
    }, [id, router, user]);

    const handleSubmit = async () => {
        if (!property) return;
        setIsActionLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            submitProperty(property.id);
            setProperty(prev => prev ? { ...prev, status: 'submitted' } : null);
            toast.success('Listing submitted for approval!');
        } catch (e) {
            toast.error('Failed to submit listing');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = () => {
        if (!property) return;
        if (confirm('Are you sure you want to delete this listing?')) {
            deleteProperty(property.id);
            toast.success('Listing deleted');
            router.push('/dashboard/seller');
        }
    };

    if (isLoading) {
        return (
            <DashboardShell title="Listing Details">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </DashboardShell>
        );
    }

    if (!property) return null;

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <DashboardShell title={property.title}>
                <div className="max-w-5xl">
                    <Link href="/dashboard/seller" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Info */}
                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <ListingStatusBadge status={property.status} />
                                        {property.isVerified && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                <CheckCircle2 className="h-4 w-4" /> Verified Listing
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        ${property.price.toLocaleString()}
                                        {property.type === 'rent' && <span className="text-sm font-normal text-gray-500">/mo</span>}
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                                <div className="flex items-center gap-2 text-gray-500 mb-6">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm">{property.address}, {property.city}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-b py-6">
                                    <div className="flex flex-col items-center gap-1">
                                        <Bed className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-900">{property.bedrooms} Beds</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 border-x">
                                        <Bath className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-900">{property.bathrooms} Baths</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <Square className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-900">{property.area} Sq Ft</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
                                </div>
                            </div>

                            {/* Images & Documents */}
                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Gallery & Assets</h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-8">
                                    {property.images.map((img, i) => (
                                        <div key={i} className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
                                            <img
                                                src={typeof img === 'string' ? img : (img as { previewUrl: string }).previewUrl}
                                                alt={`Property ${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-4">Ownership Documents</h3>
                                <div className="space-y-3">
                                    {property.documents?.map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-xs text-gray-500 uppercase">{doc.docType}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{(doc.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    ))}
                                    {(!property.documents || property.documents.length === 0) && (
                                        <div className="text-center py-4 text-sm text-gray-500">No documents uploaded.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Actions */}
                        <div className="space-y-6">
                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Management Actions</h3>

                                {property.status === 'draft' ? (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800 mb-4">
                                            <div className="flex gap-2 font-bold mb-1">
                                                <AlertCircle className="h-4 w-4" /> Ready to Submit?
                                            </div>
                                            This listing is currently a draft. Submit it for admin review to get it published.
                                        </div>
                                        <Button
                                            className="w-full gap-2 py-6"
                                            onClick={handleSubmit}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                            Submit for Approval
                                        </Button>
                                        <Link href={`/dashboard/seller/listings/${property.id}/edit`} className="block">
                                            <Button variant="outline" className="w-full gap-2">
                                                <Edit className="h-4 w-4" /> Edit Listing
                                            </Button>
                                        </Link>
                                    </div>
                                ) : property.status === 'submitted' ? (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                                        <div className="flex gap-2 font-bold mb-1">
                                            <CheckCircle2 className="h-4 w-4" /> Under Review
                                        </div>
                                        Administrator is currently reviewing your listing. You cannot edit it at this time.
                                    </div>
                                ) : (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                                        <div className="font-bold mb-1">Active Listing</div>
                                        Your property is live on the marketplace.
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t">
                                    <Button
                                        variant="ghost"
                                        className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete Listing
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Listing History</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Created</p>
                                            <p className="text-xs text-gray-500">{new Date(property.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-400">Approved</p>
                                            <p className="text-xs text-gray-500 italic">Pending review</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardShell>
        </ProtectedRoute>
    );
}
