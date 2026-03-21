'use client';

import { useEffect, useState } from 'react';
import { getProperties, submitProperty } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { getCurrentUser } from '@/lib/auth/mockAuth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Edit, Send } from 'lucide-react';

export default function SellerListingsPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProperties = async () => {
        try {
            const user = getCurrentUser();
            const data = await getProperties();
            setProperties(data.filter(p => p.sellerId === user?.id));
        } catch (e) {
            toast.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const handleSubmitForReview = async (id: string) => {
        try {
            await submitProperty(id);
            toast.success("Property submitted for review");
            loadProperties();
        } catch (e) {
            toast.error("Failed to submit property");
        }
    }

    if (loading) return <div className="p-12 flex justify-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Listings</h1>
                <Link href="/dashboard/seller/listings/add">
                    <Button variant="primary" className="gap-2">
                        <Plus className="h-4 w-4" /> Add Property
                    </Button>
                </Link>
            </div>
            
            {properties.length === 0 ? (
                <EmptyState title="No active listings" description="You haven't added any properties yet." action={<Link href="/dashboard/seller/listings/add"><Button>Add Property</Button></Link>} />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-gray-600">Property</th>
                                <th className="p-4 font-medium text-gray-600">Price</th>
                                <th className="p-4 font-medium text-gray-600">Status</th>
                                <th className="p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {properties.map(property => (
                                <tr key={property.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{property.title}</td>
                                    <td className="p-4">${Number(property.price).toLocaleString()}</td>
                                    <td className="p-4">
                                        <StatusBadge status={property.status} />
                                        {property.rejectionReason && (
                                            <p className="text-xs mt-1 text-red-500 font-medium">Rejection Reason: {property.rejectionReason}</p>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {property.status === 'DRAFT' && (
                                                <Button size="sm" variant="outline" className="gap-1 h-8 text-xs" onClick={() => handleSubmitForReview(property.id)}>
                                                    <Send className="w-3 h-3" /> Submit
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
