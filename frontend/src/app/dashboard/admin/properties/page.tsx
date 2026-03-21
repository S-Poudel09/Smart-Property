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
import { Crown, Check, X, Eye, FileText, Image as ImageIcon, ExternalLink, ShieldCheck, AlertCircle, History, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const loadProperties = async () => {
        try {
            const data = await getProperties();
            setProperties(data.filter(p => p.status !== 'DRAFT'));
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
            toast.success("Property approved and published to the realm");
            loadProperties();
            setSelectedProperty(null);
        } catch (e) {
            toast.error("Failed to approve property");
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt("Enter sovereign rejection reason:");
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

    if (loading) return <div className="p-12 flex justify-center bg-[#fffdf9] min-h-screen"><Loader size="lg" /></div>;

    const pendingCount = properties.filter(p => p.status === 'SUBMITTED').length;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-5 w-5 text-[#c5a059]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Asset Verification</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-serif text-[#1a1a2e]">Property Queue</h1>
                        <p className="text-gray-400 mt-2 font-medium italic">Vetting sovereign land and estate listings</p>
                    </div>
                    
                    <div className={`px-6 py-3 rounded-full flex items-center gap-3 border shadow-sm backdrop-blur-md ${
                        pendingCount > 0 ? 'bg-amber-50/50 border-amber-100 text-amber-700' : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                    }`}>
                        <AlertCircle className={`h-5 w-5 ${pendingCount > 0 ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{pendingCount} Pending Reviews</span>
                    </div>
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Properties List */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`${selectedProperty ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}
                    >
                        {properties.length === 0 ? (
                            <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-20 border border-[#c5a059]/10 shadow-xl text-center">
                                <EmptyState title="Quiet in the Realm" description="All submitted properties have been processed by the archive." />
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-[#c5a059]/5 border border-[#c5a059]/10 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[#c5a059]/10">
                                            <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Sovereign Asset</th>
                                            <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Custodianship</th>
                                            <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Valuation</th>
                                            <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">State</th>
                                            <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] text-right">Audit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c5a059]/5">
                                        {properties.map((property, i) => (
                                            <motion.tr 
                                                key={property.id} 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => setSelectedProperty(property)}
                                                className={`cursor-pointer transition-all group ${selectedProperty?.id === property.id ? 'bg-[#1a1a2e] text-white' : 'hover:bg-[#c5a059]/5'}`}
                                            >
                                                <td className="p-8">
                                                    <div className="font-serif text-lg">{property.title}</div>
                                                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedProperty?.id === property.id ? 'text-gray-400' : 'text-gray-400 group-hover:text-[#c5a059]'}`}>{property.location}</div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedProperty?.id === property.id ? 'bg-[#c5a059] text-[#1a1a2e]' : 'bg-[#1a1a2e] text-[#c5a059]'}`}>
                                                            {property.sellerId?.slice(0, 2).toUpperCase() || 'SA'}
                                                        </div>
                                                        <span className="text-xs font-mono opacity-60">ID: {property.sellerId?.slice(0, 8)}...</span>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="text-lg font-serif">Rs {Number(property.price).toLocaleString()}</div>
                                                </td>
                                                <td className="p-8">
                                                    <StatusBadge status={property.status} className="h-6 px-3 shadow-sm" />
                                                </td>
                                                <td className="p-8 text-right">
                                                    <button className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${selectedProperty?.id === property.id ? 'bg-[#c5a059] text-[#1a1a2e]' : 'bg-white shadow group-hover:scale-110'}`}>
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Property Detail Sidebar */}
                    <AnimatePresence>
                        {selectedProperty && (
                            <motion.div 
                                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                                className="lg:col-span-1"
                            >
                                <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-[#c5a059]/20 p-10 shadow-2xl shadow-[#c5a059]/10 sticky top-12 border-t-8 border-t-[#c5a059]">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h2 className="text-2xl font-serif text-[#1a1a2e]">Judiciary Review</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] mt-1">Sovereign Validation</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedProperty(null)} 
                                            className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-inner"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#fffdf9] p-4 rounded-3xl border border-[#c5a059]/10">
                                                <div className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest mb-1">Declared Value</div>
                                                <div className="text-xl font-serif text-[#1a1a2e]">Rs {Number(selectedProperty.price).toLocaleString()}</div>
                                            </div>
                                            <div className="bg-[#fffdf9] p-4 rounded-3xl border border-[#c5a059]/10">
                                                <div className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest mb-1">Status</div>
                                                <div className="mt-1"><StatusBadge status={selectedProperty.status} /></div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> Visual Evidence ({selectedProperty.images?.length || 0})
                                            </h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {selectedProperty.images?.slice(0, 6).map((img, i) => {
                                                    const imageUrl = typeof img === 'string' ? img : img.previewUrl;
                                                    return (
                                                        <motion.div 
                                                            key={i} 
                                                            whileHover={{ scale: 1.05 }}
                                                            className="aspect-square bg-[#fffdf9] rounded-2xl overflow-hidden relative border border-[#c5a059]/10 group shadow-sm"
                                                        >
                                                            <img src={imageUrl} alt={`Asset ${i}`} className="object-cover w-full h-full" />
                                                            <a href={imageUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-[#1a1a2e]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                                <ExternalLink className="w-4 h-4 text-[#c5a059]" />
                                                            </a>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <FileText className="w-3 h-3" /> Sovereign Deeds ({selectedProperty.documents?.length || 0})
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedProperty.documents?.map((doc: any, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <div className="flex items-center justify-between p-4 bg-[#fffdf9] border border-[#c5a059]/10 rounded-[2rem] text-sm group shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-[#1a1a2e] rounded-2xl flex items-center justify-center text-[#c5a059] shadow-inner">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[#1a1a2e] font-bold text-xs truncate max-w-[120px]">Deed.pdfl</div>
                                                                    <div className="text-[9px] text-[#c5a059] font-black uppercase tracking-tighter">Legal Seal REQUIRED</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {!doc.is_verified ? (
                                                                    <Button 
                                                                        size="sm" 
                                                                        className="h-9 px-4 rounded-full bg-[#1a1a2e] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1a2e] border border-[#c5a059]/20 shadow-lg text-[10px] font-black uppercase tracking-widest"
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                const lib = await import('@/lib/api/properties');
                                                                                const res = await lib.verifyDocument(selectedProperty.id, doc.id);
                                                                                toast.success("Golden Seal Applied Successfully");
                                                                                const updatedDocs = [...(selectedProperty.documents as any)];
                                                                                updatedDocs[i] = { ...updatedDocs[i], is_verified: true, ocr_data: res.ocr_data };
                                                                                setSelectedProperty({ ...selectedProperty, documents: updatedDocs });
                                                                            } catch (err) {
                                                                                toast.error("Scanning failed in the imperial vaults");
                                                                            }
                                                                        }}
                                                                    >
                                                                        Verify
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                                                        <Crown className="w-3 h-3" /> CERTIFIED
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {doc.is_verified && doc.ocr_data && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="ml-6 p-5 bg-[#1a1a2e] rounded-3xl border border-[#c5a059]/30 text-[11px] text-[#c5a059] shadow-2xl"
                                                            >
                                                                <div className="font-serif text-lg mb-3 border-b border-[#c5a059]/20 pb-2 flex justify-between items-end">
                                                                    <span>Seal Analysis</span>
                                                                    <span className="text-[10px] font-sans font-black text-emerald-400">Match: {doc.ocr_data.confidence_score * 100}%</span>
                                                                </div>
                                                                <div className="space-y-2 opacity-80 font-medium italic">
                                                                    <div className="flex justify-between"><span>Deed Number:</span> <span>{doc.ocr_data.document_number}</span></div>
                                                                    <div className="flex justify-between"><span>Owner Name:</span> <span>{doc.ocr_data.extracted_name}</span></div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedProperty.status === 'SUBMITTED' && (
                                            <div className="pt-10 flex gap-4">
                                                <Button 
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl group" 
                                                    onClick={() => handleApprove(selectedProperty.id)}
                                                >
                                                    <span className="group-hover:scale-110 transition-transform flex items-center gap-2">Publish to Realm <Crown className="w-4 h-4" /></span>
                                                </Button>
                                                <Button 
                                                    className="flex-1 bg-white text-red-600 border border-red-100 hover:bg-red-50 h-14 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg" 
                                                    variant="outline" 
                                                    onClick={() => handleReject(selectedProperty.id)}
                                                >
                                                    Banish Listing
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
