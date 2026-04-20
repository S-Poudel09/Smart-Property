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
    Edit as EditIcon,
    ArrowRight
} from 'lucide-react';

import { motion } from 'framer-motion';
import DashboardShell from '@/components/layout/DashboardShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getProperty, submitProperty } from '@/lib/api/properties';
import { getUser } from '@/lib/auth/getUser';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';
import { formatNPR } from '@/lib/utils/currency';

export default function SellerListingDetailsPage() {
    const { id } = useParams();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();
    const user = getUser();

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data = await getProperty(id as string);
                if (!data) {
                    toast.error('Listing not found');
                    router.push('/dashboard/seller/listings');
                    return;
                }

                // Secure ownership segments: allow originators and admins to pass the registry verification gate
                const isOwner = user && (String(data.sellerId) === String(user.user_id) || String(data.sellerId) === String(user.id));
                const isAdmin = user?.role?.toLowerCase() === 'admin';

                if (user && !isOwner && !isAdmin) {
                    toast.error('Unauthorized access to this listing');
                    router.push('/dashboard/seller');
                    return;
                }

                setProperty(data);
            } catch (e) {
                toast.error('Registry sync error');
                router.push('/dashboard/seller/listings');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, router]);

    const handleSubmit = async () => {
        if (!property) return;
        setIsActionLoading(true);
        try {
            await submitProperty(property.id);
            setProperty(prev => prev ? { ...prev, status: 'submitted' } : null);
            toast.success('Asset committed to review protocol!');
        } catch (e) {
            toast.error('Submission protocol failure');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!property) return;
        if (confirm('Permanently decommission this asset node?')) {
            try {
                setIsActionLoading(true);
                const api = (await import('@/lib/api/http')).default;
                await api.delete(`/properties/${property.id}/`);
                toast.success('Asset purged from registry');
                router.push('/dashboard/seller/listings');
            } catch (e) {
                toast.error('Deletion protocol error');
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    if (isLoading) {
        return (
            <DashboardShell title="Listing Management">
                <div className="flex flex-col h-96 items-center justify-center gap-6">
                    <div className="h-16 w-16 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 italic">Syncing Asset Node details...</p>
                </div>
            </DashboardShell>
        );
    }

    if (!property) return null;

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <div className="max-w-7xl mx-auto py-8 px-6">
                <Link href="/dashboard/seller/listings" className="mb-12 inline-flex items-center gap-4 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest group italic">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Registry Interface Directory
                </Link>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Main Analysis (Left) */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="rounded-[3rem] border border-slate-200/60 bg-white p-12 shadow-2xl shadow-indigo-100/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[3rem] pointer-events-none" />
                            <div className="flex flex-wrap items-center justify-between gap-8 mb-10">
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={property.status} />
                                    {property.isVerified && (
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 italic">
                                            <CheckCircle2 className="h-4 w-4" /> Verified Asset
                                        </span>
                                    )}
                                </div>
                                <div className="text-4xl font-black text-slate-900 font-outfit tracking-tighter italic">
                                    {formatNPR(property.price)}
                                </div>
                            </div>

                            <h1 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter leading-none italic mb-4">{property.title}</h1>
                            <div className="flex items-center gap-3 text-slate-400 mb-10">
                                <MapPin className="h-5 w-5 text-indigo-500" />
                                <span className="text-sm font-bold italic tracking-tight">{property.location}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-8 border-y border-slate-50 py-10 mb-10">
                                <div className="flex flex-col items-center gap-2">
                                    <Bed className="h-6 w-6 text-slate-300" />
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                        {property.category === 'hostel' ? `${property.available_beds || property.availableBeds || 0} Beds` : `${property.bedrooms || 0} Clusters`}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center gap-2 border-x border-slate-50">
                                    <Bath className="h-6 w-6 text-slate-300" />
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{property.bathrooms || 0} Nodes</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Square className="h-6 w-6 text-slate-300" />
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{property.area || 0} Sq Ft</span>
                                </div>
                            </div>

                            {property.category === 'hostel' && (
                                <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 gap-6 p-8 bg-indigo-50/30 rounded-[2rem] border border-indigo-100 border-dashed">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Hostel Gender</p>
                                        <p className="text-xs font-black text-slate-700 uppercase italic">{(property.hostel_gender || property.hostelGender || 'Mixed')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Bathroom Proto</p>
                                        <p className="text-xs font-black text-slate-700 uppercase italic">{(property.bathroom_type || property.bathroomType || 'Shared')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Bed Segment</p>
                                        <p className="text-xs font-black text-slate-700 uppercase italic">{(property.room_type || property.roomType || 'Standard')}</p>
                                    </div>
                                    <div className="col-span-full pt-4 flex flex-wrap gap-6 border-t border-indigo-100/50">
                                        {(property.food_included || property.foodIncluded) && <span className="inline-flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase italic">Food Included</span>}
                                        {(property.has_wifi || property.hasWifi) && <span className="inline-flex items-center gap-2 text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase italic">High-Speed Wifi</span>}
                                        {(property.has_laundry || property.hasLaundry) && <span className="inline-flex items-center gap-2 text-[9px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 uppercase italic">Laundry System</span>}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 italic">Technical Briefing</h3>
                                <p className="text-slate-500 text-lg leading-relaxed italic font-medium max-w-2xl">{property.description}</p>
                            </div>
                        </div>

                        <div className="rounded-[3rem] border border-slate-200/60 bg-white p-12 shadow-sm relative overflow-hidden group">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 italic mb-8 flex items-center gap-4">
                                 Optical Data & Verification Credentials <ArrowRight className="h-4 w-4" />
                            </h3>
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 mb-12">
                                {property.images.map((img, i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 group-hover:scale-[1.02] transition-transform duration-700">
                                        <img src={(img as any).previewUrl || img} alt={`View ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {property.documents?.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 border border-slate-100 rounded-3xl bg-slate-50 group/doc hover:bg-white transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200">
                                                 <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">{doc.name || 'Registry Decree'}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{doc.docType || 'Official Record'}</p>
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-emerald-500 bg-emerald-50 opacity-0 group/doc group-hover/doc:opacity-100 transition-opacity">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    </div>
                                ))}
                                {(!property.documents || property.documents.length === 0) && (
                                    <div className="text-center py-10 p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No credentials uploaded for review node.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tactical Actions (Right) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-3xl shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                            <h3 className="text-base font-black text-slate-900 font-outfit uppercase tracking-tighter italic mb-8">Node Governance</h3>

                            {property.status === 'draft' ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-xs text-amber-800 italic leading-relaxed">
                                        <div className="flex gap-3 font-black uppercase tracking-widest mb-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600" /> Commit Status: DRAFT
                                        </div>
                                        "Asset node is currently offline. Trigger approval protocol to initiate registry verification."
                                    </div>
                                    <Button className="w-full gap-4 h-16 rounded-[1.25rem] bg-indigo-600 shadow-xl shadow-indigo-600/20 text-[11px] font-black uppercase tracking-[0.2em] italic" onClick={handleSubmit} disabled={isActionLoading}>
                                        {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Initiate Approval
                                    </Button>
                                    <Link href={`/dashboard/seller/listings/${property.id}/edit`} className="block">
                                        <Button variant="outline" className="w-full gap-4 h-16 rounded-[1.25rem] border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] italic transition-all group/edit">
                                            <EditIcon className="h-5 w-5 group-hover/edit:rotate-12 transition-transform" /> Reconfigure Specs
                                        </Button>
                                    </Link>
                                </div>
                            ) : property.status === 'submitted' ? (
                                <div className="p-10 bg-indigo-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                                    <div className="flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Review Progress: 42%
                                    </div>
                                    <h3 className="text-lg font-black font-outfit italic leading-tight mb-4">Registry Audit in Progress...</h3>
                                    <p className="text-[11px] text-indigo-300 italic font-medium leading-relaxed mb-10">
                                         "Administrator is current executing a deep-scan verification of your title deeds. Technical spec locking is active."
                                    </p>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 10 }} className="h-full w-2/3 bg-indigo-400" />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-600/20">
                                    <div className="flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                                        <CheckCircle2 className="h-5 w-5" /> Operational Status: LIVE
                                    </div>
                                    <h3 className="text-lg font-black font-outfit italic leading-tight mb-4">Registry Beacon Active</h3>
                                    <p className="text-[11px] text-emerald-100 font-medium italic leading-relaxed">"Your asset cluster is fully synchronized with the global marketplace and visible to all verified buyers."</p>
                                </div>
                            )}

                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <Button variant="ghost" className="w-full gap-4 text-slate-300 hover:text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest italic rounded-2xl h-14 transition-all" onClick={handleDelete} disabled={isActionLoading}>
                                    <Trash2 className="h-4 w-4" /> Decommission Node
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm relative overflow-hidden">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 italic mb-8">Asset History Matrix</h3>
                            <div className="space-y-8">
                                <div className="flex gap-6 relative">
                                    <div className="absolute top-8 left-1 w-0.5 h-12 bg-slate-50" />
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-lg shadow-indigo-600/40" />
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Initialization</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(property.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="h-2 w-2 rounded-full bg-slate-100 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">Registry Approval</p>
                                        <p className="text-[10px] text-slate-200 font-bold uppercase mt-1 italic italic">Pending audit node...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
