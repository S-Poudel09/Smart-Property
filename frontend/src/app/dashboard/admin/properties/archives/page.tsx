'use client';

import { useEffect, useState } from 'react';
import { getProperties } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import Container from '@/components/layout/Container';
import { toast } from 'react-hot-toast';
import { History, Eye, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminPropertiesArchivePage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadProperties = async () => {
        try {
            const data = await getProperties();
            // Show only processed properties
            setProperties(data.filter(p => ['published', 'rejected', 'sold', 'rented'].includes(p.status.toLowerCase())));
        } catch (e) {
            toast.error("Failed to load property archives");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const filtered = properties.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                <div className="mb-8">
                    <Link href="/dashboard/admin/properties" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-6">
                        <ArrowLeft className="h-4 w-4" /> Back to Review Queue
                    </Link>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Property History</h1>
                            <p className="text-gray-500 mt-1">Review all approved and rejected listings</p>
                        </div>
                        
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by title or location..." 
                                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                        <EmptyState title="No records found" description="The archive is currently empty or no results match your search." />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-border">
                                        <th className="p-4 font-semibold text-gray-700">Property</th>
                                        <th className="p-4 font-semibold text-gray-700">Owner</th>
                                        <th className="p-4 font-semibold text-gray-700">Price</th>
                                        <th className="p-4 font-semibold text-gray-700">Final Status</th>
                                        <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((property) => (
                                        <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900">{property.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{property.location}</div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                ID: {String(property.sellerId || '').slice(0, 8)}...
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">
                                                Rs {Number(property.price).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={property.status} />
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link href={`/properties/${property.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}

