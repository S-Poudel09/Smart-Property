'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Bed, Bath, Maximize2, MapPin, Share2, Heart, 
    Calendar, ArrowLeft, CheckCircle2, ShoppingCart, 
    MessageSquare, Banknote, Play, Crown, Sparkles,
    Navigation, ShieldCheck, Info, FileText, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyMap from '@/components/property/PropertyMap';
import VirtualTour from '@/components/property/VirtualTour';
import { ThreeDViewer } from '@/components/property/ThreeDViewer';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { getPropertyById } from '@/lib/properties/storage';
import { Property } from '@/types/property';
import { formatNPR, formatArea } from '@/lib/utils/currency';
import { isAuthenticated, getCurrentUser } from '@/lib/auth/mockAuth';
import { createPurchaseRequest } from '@/lib/api/transactions';
import { toast } from 'react-hot-toast';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isThreeDOpen, setIsThreeDOpen] = useState(false);

    useEffect(() => {
        const load = () => {
            let foundProperty = MOCK_PROPERTIES.find(p => p.id === id);
            if (!foundProperty) {
                foundProperty = getPropertyById(id);
            }

            if (foundProperty) {
                const isPubliclyVisible = ['PUBLISHED', 'available', 'pending'].includes(foundProperty.status);
                if (isPubliclyVisible) {
                    setProperty(foundProperty);
                }
            }
            setIsLoading(false);
        };
        load();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full shadow-gold-glow"
                />
            </div>
        );
    }

    if (!property) {
        return (
            <Container className="py-20">
                <EmptyState
                    title="Imperial Record Not Found"
                    description="The asylum or estate you seek is missing from our sovereign registers."
                    action={
                        <Link href="/properties">
                            <Button className="h-14 px-8 rounded-full bg-[#1a1a2e] text-accent font-black uppercase tracking-widest text-[10px] border border-accent/30 shadow-xl">Back to Registry</Button>
                        </Link>
                    }
                />
            </Container>
        );
    }

    const handleRequestToBuy = async () => {
        if (!isAuthenticated()) {
            toast.error('Identity required for sovereign acquisition');
            router.push('/auth/login');
            return;
        }
        const user = getCurrentUser();
        if (user?.role !== 'buyer') {
            toast.error('Only buyers may petition for acquisition');
            return;
        }
        try {
            await createPurchaseRequest(property.id, property.sellerId ?? '', Number(property.price));
            toast.success('Inquiry sealed! Redirecting to Imperial Ledger...');
            router.push('/dashboard/buyer/transactions');
        } catch (e) {
            toast.error('Petition failed to reach the treasury');
        }
    };

    const handleContactSeller = async () => {
        if (!isAuthenticated()) {
            toast.error('Identify yourself to the artisan');
            router.push('/auth/login');
            return;
        }
        const user = getCurrentUser();
        if (!user || user.role === 'admin' || user.role === 'seller') {
            toast.error('Access restricted to verified seekers');
            return;
        }
        try {
            const { getOrCreateRoom } = await import('@/lib/api/chat');
            const room = await getOrCreateRoom(property.sellerId, property.id);
            toast.success('Establishing secure line...');
            router.push(`/dashboard/buyer/chats?room=${room.RoomID}`);
        } catch (e) {
            toast.error('Secure line failed');
        }
    };

    return (
        <div className="pb-32 bg-[#fffdf9] selection:bg-[#c5a059]/30">
            <ThreeDViewer 
                isOpen={isThreeDOpen} 
                onClose={() => setIsThreeDOpen(false)} 
                propertyName={property.title} 
            />
            
            {/* Hero Header */}
            <div className="premium-gradient text-white pt-32 pb-24 relative overflow-hidden mb-16">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <Container className="relative z-10">
                    <Link href="/properties" className="mb-12 inline-flex items-center gap-3 text-[10px] font-black text-accent hover:text-white transition-all uppercase tracking-[0.3em] group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
                        Return to Registry
                    </Link>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12"
                    >
                        <div className="max-w-4xl">
                            <div className="mb-6 flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 text-accent rounded-full shadow-lg">
                                    <Crown className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Imperial Grade Estate</span>
                                </div>
                                <StatusBadge status={property.status} />
                                {property.isVerified && (
                                    <motion.span 
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#1a1a2e] bg-white px-4 py-1.5 rounded-full border border-accent/30 shadow-2xl"
                                    >
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Authenticated
                                    </motion.span>
                                )}
                            </div>
                            <h1 className="text-5xl lg:text-8xl font-serif leading-[0.9] text-white mb-6 pr-12">{property.title}</h1>
                            <div className="flex items-center gap-3 text-gray-400 font-medium italic text-lg lg:text-xl">
                                <MapPin className="h-6 w-6 text-accent" />
                                <span>
                                    {property.district ? `${property.district}, ` : ''} {property.location}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 text-right min-w-[320px] shadow-2xl">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-2 leading-none">Market Reserve</div>
                            <div className="text-5xl lg:text-6xl font-serif text-white">{formatNPR(property.price)}</div>
                            <div className="mt-8 flex gap-3 justify-end">
                                <Button variant="outline" className="h-14 w-14 rounded-full border-white/20 text-white hover:bg-accent hover:text-[#1a1a2e] transition-all flex items-center justify-center shadow-lg">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" className="h-14 w-14 rounded-full border-white/20 text-accent hover:bg-white hover:text-red-500 transition-all flex items-center justify-center shadow-lg">
                                    <Heart className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                    {/* Primary Dossier */}
                    <div className="lg:col-span-2 space-y-20">
                        {/* Gallery & Virtual Gateway */}
                        <div className="relative group rounded-[4rem] overflow-hidden shadow-3xl shadow-accent/10">
                            <PropertyGallery images={property.images.map(img => typeof img === 'string' ? img : (img as { previewUrl: string }).previewUrl)} />
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsThreeDOpen(true)}
                                    className="absolute bottom-12 left-12 h-24 px-12 bg-[#1a1a2e]/90 backdrop-blur-2xl border border-accent/40 rounded-full shadow-gold-glow flex items-center gap-6 group/btn overflow-hidden z-20"
                                >
                                    <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                    <div className="relative flex items-center gap-5">
                                        <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center text-[#1a1a2e] shadow-lg">
                                            <Play className="h-5 w-5 fill-current ml-0.5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Dimensional Access</div>
                                            <div className="text-xl font-serif text-white">Enter 3D Sanctuary</div>
                                        </div>
                                    </div>
                                </motion.button>
                        </div>

                        {/* Inventory Specs */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: <Bed />, value: property.bedrooms, label: 'Chambers' },
                                { icon: <Bath />, value: property.bathrooms, label: 'Sanctums' },
                                { icon: <Maximize2 />, value: property.area_ropani !== undefined ? formatArea(property.area, 'ropani') : `${property.area} Sq Ft`, label: 'Foundation' },
                                { icon: <Calendar />, value: 'Imperial 2022', label: 'Erected' }
                            ].map((spec, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-accent/10 shadow-xl text-center group transition-all hover:bg-white hover:shadow-accent/10">
                                    <div className="mx-auto h-14 w-14 bg-[#1a1a2e] text-accent flex items-center justify-center rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                        {spec.icon}
                                    </div>
                                    <div className="text-2xl font-serif text-[#1a1a2e]">{spec.value}</div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-accent mt-1">{spec.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Imperial Decree (Description) */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="bg-white/60 backdrop-blur-md p-12 rounded-[3.5rem] border border-accent/10 shadow-sm"
                        >
                            <h2 className="text-3xl font-serif text-[#1a1a2e] mb-8 border-b border-accent/10 pb-6 flex items-center gap-4">
                                <FileText className="h-7 w-7 text-accent" /> Manifest & Essence
                            </h2>
                            <p className="text-xl leading-relaxed text-gray-500 whitespace-pre-wrap font-medium italic pr-8 line-clamp-[20]">
                                {property.description}
                            </p>
                        </motion.div>

                        {/* Accoutrements (Features) */}
                        <div>
                            <h2 className="text-3xl font-serif text-[#1a1a2e] mb-10 pl-4">Estate Accoutrements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {property.features.map((feature) => (
                                    <motion.div 
                                        key={feature} 
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-accent/10 shadow-sm transition-all group hover:border-accent/30"
                                    >
                                        <div className="h-3 w-3 rounded-full bg-accent shadow-gold-glow animate-pulse opacity-50"></div>
                                        <span className="text-xs font-black uppercase tracking-widest text-[#1a1a2e]">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Geographic Intelligence */}
                        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] border border-accent/10 shadow-2xl relative">
                            <h2 className="text-3xl font-serif text-[#1a1a2e] mb-10 flex items-center gap-4">
                                <Navigation className="h-8 w-8 text-emerald-600" />
                                Geographic Intelligence
                            </h2>
                            <div className="rounded-[3rem] overflow-hidden border-4 border-white shadow-inner">
                                <PropertyMap 
                                    center={[property.lat || 27.7172, property.lng || 85.3240]} 
                                    zoom={16}
                                    title={property.title}
                                    boundary={property.boundaryCoordinates}
                                />
                            </div>
                            <div className="mt-10 flex items-center justify-between p-6 bg-[#fffdf9] rounded-[2.5rem] border border-accent/10">
                                <div className="flex items-center gap-4">
                                    <Info className="h-6 w-6 text-accent" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Malpot Integrated GIS Boundary (Kitta # Verified)</p>
                                </div>
                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    {/* Sovereign Counsel (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-10">
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="premium-gradient rounded-[4rem] p-12 text-white border border-accent/30 shadow-3xl text-center relative overflow-hidden group shadow-gold-glow/5"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-accent/20 transition-all duration-700" />
                                
                                <motion.div 
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                    className="mx-auto h-24 w-24 bg-accent/20 rounded-[2rem] flex items-center justify-center text-accent mb-10 border border-accent/30 shadow-2xl relative z-10"
                                >
                                    <Crown className="h-10 w-10" />
                                </motion.div>
                                
                                <h3 className="text-3xl font-serif text-accent mb-4">Imperial Petitioner</h3>
                                <p className="text-gray-400 text-sm font-medium italic mb-12">Submit your petition to the custodial artisan.</p>
                                
                                <div className="space-y-6 relative z-10">
                                    <Button
                                        className="w-full h-20 text-xs font-black uppercase tracking-[0.2em] rounded-full bg-[#1a1a2e] text-white border border-accent/40 hover:bg-accent hover:text-[#1a1a2e] shadow-xl transition-all duration-500 gap-4 flex items-center justify-center group"
                                        onClick={handleRequestToBuy}
                                    >
                                        <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Petition for {property.type === 'sale' ? 'Grant' : 'Lease'}
                                    </Button>

                                    <Button 
                                        className="w-full h-20 text-xs font-black uppercase tracking-[0.2em] rounded-full bg-white text-[#1a1a2e] hover:bg-[#c5a059] transition-all duration-500 shadow-xl gap-4 flex items-center justify-center group" 
                                        onClick={handleContactSeller}
                                    >
                                        <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Private Audience
                                    </Button>

                                    {getCurrentUser()?.role === 'buyer' && (
                                        <motion.button
                                            whileHover={{ x: 5 }}
                                            onClick={() => router.push(`/dashboard/buyer/loans/apply/${property.id}`)}
                                            className="w-full h-16 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full flex items-center justify-between px-10 text-[10px] font-black uppercase tracking-widest text-[#c5a059] hover:bg-[#c5a059]/20 transition-all"
                                        >
                                            <span className="flex items-center gap-3"><Banknote className="h-4 w-4" /> Treasury Support</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </motion.button>
                                    )}
                                </div>

                                <div className="mt-12 pt-10 border-t border-accent/20">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-accent/60">
                                        <span>Heritage ID</span>
                                        <span className="font-mono text-white">#{property.id.slice(0, 10).toUpperCase()}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-accent/10 shadow-xl text-center"
                            >
                                <Sparkles className="h-8 w-8 text-accent mx-auto mb-4" />
                                <h4 className="text-sm font-black text-[#1a1a2e] uppercase tracking-widest mb-2 italic">Golden Glimpse</h4>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                                    "Assets of this pedigree are commissioned once in a generation. Petition early to ensure your legacy."
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

