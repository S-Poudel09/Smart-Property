'use client';

import Link from 'next/link';
import { Eye, Edit, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { Property } from '@/types/property';
import { ListingStatusBadge } from './ListingStatusBadge';
import { Button } from '../common/Button';
import { formatNPR } from '@/lib/utils/currency';

interface ListingTableProps {
    listings: Property[];
    onDelete: (id: string) => void;
    onSubmit: (id: string) => void;
}

export const ListingTable = ({ listings, onDelete, onSubmit }: ListingTableProps) => {
    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No listings yet</h3>
                <p className="mt-2 text-gray-500 max-w-sm">
                    You haven&apos;t created any property listings. Start by adding a new one to get your properties out there.
                </p>
                <Link href="/dashboard/seller/add-listing" className="mt-6">
                    <Button>Add Your First Listing</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">Property</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Verification</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {listings.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{p.title}</span>
                                        <span className="text-xs text-gray-500 capitalize">{p.category} • {p.type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{p.city}</td>
                                <td className="px-6 py-4 font-bold text-blue-600">
                                    {formatNPR(p.price)}
                                    {p.type === 'rent' && <span className="text-xs font-normal">/mo</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <ListingStatusBadge status={p.status} />
                                </td>
                                <td className="px-6 py-4">
                                    {p.isVerified ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                            <CheckCircle2 className="h-3 w-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">Unverified</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/dashboard/seller/listings/${p.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        {p.status === 'DRAFT' && (
                                            <>
                                                <Link href={`/dashboard/seller/listings/${p.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => onSubmit(p.id)}
                                                    title="Submit for Approval"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                            onClick={() => onDelete(p.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
