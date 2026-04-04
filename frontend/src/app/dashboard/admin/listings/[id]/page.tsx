'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Bed, Bath, Square, Calendar, FileText, CheckCircle2, AlertCircle, Send, Loader2, XCircle, Building2, User, Crown, ShieldCheck, Heart, Share2, Camera, ExternalLink, Trash2, Check, Clock, Info, Eye, ArrowRight
} from 'lucide-react';

import DashboardShell from '@/components/layout/DashboardShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { ListingStatusBadge } from '@/components/property/ListingStatusBadge';
import { getPropertyById, adminApproveProperty, adminRejectProperty } from '@/lib/properties/storage';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';

export default function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const data = getPropertyById(id);
        if (!data) {
            toast.error('Asset not found in the imperial records');
            router.push('/dashboard/admin');
            return;
        }
        setProperty(data);
        setIsLoading(false);
    }, [id, router]);

    const handleApprove = async () => {
        if (!property) return;
        if (!confirm('Bestow your imperial seal and publish this asset to the realm?')) return;

        setIsActionLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1200));
            adminApproveProperty(property.id);
            toast.success('Asset published to the sovereign realm!');
            router.push('/dashboard/admin');
        } catch (e) {
            toast.error('The seal refuses to bind');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!property) return;
        const reason = prompt('State the grounds for rejection:');
        if (reason === null) return;

        setIsActionLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1200));
            adminRejectProperty(property.id, reason || 'Evidence insufficient for imperial standards');
            toast.success('Asset application banished');
            router.push('/dashboard/admin');
        } catch (e) {
            toast.error('Failed to banish the record');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-12 w-12 border-4 border-[#c5a059] border-t-transparent rounded-full shadow-gold-glow"
                />
            </div>
        );
    }

    if (!property) return null;

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-[#fffdf9] pb-32">
                <div className="bg-[#1a1a2e] text-white py-16 mb-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <Container>
                        <Link href="/dashboard/admin" className="flex items-center gap-3 text-[#c5a059] mb-8 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Return to Oversight
                        </Link>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Crown className="h-6 w-6 text-[#c5a059]" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Imperial Asset Review</span>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-serif leading-tight max-w-4xl">{property.title}</h1>
                                <div className="flex items-center gap-2 text-gray-400 mt-4 text-sm font-medium italic">
                                    <MapPin className="h-4 w-4 text-[#c5a059]" /> {property.address}, {property.city}
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-right min-w-[280px]">
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] mb-2">Request Valuation</div>
                                <div className="text-4xl lg:text-5xl font-serif text-white">Rs {property.price.toLocaleString()}</div>
                                {property.type === 'rent' && <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold font-sans">per imperial moon</div>}
                            </div>
                        </div>
                    </Container>
                </div>

                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-12">
                            {/* Visual Evidence */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-[#c5a059]/10 shadow-2xl shadow-[#c5a059]/5"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-serif text-[#1a1a2e]">Visual Evidence</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-4 py-2 rounded-full border border-[#c5a059]/20">
                                        {property.images.length} Captures
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {property.images.map((img, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ scale: 1.05 }}
                                            className={`${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''} aspect-square rounded-[2rem] bg-gray-50 overflow-hidden border border-[#c5a059]/10 shadow-sm relative group`}
                                        >
                                            <img
                                                src={typeof img === 'string' ? img : (img as { previewUrl: string }).previewUrl}
                                                alt={`Evidence ${i}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-[#1a1a2e]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <ExternalLink className="w-6 h-6 text-[#c5a059]" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Specification Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-[#1a1a2e] p-10 rounded-[3rem] text-white border border-[#c5a059]/20 shadow-2xl">
                                    <h3 className="text-2xl font-serif mb-8 text-[#c5a059]">Asset Specifications</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Living Spaces</div>
                                            <div className="text-xl font-serif flex items-center gap-2"><Bed className="h-5 w-5 text-[#c5a059]" /> {property.bedrooms} Beds</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Sanitary</div>
                                            <div className="text-xl font-serif flex items-center gap-2"><Bath className="h-5 w-5 text-[#c5a059]" /> {property.bathrooms} Baths</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Measurement</div>
                                            <div className="text-xl font-serif flex items-center gap-2"><Square className="h-5 w-5 text-[#c5a059]" /> {property.area} Sq Ft</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Status</div>
                                            <div className="mt-2 text-xs font-black uppercase tracking-widest"><ListingStatusBadge status={property.status} /></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-[#c5a059]/10 shadow-xl">
                                    <h3 className="text-2xl font-serif text-[#1a1a2e] mb-2">Artisan Description</h3>
                                    <p className="text-gray-500 text-sm italic mb-6">Exposing the nature of the estate</p>
                                    <p className="text-gray-600 leading-relaxed font-medium line-clamp-6">{property.description}</p>
                                </div>
                            </div>

                            {/* Sovereign Deeds */}
                            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-[#c5a059]/10 shadow-2xl shadow-[#c5a059]/5 border-t-8 border-t-[#c5a059]">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-serif text-[#1a1a2e]">Sovereign Deeds</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Verification Documents</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                                        Mandatory for Approval
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {property.documents?.map((doc, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ x: 5 }}
                                            className="group flex items-center justify-between p-6 border border-[#c5a059]/10 rounded-3xl bg-[#fffdf9] transition-all cursor-pointer shadow-sm hover:border-[#c5a059]/30"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="p-4 bg-[#1a1a2e] rounded-2xl shadow-lg text-[#c5a059] group-hover:scale-110 transition-transform">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-serif text-[#1a1a2e]">{doc.name}</p>
                                                    <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-[0.2em] mt-1">{doc.docType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{(doc.size / 1024).toFixed(1)} KB Archive</span>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full border border-[#c5a059]/10 text-[#c5a059] hover:bg-royal-gold/5 flex items-center justify-center shadow-inner">
                                                    <Eye className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {(!property.documents || property.documents.length === 0) && (
                                        <div className="text-center py-20 bg-[#fffdf9] rounded-[3rem] border-2 border-dashed border-[#c5a059]/20">
                                            <AlertCircle className="h-12 w-12 text-[#c5a059] mx-auto mb-4 opacity-30" />
                                            <h4 className="text-xl font-serif text-gray-400">No Deeds Found</h4>
                                            <p className="text-gray-400/60 text-sm font-medium italic mt-2">The artisan has provided no legal standing for this asset.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decision Sidebar */}
                        <div className="space-y-8">
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-10 border border-[#c5a059]/20 shadow-2xl sticky top-24 border-t-8 border-t-[#c5a059]"
                            >
                                <h3 className="text-2xl font-serif text-[#1a1a2e] mb-8">Imperial Decree</h3>

                                <div className="space-y-8">
                                    <div className="space-y-4 pb-8 border-b border-[#c5a059]/10">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Artisan ID</span>
                                            <span className="text-xs font-mono font-bold text-[#c5a059] bg-[#1a1a2e] px-3 py-1.5 rounded-full shadow-lg">#{property.sellerId.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registry Date</span>
                                            <span className="text-xs font-bold text-[#1a1a2e] italic">{new Date(property.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-[#fffdf9] p-6 rounded-[2rem] border border-[#c5a059]/10 text-center shadow-inner">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] mb-1">State Atmosphere</p>
                                            <p className="text-2xl font-serif text-[#1a1a2e] capitalize">{property.status}</p>
                                        </div>

                                        {property.status === 'submitted' ? (
                                            <div className="space-y-4 pt-4">
                                                <Button
                                                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 rounded-full font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-indigo-900/10 flex items-center justify-center gap-3 transition-all"
                                                    onClick={handleApprove}
                                                    disabled={isActionLoading}
                                                >
                                                    {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                                                    Grant Imperial Seal
                                                </Button>
                                                <Button
                                                    className="w-full h-16 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 transition-all"
                                                    onClick={handleReject}
                                                    disabled={isActionLoading}
                                                >
                                                    {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                                    Banish Application
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6 border border-[#c5a059]/10 bg-white/50 rounded-[2rem] shadow-sm">
                                                <Info className="h-6 w-6 text-[#c5a059] mx-auto mb-3 opacity-40" />
                                                <p className="text-[11px] text-gray-400 font-medium italic leading-relaxed">
                                                    "This asset is already governed by the {property.status.toLowerCase()} decree. No further action is required."
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-[#c5a059]/10 space-y-6">
                                    <h4 className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest">Imperial Protocols</h4>
                                    <Link href={`/dashboard/admin/users/${property.sellerId}`} className="flex items-center justify-between text-xs font-bold text-[#1a1a2e] hover:text-[#c5a059] transition-colors p-4 bg-[#fffdf9] rounded-2xl border border-[#c5a059]/10 shadow-sm group">
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4" /> View Artisan
                                        </div>
                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                    <Link href="/dashboard/admin/guidelines" className="flex items-center justify-between text-xs font-bold text-[#1a1a2e] hover:text-[#c5a059] transition-colors p-4 bg-[#fffdf9] rounded-2xl border border-[#c5a059]/10 shadow-sm group">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4" /> Review Code
                                        </div>
                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
