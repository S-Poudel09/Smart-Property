'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
    Bed, Bath, Maximize2, MapPin, Share2, Heart, 
    Calendar, ArrowLeft, CheckCircle2, ShoppingCart, 
    MessageSquare, Banknote, Play, ShieldCheck, 
    FileText, ChevronRight, Navigation,
    Loader2, CreditCard, Sparkles, RotateCcw,
    Zap, Globe, Shield, Info, Layers, ExternalLink,
    Compass, Award, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';
import PropertyGallery from '@/components/property/PropertyGallery';

const PropertyMap = dynamic(() => import('@/components/property/PropertyMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Syncing Geospatial Node...</div>
});
const MarketInsights = dynamic(() => import('@/components/property/MarketInsights'), { ssr: false });
const PropertyReviews = dynamic(() => import('@/components/property/PropertyReviews'), { ssr: false });
const ThreeDViewer = dynamic(() => import('@/components/property/ThreeDViewer').then(mod => mod.ThreeDViewer), {
    ssr: false
});
const ThreeDInline = dynamic(() => import('@/components/property/ThreeDViewer').then(mod => mod.ThreeDInline), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 flex items-center justify-center text-white/20 italic font-black uppercase tracking-[0.4em]">Initializing Imperial Engine...</div>
});
const ThreeDImageStack = dynamic(() => import('@/components/property/ThreeDImageStack'), { 
    ssr: false,
    loading: () => <div className="fixed inset-0 z-[300] bg-[#020617] flex items-center justify-center text-white/10 font-black uppercase tracking-[1em]">Scanning Registry Cluster...</div>
});

import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { getProperty } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { formatNPR } from '@/lib/utils/currency';
import { getUser } from '@/lib/auth/getUser';
import { createPurchaseRequest, uploadPaymentProof } from '@/lib/api/transactions';
import { toast } from 'react-hot-toast';
import { CheckoutModal } from '@/components/transaction/CheckoutModal';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isThreeDOpen, setIsThreeDOpen] = useState(false);
    const [isImageStackOpen, setIsImageStackOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const load = async () => {
        if (!id || id === 'undefined' || id.includes('[id]')) return;
        try {
            setIsLoading(true);
            const data = await getProperty(id);
            if (data) {
                const user = getUser();
                const isVisible = data.status === 'published' || user?.role === 'admin' || data.sellerId === user?.user_id || user?.role === 'buyer';
                if (isVisible) setProperty(data);
            }
        } catch (err) {
            console.error("Node data unavailable", err);
            toast.error("Failed to load node specs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    useEffect(() => {
        if (isCheckoutOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCheckoutOpen]);

    const handleDataRefresh = () => {
        load();
    };

    if (isLoading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
            <div className="relative">
                <div className="h-24 w-24 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500" />
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.6em] text-indigo-600 italic animate-pulse">Syncing Imperial Registry Node...</p>
        </div>
    );

    if (!property) return (
        <div className="min-h-screen bg-[#fafafa] pt-40 px-8">
            <Container>
                <EmptyState
                    title="Asset Link Neutralized"
                    description="The requested property node is no longer broadcasting in this sector of the registry."
                    action={<Link href="/properties"><button className="h-16 px-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl skew-x-[-2deg] italic">Registry Re-Scan</button></Link>}
                />
            </Container>
        </div>
    );

    const handleInitiatePayment = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        console.log("Acquire button clicked for property:", property.id);
        const user = getUser();
        if (!user) {
            toast.error('Authentication required to acquire assets');
            router.push('/auth/login');
            return;
        }
        
        if (user.role !== 'buyer') {
            toast.error('Buyer privileges required for direct acquisition');
            return;
        }

        try {
            // Create the transaction first to get a valid TransactionID for KPG-2
            const transaction = await createPurchaseRequest(
                property.id, 
                property.sellerId || '', 
                Number(property.price)
            );
            
            console.log("Transaction created:", transaction);
            if (transaction && (transaction.id || transaction.TransactionID)) {
                setActiveTransactionId(transaction.id || transaction.TransactionID);
                setIsCheckoutOpen(true);
            } else {
                toast.error('Failed to initialize acquisition record');
            }
        } catch (error) {
            console.error('Transaction Initialization Error:', error);
            toast.error('System error initializing ledger entry');
        }
    };

    const handlePaymentSuccess = async (referenceId: string) => {
        try {
            setIsActionLoading(true);
            const txResponse = await createPurchaseRequest(property.id, property.sellerId ?? '', Number(property.price));
            const txId = txResponse.TransactionID || txResponse.id;
            const blob = new Blob([`LEDGER RECORD\nAsset: ${property.title}\nRef: ${referenceId}`], { type: 'text/plain' });
            const file = new File([blob], `ledger_${referenceId}.txt`, { type: 'text/plain' });
            await uploadPaymentProof(txId, Number(property.price), file, `Digital Confirmation: ${referenceId}`);
            toast.success('System: Ledger Synchronized');
            router.push(`/dashboard/buyer/transactions/${txId}`);
        } catch (e) {
            toast.error('Ledger synchronization error');
        } finally {
            setIsActionLoading(false);
            setIsCheckoutOpen(false);
        }
    };

    const handleContactSeller = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        console.log("Contact Seller button clicked for property:", property.id);
        const user = getUser();
        if (!user) { toast.error('Auth required'); router.push('/auth/login'); return; }
        try {
            const { getOrCreateRoom } = await import('@/lib/api/chat');
            const room = await getOrCreateRoom(property.sellerId, property.id);
            router.push(`/dashboard/buyer/chats?room=${room.RoomID}`);
        } catch (e) {
            toast.error('Protocol established failure');
        }
    };

    return (
        <div className="bg-[#fafafa] min-h-screen">
            <ThreeDViewer 
                isOpen={isThreeDOpen} 
                onClose={() => setIsThreeDOpen(false)} 
                propertyName={property.title} 
                url={property.virtualTourUrl}
                modelUrl={property.modelUrl}
                propertyType={property.propertyType || (property as any).property_type || ''}
                // @ts-ignore
                image={property.images?.[0]?.image || property.images?.[0] || ''}
                beds={property.bedrooms || (property as any).beds || 1}
            />
            
            {/* Desktop Full-Bleed Hero Section */}
            <header className="bg-white border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[1200px] h-full bg-slate-50/40 skew-x-[-15deg] translate-x-24 pointer-events-none" />
                
                <div className="mx-auto max-w-[1500px] px-8 sm:px-12 pt-32 pb-24 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-20 items-start lg:items-end">
                        <div className="flex-1 space-y-10">
                            <Link href="/properties" className="inline-flex items-center gap-4 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.4em] group italic active:scale-95">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-xl shadow-slate-200/50">
                                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                </div>
                                Registry Directory Node
                            </Link>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <StatusBadge status={property.status} />
                                    {property.isVerified && (
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.35em] text-indigo-600 bg-indigo-50 px-7 py-3 rounded-full border border-indigo-100 shadow-xl shadow-indigo-600/5 italic">
                                            <ShieldCheck className="h-5 w-5" /> Institutional Audit Passed
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 font-outfit tracking-tighter leading-[0.82] italic drop-shadow-sm">{property.title}</h1>
                                
                                <div className="flex items-center gap-8 p-3 pr-10 bg-white shadow-2xl shadow-slate-200/40 rounded-3xl w-fit border border-slate-100/50">
                                    <div className="h-20 w-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-indigo-400 shadow-2xl relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <MapPin className="h-8 w-8 relative z-10" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic">Discovery Origin</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tight italic">{property.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Price Card - Professional Desktop Style */}
                        <div className="lg:w-[450px]">
                            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-3xl shadow-slate-200/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600" />
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3 px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                                        Real-Time Market Valuation
                                    </div>
                                    <Zap className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                                </div>
                                <div className="text-6xl lg:text-7xl font-black text-slate-900 font-outfit tracking-tighter italic">{formatNPR(property.price)}</div>
                                <div className="mt-12 flex gap-4">
                                    <button className="flex-1 h-16 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-900 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest italic group/share">
                                        <Share2 className="h-5 w-5 group-hover/share:rotate-12 transition-transform" /> Forward Index
                                    </button>
                                    <button className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 hover:border-red-500 transition-all shadow-sm">
                                        <Heart className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Cinematic High-Res Gallery - Elevated to Hero Position */}
            <div className="mx-auto max-w-[1500px] px-8 sm:px-12 mb-16">
                <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden group">
                    <div className="aspect-[21/9] rounded-[2rem] overflow-hidden relative shadow-inner">
                        <PropertyGallery images={property.images} />
                        
                        <div className="absolute top-8 left-8 h-10 px-5 bg-white/90 backdrop-blur-xl text-slate-900 rounded-xl flex items-center gap-3 border border-indigo-100 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Active Optical Node</span>
                        </div>

                        {property.virtualTourUrl && (
                            <button 
                                onClick={() => setIsThreeDOpen(true)}
                                className="absolute bottom-10 right-10 h-20 pl-8 pr-10 bg-slate-900/95 backdrop-blur-3xl text-white font-black uppercase tracking-[0.5em] text-[10px] rounded-3xl shadow-2xl border border-white/10 flex items-center gap-6 hover:bg-indigo-600 hover:scale-105 transition-all duration-700 z-20 group/sim"
                            >
                                <div className="h-12 w-12 bg-indigo-500 rounded-2xl flex items-center justify-center transition-all group-hover/sim:rotate-[360deg] duration-700">
                                    <Play className="h-5 w-5 text-white fill-current ml-0.5" />
                                </div>
                                Launch VR Simulation
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid - Wide Two Column Layout */}
            <main className="pb-32 relative z-20">
                <div className="mx-auto max-w-[1500px] px-8 sm:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        {/* Primary Content Stream (Left - 66.6%) */}
                        <div className="lg:col-span-8 space-y-16">
                            
                            {/* Summary & Tags */}
                            <div className="flex flex-wrap gap-4 mb-4">
                               <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3 shadow-sm">
                                   <Zap className="h-4 w-4 text-indigo-500" /> Instant Inquiry Active
                               </div>
                               <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3 shadow-sm">
                                   <Globe className="h-4 w-4 text-indigo-500" /> International Ready
                               </div>
                            </div>

                            {/* Technical Specification Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { icon: Bed, value: property.bedrooms, label: 'Asset Clusters', sub: 'Units Detected' },
                                    { icon: Bath, value: property.bathrooms, label: 'Sanitation Nodes', sub: 'Active Systems' },
                                    { icon: Maximize2, value: `${property.area} sqft`, label: 'Volumetric Mass', sub: 'Registry Capacity' },
                                    { icon: Compass, value: 'Prime', label: 'Sector Orient', sub: 'Node Placement' }
                                ].map((spec) => (
                                    <div key={spec.label} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
                                        <div className="h-14 w-14 bg-slate-50 text-slate-400 flex items-center justify-center rounded-2xl mb-6 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                            <spec.icon className="h-7 w-7" />
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 font-outfit tracking-tighter italic">{spec.value}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{spec.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Professional Description Card */}
                            <div className="bg-white p-12 lg:p-16 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-50/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                                <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-6 font-outfit tracking-tighter italic uppercase underline decoration-indigo-500/20 underline-offset-8">
                                    <FileText className="h-8 w-8 text-indigo-600" />
                                    Node Analysis & Summary
                                </h2>
                                <p className="text-slate-600 text-lg leading-[1.8] font-medium italic whitespace-pre-wrap max-w-4xl">
                                    {property.description || "System protocol notice: Detailed architectural telemetry is pending synchronization for this registry node."}
                                </p>
                            </div>

                            {/* Additional Features: Market Insights & ROI */}
                            <MarketInsights 
                                propertyId={property.id} 
                                currentPrice={Number(property.price)} 
                                area={property.area} 
                                location={property.location} 
                            />

                            {/* Additional Features: User Reviews */}
                            <PropertyReviews 
                                propertyId={property.id} 
                                reviews={property.reviews || []} 
                                onReviewAdded={handleDataRefresh} 
                            />

                            {/* Hostel Specific Provisions */}
                            {property.category === 'hostel' && (
                                <div className="bg-indigo-600 p-12 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:scale-150 duration-700" />
                                    <h3 className="text-2xl font-black font-outfit uppercase italic mb-10 flex items-center gap-6">
                                        <Layers className="h-8 w-8 text-indigo-300" />
                                        Communal Provisioning Spec
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3">Gender Protocol</p>
                                            <p className="text-xl font-black italic">{(property as any).gender_policy?.toUpperCase() || 'UNIVERSAL'}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3">Bed Infrastructure</p>
                                            <p className="text-xl font-black italic">{(property as any).bed_count || 1} UNIT ARCHITECTURE</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3">Sanitation Config</p>
                                            <p className="text-xl font-black italic">{(property as any).bathroom_type?.toUpperCase() || 'ENSUITE'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Universal 3D Visual Hub */}
                            <div className="bg-slate-950 p-16 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12 relative z-10">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-3 italic">Interactive Environment Sync</div>
                                        <h2 className="text-4xl font-black text-white font-outfit tracking-tighter italic uppercase underline decoration-white/5 underline-offset-8">Digital Twin Synthesis</h2>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setIsThreeDOpen(true)}
                                                className="h-10 px-6 rounded-xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all italic"
                                            >
                                                <Maximize2 className="h-4 w-4" /> Full Spectrum Scan
                                            </button>
                                            <button 
                                                onClick={() => setIsImageStackOpen(true)}
                                                className="h-10 px-6 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all italic"
                                            >
                                                <Layers className="h-4 w-4" /> 3D Imagery Cluster
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Stable Sync</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Procedural Mesh Registry v4.2</span>
                                    </div>
                                </div>

                                <div className="rounded-[2.5rem] overflow-hidden border border-white/5 h-[600px] shadow-3xl bg-black/50 relative group">
                                    <ThreeDInline 
                                        url={property.virtualTourUrl} 
                                        modelUrl={property.modelUrl}
                                        propertyName={property.title} 
                                        propertyType={property.propertyType || (property as any).property_type || ''}
                                        image={typeof property.images?.[0] === 'string' ? property.images?.[0] : (property.images?.[0] as any)?.image || ''}
                                        beds={property.bedrooms || (property as any).beds || 1}
                                    />
                                    <div className="absolute inset-0 pointer-events-none border-4 border-white/5 rounded-[2.5rem] group-hover:border-indigo-600/20 transition-all duration-700" />
                                </div>
                            </div>

                            {/* Professional Mapping Registry Hub */}
                            {(property.lat && property.lng) ? (
                                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-12 relative z-10">
                                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-6 font-outfit tracking-tighter italic leading-none uppercase">
                                            <MapPin className="h-8 w-8 text-indigo-600" />
                                            Registry Provenance
                                        </h2>
                                        <Link 
                                            href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                                            target="_blank"
                                            className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-4 italic group/nav"
                                        >
                                            External Navigation <ExternalLink className="h-5 w-5 group-hover/nav:-translate-y-1 transition-transform" />
                                        </Link>
                                    </div>
                                    <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 h-[500px] shadow-inner relative z-0">
                                        <PropertyMap 
                                            center={[property.lat, property.lng]} 
                                            zoom={16}
                                            title={property.title}
                                            boundary={property.boundaryCoordinates}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* HIGH-STAKES STICKY SIDEBAR (Right - 33.3%) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit space-y-10">
                            
                            {/* Primary Action Card */}
                            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                                <div className="space-y-4">
                                   <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-widest italic">
                                       <Sparkles className="h-3.5 w-3.5" /> Executive Priority
                                   </div>
                                   <h3 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter italic leading-tight">
                                        Initialize Governance & <br />Asset Exchange.
                                   </h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <button
                                        type="button"
                                        className="w-full h-24 text-[12px] font-black uppercase tracking-[0.4em] rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-30 group/acquire"
                                        onClick={(e) => handleInitiatePayment(e)}
                                        disabled={isActionLoading}
                                    >
                                        <span className="flex items-center gap-4">
                                            <CreditCard className="h-6 w-6 group-hover/acquire:rotate-12 transition-transform" /> 
                                            {isActionLoading ? 'SYNCING LEDGER...' : 'ACQUIRE ASSET CLUSTER'}
                                        </span>
                                        {!isActionLoading && <span className="text-[9px] opacity-40 font-black tracking-[0.3em] italic">Protocol Synchronized</span>}
                                    </button>

                                     {/* CheckoutModal was here, moved to root */}

                                    <button 
                                        type="button"
                                        className="w-full h-20 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-4 shadow-sm active:scale-95 italic group/comms" 
                                        onClick={(e) => handleContactSeller(e)}
                                    >
                                        <MessageSquare className="h-6 w-6 group-hover/comms:scale-125 transition-all" /> Established Imperial Comms
                                    </button>

                                    {getUser()?.role === 'buyer' && (
                                        <button
                                            onClick={() => router.push(`/dashboard/buyer/loans/apply/${property.id}`)}
                                            className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between px-8 text-[10px] font-black text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group/loan active:scale-95"
                                        >
                                            <span className="flex items-center gap-4 italic font-black uppercase tracking-[0.1em]"><Banknote className="h-5 w-5" /> Liquidity Analysis Scan</span>
                                            <ChevronRight className="h-5 w-5 group-hover/loan:translate-x-2 transition-transform duration-500" />
                                        </button>
                                    )}
                                </div>

                                <div className="pt-10 border-t border-slate-100 space-y-8">
                                    <div className="flex justify-between items-center group/hash">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-3">
                                            <Info className="h-4 w-4" /> Node Checksum
                                        </span>
                                        <span className="text-[11px] font-mono font-black text-indigo-500 bg-indigo-50 px-4 py-2 rounded-xl">#{property.id.slice(0, 8).toUpperCase()}</span>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
                                        <div className="h-12 w-12 bg-white shadow-lg rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-slate-50">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 italic mb-2">Safeguard Protocol Sync</p>
                                        <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed">"Legal and structural audits are active for this node."</p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Support Card */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700" />
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="h-12 w-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <Globe className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <h4 className="text-xl font-black font-outfit uppercase tracking-tighter italic">Registry Insights</h4>
                                </div>
                                <p className="text-slate-400 text-[11px] font-bold italic leading-relaxed opacity-70 mb-8">Establish a secure node presence across the entire imperial network.</p>
                                <button className="w-full h-14 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl italic active:scale-95">Establish Node Lineage</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {isCheckoutOpen && activeTransactionId && (
                <CheckoutModal 
                    isOpen={isCheckoutOpen} 
                    onClose={() => setIsCheckoutOpen(false)} 
                    propertyTitle={property.title} 
                    propertyId={activeTransactionId}
                    amount={Number(property.price)} 
                    onSuccess={handlePaymentSuccess}
                />
            )}

            <ThreeDViewer
                isOpen={isThreeDOpen}
                onClose={() => setIsThreeDOpen(false)}
                propertyName={property.title}
                url={property.virtualTourUrl}
                propertyType={property.propertyType || (property as any).property_type || ''}
                image={typeof property.images?.[0] === 'string' ? property.images?.[0] : (property.images?.[0] as any)?.image || ''}
                beds={property.bedrooms || (property as any).beds || 1}
                modelUrl={property.modelUrl}
            />

            <ThreeDImageStack 
                isOpen={isImageStackOpen}
                onClose={() => setIsImageStackOpen(false)}
                propertyName={property.title}
                images={property.images?.map((img: any) => typeof img === 'string' ? img : img.image) || []}
            />
        </div>
    );
}
