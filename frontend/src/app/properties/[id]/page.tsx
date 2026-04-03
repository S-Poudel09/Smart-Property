'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
    Bed, Bath, Maximize2, MapPin, Share2, Heart, 
    Calendar, ArrowLeft, CheckCircle2, ShoppingCart, 
    MessageSquare, Banknote, Play, ShieldCheck, 
    Info, FileText, ChevronRight, Navigation,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';
import PropertyGallery from '@/components/property/PropertyGallery';
const PropertyMap = dynamic(() => import('@/components/property/PropertyMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">Loading Map...</div>
});
const ThreeDViewer = dynamic(() => import('@/components/property/ThreeDViewer').then(mod => mod.ThreeDViewer), {
    ssr: false
});
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { TransactionStepper } from '@/components/property/TransactionStepper';
import { getProperty } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { formatNPR, formatArea } from '@/lib/utils/currency';
import { getUser } from '@/lib/auth/getUser';
import { createPurchaseRequest } from '@/lib/api/transactions';
import { toast } from 'react-hot-toast';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isThreeDOpen, setIsThreeDOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getProperty(id);
                if (data) {
                    const user = getUser();
                    const isVisible = data.status === 'published' || user?.role === 'admin' || data.sellerId === user?.user_id;
                    if (isVisible) {
                        setProperty(data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch property details", err);
                toast.error("Failed to load property details");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fetching Details...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-background pt-32">
                <Container>
                    <EmptyState
                        title="Property Not Found"
                        description="We couldn't find the property you're looking for. It might have been sold or removed."
                        action={
                            <Link href="/properties">
                                <Button className="px-10 h-12 rounded-lg font-bold">Back to Listings</Button>
                            </Link>
                        }
                    />
                </Container>
            </div>
        );
    }

    const handleRequestToBuy = async () => {
        const user = getUser();
        if (!user) {
            toast.error('Please login to continue');
            router.push('/auth/login');
            return;
        }
        if (user.role !== 'buyer') {
            toast.error('Only buyers can initiate a purchase');
            return;
        }
        try {
            await createPurchaseRequest(property.id, property.sellerId ?? '', Number(property.price));
            toast.success('Interest registered successfully!');
            router.push('/dashboard/buyer/transactions');
        } catch (e) {
            toast.error('Failed to submit purchase request');
        }
    };

    const handleContactSeller = async () => {
        const user = getUser();
        if (!user) {
            toast.error('Please login to message the owner');
            router.push('/auth/login');
            return;
        }
        try {
            const { getOrCreateRoom } = await import('@/lib/api/chat');
            const room = await getOrCreateRoom(property.sellerId, property.id);
            router.push(`/dashboard/buyer/chats?room=${room.RoomID}`);
        } catch (e) {
            toast.error('Failed to connect with seller');
        }
    };

    return (
        <div className="bg-background pb-32">
            {property.virtualTourUrl && (
                <ThreeDViewer 
                    isOpen={isThreeDOpen} 
                    onClose={() => setIsThreeDOpen(false)} 
                    propertyName={property.title} 
                />
            )}
            
            {/* Header Section */}
            <div className="bg-primary pt-32 pb-24 text-white relative overflow-hidden mb-12">
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                <Container className="relative z-10">
                    <Link href="/properties" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-all uppercase tracking-wider group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Listings
                    </Link>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="max-w-4xl">
                            <div className="mb-6 flex flex-wrap items-center gap-4">
                                <StatusBadge status={property.status} />
                                {property.isVerified && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-white px-4 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                                        <ShieldCheck className="h-4 w-4" /> Verified Property
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">{property.title}</h1>
                            <div className="flex items-center gap-3 text-white/70 font-medium text-lg">
                                <MapPin className="h-6 w-6 text-white/50" />
                                <span>{property.location}</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-right min-w-[320px]">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">Market Value</div>
                            <div className="text-4xl md:text-5xl font-bold text-white">{formatNPR(property.price)}</div>
                            <div className="mt-8 flex gap-3 justify-end">
                                <button className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center border border-white/10">
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center border border-white/10">
                                    <Heart className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Workflow Progress Tracker */}
            <div className="bg-white/50 backdrop-blur-md border-b border-gray-100 py-10 mb-12">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <TransactionStepper currentStep={property.workflowStep || 1} />
                    </div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Gallery */}
                        <div className="relative rounded-2xl overflow-hidden shadow-md border border-border bg-gray-50 min-h-[400px]">
                            <PropertyGallery images={property.images} />
                            
                            {property.virtualTourUrl && (
                                <button 
                                    onClick={() => setIsThreeDOpen(true)}
                                    className="absolute bottom-6 right-6 h-14 pl-4 pr-6 bg-white/40 backdrop-blur-2xl text-foreground font-black uppercase tracking-widest rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex items-center gap-4 hover:bg-white/80 hover:scale-105 hover:-translate-y-1 transition-all duration-300 z-20 group"
                                >
                                    <div className="h-10 w-10 bg-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-colors">
                                        <Play className="h-5 w-5 text-primary group-hover:text-white fill-current ml-0.5 transition-colors" />
                                    </div>
                                    Virtual Tour
                                </button>
                            )}
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: <Bed />, value: property.bedrooms, label: 'Bedrooms' },
                                { icon: <Bath />, value: property.bathrooms, label: 'Bathrooms' },
                                { icon: <Maximize2 />, value: `${property.area} Sq Ft`, label: 'Total Area' },
                                { icon: <Calendar />, value: '2023', label: 'Listing Date' }
                            ].map((spec) => (
                                <div key={spec.label} className="bg-white p-6 rounded-xl border border-border shadow-sm text-center">
                                    <div className="mx-auto h-12 w-12 bg-gray-50 text-primary flex items-center justify-center rounded-xl mb-3">
                                        {spec.icon}
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{spec.value}</div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{spec.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Hostel Features if applicable */}
                        {property.propertyType === 'hostel' && (
                            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <ShieldCheck className="h-6 w-6 text-primary" /> Hostel Amenities
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Gender</p>
                                        <p className="text-sm font-bold text-gray-900">{property.hostelGender?.toUpperCase() || 'UNSPECIFIED'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Meals</p>
                                        <p className="text-sm font-bold text-gray-900">{property.foodIncluded ? 'Mess Included' : 'Excluded'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Internet</p>
                                        <p className="text-sm font-bold text-gray-900">{property.hasWifi ? 'High-Speed WiFi' : 'No WiFi'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Laundry</p>
                                        <p className="text-sm font-bold text-gray-900">{property.hasLaundry ? 'Available' : 'Unavailable'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bathroom</p>
                                        <p className="text-sm font-bold text-gray-900">{property.bathroomType === 'attached' ? 'Attached' : 'Shared'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Beds</p>
                                        <p className="text-sm font-bold text-gray-900">{property.availableBeds} Available</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white p-10 rounded-2xl border border-border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <FileText className="h-6 w-6 text-primary" /> Property Description
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                {property.description}
                            </p>
                        </div>

                        {/* Map & Location */}
                        {property.lat && property.lng && (
                            <div className="bg-white p-10 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Navigation className="h-6 w-6 text-primary" /> Location Verification
                                </h2>
                                <div className="rounded-xl overflow-hidden border border-border h-[400px]">
                                    <PropertyMap 
                                        center={[property.lat, property.lng]} 
                                        zoom={16}
                                        title={property.title}
                                        boundary={property.boundaryCoordinates}
                                    />
                                </div>
                                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-primary">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Verified Data</p>
                                            <p className="text-sm font-bold text-gray-900">Official Property Records</p>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                                        target="_blank"
                                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2 group"
                                    >
                                        Open in Google Maps <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Interested in this property?</h3>
                                
                                <div className="space-y-4">
                                    <Button
                                        className="w-full h-14 text-sm font-bold uppercase tracking-wider rounded-xl bg-primary text-white shadow-md flex items-center justify-center gap-3"
                                        onClick={handleRequestToBuy}
                                    >
                                        <ShoppingCart className="h-5 w-5" /> Express Interest
                                    </Button>

                                    <Button 
                                        variant="outline"
                                        className="w-full h-14 text-sm font-bold uppercase tracking-wider rounded-xl border-border hover:bg-gray-50 flex items-center justify-center gap-3" 
                                        onClick={handleContactSeller}
                                    >
                                        <MessageSquare className="h-5 w-5" /> Message Owner
                                    </Button>

                                    {getUser()?.role === 'buyer' && (
                                        <button
                                            onClick={() => router.push(`/dashboard/buyer/loans/apply/${property.id}`)}
                                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between px-6 text-xs font-bold text-primary hover:bg-primary/10 transition-all"
                                        >
                                            <span className="flex items-center gap-2 font-sans"><Banknote className="h-4 w-4" /> Check Financing</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Property ID</span>
                                    <span className="text-xs font-mono font-bold text-gray-900 px-2 py-1 bg-gray-50 rounded">#{property.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                                <p className="text-sm font-black tracking-widest uppercase text-primary mb-3 relative z-10">SmartProperty Security</p>
                                <p className="text-xs text-muted leading-relaxed font-medium relative z-10 italic">
                                    "Verified listings undergo rigorous document analysis and physical audits. Secure your site visit seamlessly."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

