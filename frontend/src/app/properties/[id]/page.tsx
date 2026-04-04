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
const ThreeDViewer = dynamic(() => import('@/components/property/ThreeDViewer').then(mod => mod.ThreeDViewer), {
    ssr: false
});
const ThreeDInline = dynamic(() => import('@/components/property/ThreeDViewer').then(mod => mod.ThreeDInline), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.4em] text-white/20 italic">Initializing Imperial Engine...</div>
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
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id || id === 'undefined' || id.includes('[id]')) return;
            try {
                setIsLoading(true);
                const data = await getProperty(id);
                if (data) {
                    const user = getUser();
                    const isVisible = data.status === 'published' || user?.role === 'admin' || data.sellerId === user?.user_id;
                    if (isVisible) setProperty(data);
                }
            } catch (err) {
                console.error("Node data unavailable", err);
                toast.error("Failed to load node specs");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

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

    const handleInitiatePayment = () => {
        const user = getUser();
        if (!user) { toast.error('Auth required'); router.push('/auth/login'); return; }
        if (user.role !== 'buyer') { toast.error('Buyer privilege required'); return; }
        setIsCheckoutOpen(true);
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

    const handleContactSeller = async () => {
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

            {/* Main Content Grid - Wide Two Column Layout */}
            <main className="py-24 relative z-20">
                <div className="mx-auto max-w-[1500px] px-8 sm:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        
                        {/* Primary Content Stream (Left - 66.6%) */}
                        <div className="lg:col-span-8 space-y-24">
                            
                            {/* Cinematic High-Res Gallery */}
                            <div className="bg-white p-6 rounded-[5rem] border border-slate-100 shadow-3xl shadow-slate-200/30 overflow-hidden group">
                                <div className="aspect-[21/10] rounded-[3.5rem] overflow-hidden relative shadow-inner">
                                    <PropertyGallery images={property.images} />
                                    
                                    <div className="absolute top-10 left-10 h-12 px-6 bg-white/90 backdrop-blur-xl text-slate-900 rounded-2xl flex items-center gap-3 border border-indigo-100 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-700">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Optical Sensor: Active</span>
                                    </div>

                                    {property.virtualTourUrl && (
                                        <button 
                                            onClick={() => setIsThreeDOpen(true)}
                                            className="absolute bottom-12 right-12 h-24 pl-10 pr-12 bg-slate-900/95 backdrop-blur-3xl text-white font-black uppercase tracking-[0.5em] text-[12px] rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] border border-white/10 flex items-center gap-8 hover:bg-indigo-600 hover:scale-105 transition-all duration-700 z-20 group/sim"
                                        >
                                            <div className="h-16 w-16 bg-indigo-500 rounded-3xl flex items-center justify-center transition-all group-hover/sim:rotate-[360deg] duration-700 shadow-2xl shadow-indigo-600/40">
                                                <Play className="h-6 w-6 text-white fill-current ml-1" />
                                            </div>
                                            Execute Simulation
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Technical Specification Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                {[
                                    { icon: Bed, value: property.bedrooms, label: 'Asset Clusters', sub: 'Units Detected' },
                                    { icon: Bath, value: property.bathrooms, label: 'Sanitation Nodes', sub: 'Active Systems' },
                                    { icon: Maximize2, value: `${property.area} sqft`, label: 'Volumetric Mass', sub: 'Registry Capacity' },
                                    { icon: Compass, value: 'Prime', label: 'Sector Orient', sub: 'Node Placement' }
                                ].map((spec) => (
                                    <div key={spec.label} className="bg-white p-12 pb-14 rounded-[3.5rem] border border-slate-100 shadow-sm text-center group hover:bg-indigo-600 transition-all duration-500 hover:translate-y-[-10px] hover:shadow-3xl hover:shadow-indigo-600/20">
                                        <div className="mx-auto h-24 w-24 bg-slate-50 text-slate-400 flex items-center justify-center rounded-[2rem] mb-8 shadow-inner group-hover:bg-white/10 group-hover:text-white transition-all border border-slate-100">
                                            <spec.icon className="h-10 w-10" />
                                        </div>
                                        <div className="text-4xl font-black text-slate-900 font-outfit tracking-tighter italic group-hover:text-white transition-colors">{spec.value}</div>
                                        <div className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-4 italic group-hover:text-indigo-200">{spec.label}</div>
                                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-2 group-hover:text-indigo-200/50">{spec.sub}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Professional Description Card */}
                            <div className="bg-white p-20 lg:p-32 rounded-[5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px] -mr-32 -mt-32" />
                                <h2 className="text-5xl font-black text-slate-900 mb-16 flex items-center gap-8 font-outfit tracking-tighter italic">
                                    <div className="h-20 w-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-3xl">
                                        <FileText className="h-10 w-10" />
                                    </div>
                                    Executive Node Analysis
                                </h2>
                                <p className="text-slate-500 text-2xl leading-[1.85] font-medium italic whitespace-pre-wrap max-w-5xl">
                                    {property.description || "System protocol notice: Detailed architectural telemetry is pending synchronization for this registry node."}
                                </p>
                            </div>

                            {/* Ultra-Wide 3D Visual Hub - Fixed for Desktop Layout */}
                            <div className="bg-slate-950 p-24 rounded-[6rem] border border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-[200px] -mr-[500px] -mt-[500px]" />
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 mb-20 relative z-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full w-fit">
                                            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Interactive Environment Sync</span>
                                        </div>
                                        <h2 className="text-5xl font-black text-white flex items-center gap-10 font-outfit tracking-tighter italic">
                                            Digital Twin Synthesis
                                        </h2>
                                    </div>
                                    <button 
                                        onClick={() => setIsThreeDOpen(true)}
                                        className="h-20 px-12 rounded-3xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-6 transition-all shadow-3xl active:scale-95 italic group/toggle"
                                    >
                                        <Maximize2 className="h-6 w-6 group-hover/toggle:scale-125 transition-transform" /> Executive Wide Scan
                                    </button>
                                </div>

                                <div className="rounded-[4.5rem] overflow-hidden border border-white/5 h-[800px] shadow-3xl relative z-10 bg-black/50 overflow-hidden">
                                     <ThreeDInline url={property.virtualTourUrl} propertyName={property.title} />
                                </div>

                                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                                    {[
                                        { label: 'Cloud Rendering', val: 'Proprietary Mesh V2', icon: Globe, status: 'Synced' },
                                        { label: 'Node Integrity', val: 'Legal Metadata Match', icon: Award, status: 'Verified' },
                                        { label: 'Sync Status', val: '1:1 Spatial Mirror', icon: Layers, status: 'Active' }
                                    ].map((feat) => (
                                        <div key={feat.label} className="p-12 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center text-center gap-8 group/feat hover:bg-white/10 transition-all duration-700">
                                            <div className="h-20 w-20 bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center text-indigo-400 group-hover/feat:scale-110 group-hover/feat:bg-indigo-600 group-hover/feat:text-white transition-all duration-700 border border-white/5">
                                                <feat.icon className="h-9 w-9" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{feat.label}</p>
                                                <p className="text-xl font-black text-white italic">{feat.val}</p>
                                                <div className="h-10 px-5 bg-white/5 rounded-xl inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {feat.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Professional Mapping Registry Hub */}
                            {(property.lat && property.lng) ? (
                                <div className="bg-white p-24 rounded-[6rem] border border-slate-100 shadow-3xl shadow-slate-200/40 relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[5rem] pointer-events-none transition-transform group-hover:scale-110" />
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 mb-20 relative z-10">
                                        <div className="space-y-4">
                                            <div className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] italic">Geospatial Protocol Verified</div>
                                            <h2 className="text-5xl font-black text-slate-900 flex items-center gap-10 font-outfit tracking-tighter italic leading-none">
                                                Registry Site <br />Provenance Hub
                                            </h2>
                                        </div>
                                        <Link 
                                            href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                                            target="_blank"
                                            className="h-20 px-12 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.35em] hover:bg-indigo-600 transition-all shadow-3xl shadow-slate-900/20 flex items-center gap-6 active:scale-95 italic group/nav"
                                        >
                                            External Navigation Link <ExternalLink className="h-6 w-6 group-hover/nav:translate-y-[-4px] transition-transform" />
                                        </Link>
                                    </div>
                                    <div className="rounded-[4.5rem] overflow-hidden border border-slate-100 h-[800px] shadow-inner relative z-0">
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
                        <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit space-y-12">
                            
                            {/* Primary Action Card */}
                            <div className="bg-white rounded-[5rem] p-16 border border-slate-100 shadow-3xl shadow-slate-200/80 space-y-16 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600" />
                                <div className="space-y-6">
                                   <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-indigo-50 rounded-full text-indigo-600 border border-indigo-100">
                                       <Sparkles className="h-4 w-4" />
                                       <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Executive Access Priority</span>
                                   </div>
                                   <h3 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter italic leading-[0.95]">
                                        Initialize Exchange <br />& Asset Governance.
                                   </h3>
                                </div>
                                
                                <div className="space-y-8">
                                    <button
                                        className="w-full h-28 text-[14px] font-black uppercase tracking-[0.5em] rounded-[2.75rem] bg-indigo-600 text-white shadow-3xl shadow-indigo-600/40 flex flex-col items-center justify-center gap-3 transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-30 disabled:grayscale group/acquire"
                                        onClick={handleInitiatePayment}
                                        disabled={isActionLoading}
                                    >
                                        <span className="flex items-center gap-6">
                                            <CreditCard className="h-8 w-8 group-hover/acquire:rotate-12 transition-transform duration-500" /> 
                                            {isActionLoading ? 'SYNCING LEDGER...' : 'ACQUIRE ASSET CLUSTER'}
                                        </span>
                                        {!isActionLoading && <span className="text-[10px] opacity-40 font-black tracking-[0.3em] italic">Deed Transfer Protocol Ready</span>}
                                    </button>

                                    <CheckoutModal 
                                        isOpen={isCheckoutOpen} 
                                        onClose={() => setIsCheckoutOpen(false)} 
                                        propertyTitle={property.title} 
                                        amount={Number(property.price)} 
                                        onSuccess={handlePaymentSuccess}
                                    />

                                    <button 
                                        className="w-full h-24 text-[12px] font-black uppercase tracking-[0.4em] rounded-[2.25rem] bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-6 shadow-3xl shadow-slate-100 active:scale-95 italic group/comms" 
                                        onClick={handleContactSeller}
                                    >
                                        <MessageSquare className="h-7 w-7 group-hover/comms:scale-125 transition-all" /> Established Imperial Comms
                                    </button>

                                    {getUser()?.role === 'buyer' && (
                                        <button
                                            onClick={() => router.push(`/dashboard/buyer/loans/apply/${property.id}`)}
                                            className="w-full h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between px-12 text-[11px] font-black text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group/loan shadow-sm active:scale-95"
                                        >
                                            <span className="flex items-center gap-5 uppercase tracking-[0.2em] italic font-black"><Banknote className="h-6 w-6" /> Liquidity Analysis Scan</span>
                                            <ChevronRight className="h-6 w-6 group-hover/loan:translate-x-2 transition-transform duration-500" />
                                        </button>
                                    )}
                                </div>

                                <div className="pt-12 border-t border-slate-100 flex flex-col gap-10">
                                    <div className="flex justify-between items-center group/hash">
                                        <div className="flex items-center gap-5">
                                           <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover/hash:text-indigo-500 transition-all duration-700">
                                              <Info className="h-6 w-6" />
                                           </div>
                                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic group-hover/hash:text-slate-700 transition-all">Token ID Checksum</span>
                                        </div>
                                        <span className="text-[12px] font-mono font-black text-indigo-400 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-600/5 transition-all hover:bg-indigo-100">#{property.id.slice(0, 16).toUpperCase()}</span>
                                    </div>

                                    <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 text-center relative overflow-hidden group/audit">
                                        <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover/audit:opacity-5 transition-opacity" />
                                        <div className="h-16 w-16 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-slate-50">
                                            <ShieldCheck className="h-8 w-8" />
                                        </div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 italic mb-4">Registry Safeguard Protocol</p>
                                        <p className="text-[13px] font-medium text-slate-500 italic leading-relaxed px-4">"Institutional structural and legal audits are synchronized and active for this asset cluster."</p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Global Access Card */}
                            <div className="bg-slate-900 rounded-[4rem] p-12 text-white text-center shadow-3xl shadow-slate-900/40 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-indigo-500/20 transition-all duration-700" />
                                <div className="h-16 w-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:rotate-[20deg] duration-500">
                                    <Globe className="h-8 w-8 text-indigo-400" />
                                </div>
                                <h4 className="text-2xl font-black font-outfit uppercase tracking-tighter italic mb-5 leading-none">Global Network Discovery</h4>
                                <p className="text-slate-400 text-[12px] font-bold italic leading-relaxed opacity-70 mb-10 px-8">Establish a secure node presence across the entire imperial property registry network.</p>
                                <button className="w-full h-16 bg-white text-slate-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl italic active:scale-95 shadow-white/5">Establish Node Lineage</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
