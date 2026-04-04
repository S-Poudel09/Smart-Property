'use client';

import { useEffect, useState } from 'react';
import { getProperties, approveProperty, rejectProperty } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import Container from '@/components/layout/Container';
import { toast } from 'react-hot-toast';
import { Check, X, Eye, FileText, Image as ImageIcon, ExternalLink, AlertCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const loadProperties = async () => {
        try {
            const data = await getProperties();
            setProperties(data.filter(p => p.status?.toLowerCase() === 'submitted'));
        } catch (e) {
            toast.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await approveProperty(id);
            toast.success("Property approved and published");
            loadProperties();
            setSelectedProperty(null);
        } catch (e) {
            toast.error("Failed to approve property");
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            await rejectProperty(id, reason);
            toast.success("Property rejected");
            loadProperties();
            setSelectedProperty(null);
        } catch (e) {
            toast.error("Failed to reject property");
        }
    };

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen"><Loader size="lg" /></div>;

    const pendingCount = properties.length;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Property Review Queue</h1>
                        <p className="text-gray-500 mt-1">Review and approve new property listings</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Link href="/dashboard/admin/properties/archives">
                            <Button variant="outline" className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                View History
                            </Button>
                        </Link>
                        <div className={`px-4 py-2 rounded-lg flex items-center gap-2 border text-sm font-medium ${
                            pendingCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        }`}>
                            <AlertCircle className="h-4 w-4" />
                            <span>{pendingCount} Pending</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Properties List */}
                    <div className={`${selectedProperty ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
                        {properties.length === 0 ? (
                            <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                                <EmptyState title="Queue is empty" description="All submitted properties have been processed." />
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-border">
                                            <th className="p-4 font-semibold text-gray-700">Property</th>
                                            <th className="p-4 font-semibold text-gray-700">Owner</th>
                                            <th className="p-4 font-semibold text-gray-700">Price</th>
                                            <th className="p-4 font-semibold text-gray-700">Status</th>
                                            <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {properties.map((property) => (
                                            <tr 
                                                key={property.id} 
                                                onClick={() => setSelectedProperty(property)}
                                                className={`cursor-pointer transition-colors ${selectedProperty?.id === property.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                            >
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
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Property Detail Sidebar */}
                    <AnimatePresence>
                        {selectedProperty && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="lg:col-span-1"
                            >
                                <div className="bg-white rounded-xl border border-border p-6 shadow-lg sticky top-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Review Property</h2>
                                            <p className="text-xs text-gray-500 mt-1">Verify details and documents</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedProperty(null)} 
                                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-border">
                                                <div className="text-gray-500 text-[10px] font-semibold uppercase">Price</div>
                                                <div className="text-sm font-bold text-gray-900">Rs {Number(selectedProperty.price).toLocaleString()}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-border">
                                                <div className="text-gray-500 text-[10px] font-semibold uppercase">Status</div>
                                                <div className="mt-0.5"><StatusBadge status={selectedProperty.status} /></div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" /> Gallery ({selectedProperty.images?.length || 0})
                                            </h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {selectedProperty.images?.slice(0, 6).map((img: any, i: number) => {
                                                    const imageUrl = typeof img === 'string' ? img : img.previewUrl;
                                                    return (
                                                        <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative border border-border group">
                                                            <img src={imageUrl} alt={`Img ${i}`} className="object-cover w-full h-full" />
                                                            <a href={imageUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <ExternalLink className="w-4 h-4 text-white" />
                                                            </a>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> Documents ({selectedProperty.documents?.length || 0})
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedProperty.documents?.map((doc: any, i: number) => (
                                                    <div key={i} className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-lg text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-primary" />
                                                                <span className="text-xs font-medium text-gray-700">Property Deed</span>
                                                            </div>
                                                            {!doc.is_verified ? (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    className="h-7 px-3 text-[10px]"
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        try {
                                                                            const lib = await import('@/lib/api/properties');
                                                                            const res = await lib.verifyDocument(selectedProperty.id, doc.id);
                                                                            toast.success("Document verified");
                                                                            const updatedDocs = [...(selectedProperty.documents as any)];
                                                                            updatedDocs[i] = { ...updatedDocs[i], is_verified: true, ocr_data: res.ocr_data };
                                                                            setSelectedProperty({ ...selectedProperty, documents: updatedDocs });
                                                                        } catch (err) {
                                                                            toast.error("Verification failed");
                                                                        }
                                                                    }}
                                                                >
                                                                    Verify
                                                                </Button>
                                                            ) : (
                                                                <div className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> VERIFIED
                                                                </div>
                                                            )}
                                                        </div>
                                                        {doc.is_verified && doc.ocr_data && (
                                                            <div className="p-3 bg-gray-900 rounded-lg text-[11px] text-gray-300 ml-2">
                                                                <div className="font-bold text-white mb-2 flex justify-between border-b border-gray-700 pb-1">
                                                                    <span>OCR Result</span>
                                                                    <span className="text-indigo-400">{Math.round(doc.ocr_data.confidence_score * 100)}% match</span>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between"><span>Deed #:</span> <span>{doc.ocr_data.document_number}</span></div>
                                                                    <div className="flex justify-between"><span>Owner:</span> <span>{doc.ocr_data.extracted_name}</span></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedProperty.status?.toLowerCase() === 'submitted' && (
                                            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                                                <Button 
                                                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2" 
                                                    onClick={() => handleApprove(selectedProperty.id)}
                                                >
                                                    <Check className="w-5 h-5" /> Approve & Publish
                                                </Button>
                                                <Button 
                                                    className="w-full h-12 rounded-xl" 
                                                    variant="outline" 
                                                    onClick={() => handleReject(selectedProperty.id)}
                                                >
                                                    <X className="w-5 h-5" /> Reject Listing
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Container>
        </div>
    );
}

