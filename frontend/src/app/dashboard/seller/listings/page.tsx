'use client';

import { useEffect, useState } from 'react';
import { getProperties, submitProperty } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { getUser } from '@/lib/auth/getUser';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2, Search, Filter, Send, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SellerListingsPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const loadProperties = async () => {
        try {
            const user = getUser();
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

    const filtered = properties.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen items-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search your listings..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-white border border-border rounded-lg p-1">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                    <Link href="/dashboard/seller/add-listing" className="flex-1 md:flex-initial">
                        <Button className="w-full h-10 rounded-lg flex items-center gap-2 font-bold px-6">
                            <Plus className="h-4 w-4" /> Add Property
                        </Button>
                    </Link>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                    <EmptyState 
                        title="No listings found" 
                        description={searchTerm ? "No properties match your search criteria." : "You haven't added any properties yet. Start listing today!"} 
                    />
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-border">
                                    <th className="p-4 font-semibold text-gray-700">Property Details</th>
                                    <th className="p-4 font-semibold text-gray-700">Price (Rs)</th>
                                    <th className="p-4 font-semibold text-gray-700">Review Status</th>
                                    <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((property) => (
                                        <motion.tr 
                                            key={property.id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href=`/properties/${property.id}`}>
                                                    {property.title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <span className="h-1 w-1 bg-gray-300 rounded-full"></span> {property.location}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">
                                                {Number(property.price).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <StatusBadge status={property.status} />
                                                    {property.status === 'rejected' && property.rejectionReason && (
                                                        <p className="text-[10px] text-red-500 font-bold italic bg-red-50 p-1 px-2 rounded w-fit capitalize">
                                                            Reason: {property.rejectionReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    {property.status === 'draft' && (
                                                        <button 
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all border border-primary/20"
                                                            onClick={() => handleSubmitForReview(property.id)}
                                                        >
                                                            <Send className="w-3.5 h-3.5" /> Submit
                                                        </button>
                                                    )}
                                                    <button className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-all flex items-center justify-center">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-all flex items-center justify-center">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((property) => (
                            <motion.div 
                                key={property.id} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <StatusBadge status={property.status} />
                                    <button className="text-gray-400 hover:text-primary p-1">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-1 line-clamp-1">{property.title}</h3>
                                <p className="text-xs text-gray-500 mb-4">{property.location}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <p className="font-bold text-primary">Rs {Number(property.price).toLocaleString()}</p>
                                    <div className="flex gap-1">
                                        {property.status === 'draft' && (
                                            <button 
                                                className="p-1 text-primary hover:bg-primary/10 rounded transition-all"
                                                onClick={() => handleSubmitForReview(property.id)}
                                                title="Submit for Review"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-all">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

