'use client';

import { useEffect, useState } from 'react';
import { getServices, Service, bookService, getServiceBookings, ServiceBooking } from '@/lib/api/services';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { 
    Search, FileText, Camera, TrendingUp, Wrench, 
    Calendar, CheckCircle, Clock, Info, ArrowRight,
    MapPin, ShieldCheck, Star, Crown, Sparkles, Navigation, X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Container from '@/components/layout/Container';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, any> = {
    FileText,
    Search,
    TrendingUp,
    Camera,
    ShieldCheck
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<ServiceBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings'>('browse');

    const loadData = async () => {
        try {
            const [svcData, bookingsData] = await Promise.all([
                getServices(),
                getServiceBookings()
            ]);
            setServices(Array.isArray(svcData) ? svcData : (svcData as any).results || []);
            setBookings(Array.isArray(bookingsData) ? bookingsData : (bookingsData as any).results || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBook = async () => {
        if (!selectedService || bookingLoading) return;
        setBookingLoading(true);
        try {
            await bookService(selectedService.id, bookingNotes);
            toast.success('Service booked successfully!');
            setSelectedService(null);
            setBookingNotes('');
            loadData();
        } catch (e) {
            toast.error('Failed to book service');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#fffdf9] flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Crown className="h-6 w-6 text-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Artisans Guild</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-serif text-primary leading-tight">Service Registry</h1>
                        <p className="text-xl text-gray-400 mt-4 font-medium italic border-l-4 border-accent/30 pl-8">
                            "Commission the realm's finest experts for manual audits, legal decrees, and visual capture."
                        </p>
                    </div>
                    <div className="flex bg-primary/5 p-1.5 rounded-[2rem] border border-accent/10 backdrop-blur-xl">
                        <button 
                            onClick={() => setActiveTab('browse')}
                            className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-primary text-accent shadow-xl' : 'text-primary/40 hover:text-primary'}`}
                        >
                            Browse
                        </button>
                        <button 
                            onClick={() => setActiveTab('my-bookings')}
                            className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-bookings' ? 'bg-primary text-accent shadow-xl' : 'text-primary/40 hover:text-primary'}`}
                        >
                            My Decrees
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Marketplace */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {activeTab === 'browse' ? (
                                <motion.div 
                                    key="browse"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                >
                                    {services.map((service, idx) => {
                                        const Icon = iconMap[service.icon] || Info;
                                        return (
                                            <motion.div 
                                                key={service.id} 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-accent/10 p-8 hover:shadow-2xl hover:shadow-accent/5 transition-all group relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-all" />
                                                
                                                <div className="flex justify-between items-start mb-8 relative z-10">
                                                    <div className="h-16 w-16 bg-primary text-accent rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <Icon className="h-8 w-8" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Commission Stake</p>
                                                        <p className="text-2xl font-serif text-primary">Rs. {parseFloat(service.base_price).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-serif text-primary mb-4 group-hover:text-accent transition-colors">{service.name}</h3>
                                                <p className="text-sm text-gray-400 mb-8 line-clamp-2 font-medium italic leading-relaxed">"{service.description}"</p>
                                                
                                                <Button 
                                                    className="w-full h-14 rounded-full bg-primary text-accent font-black uppercase tracking-widest text-[10px] border border-accent/30 shadow-xl hover:bg-accent hover:text-primary transition-all flex items-center justify-center gap-3 active:scale-95"
                                                    onClick={() => setSelectedService(service)}
                                                >
                                                    Commission Expert <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="my-bookings"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {bookings.length === 0 ? (
                                        <div className="py-40 text-center bg-white/60 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-accent/20">
                                            <Navigation className="h-16 w-16 text-accent/20 mx-auto mb-8" />
                                            <h2 className="text-3xl font-serif text-primary mb-2 italic">Clean Registry</h2>
                                            <p className="text-gray-400 font-medium italic">"No active service decrees currently recorded in your name."</p>
                                        </div>
                                    ) : (
                                        bookings.map((booking, idx) => (
                                            <motion.div 
                                                key={booking.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-accent/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl transition-all"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-16 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                                        {(() => { const Icon = iconMap[booking.service_details.icon] || Info; return <Icon className="h-8 w-8" />; })()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-serif text-primary">{booking.service_details.name}</h4>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                                            <Calendar className="h-3 w-3" /> Sealed on {format(new Date(booking.created_at), 'MMMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-primary/5 text-primary border-primary/10'
                                                    }`}>
                                                        {booking.status}
                                                    </div>
                                                    <button className="h-12 w-12 rounded-full border border-accent/10 flex items-center justify-center text-primary/30 hover:text-accent hover:border-accent group-hover:bg-primary transition-all">
                                                        <ArrowRight className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar: Guild Secrets */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="premium-gradient rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group border border-accent/20">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-accent/40 transition-all duration-700" />
                            <div className="relative z-10">
                                <div className="h-14 w-14 bg-white/10 backdrop-blur-3xl rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                                    <ShieldCheck className="h-8 w-8 text-accent" />
                                </div>
                                <h3 className="text-3xl font-serif mb-6 leading-tight">Guild Safeguards</h3>
                                <p className="text-gray-300 font-medium italic mb-10 leading-relaxed">
                                    "Every artisan in our registry is vetted by the Imperial Council for accuracy and character."
                                </p>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                                    <Sparkles className="h-4 w-4 animate-pulse" /> Certified Expert Trust
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-accent/10 shadow-xl">
                            <h3 className="text-xl font-serif text-primary mb-8 border-b border-accent/5 pb-4">Guild Tips</h3>
                            <div className="space-y-8">
                                <div className="flex gap-4 group/tip">
                                    <div className="h-10 w-10 shrink-0 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-primary transition-all">
                                        <Star className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium italic mt-1 leading-relaxed">
                                        Manual audits by legal artisans increase decree speed by 3x.
                                    </p>
                                </div>
                                <div className="flex gap-4 group/tip">
                                    <div className="h-10 w-10 shrink-0 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-primary transition-all">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium italic mt-1 leading-relaxed">
                                        High-fidelity visual capture boosts imperial interest by 60%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                <AnimatePresence>
                    {selectedService && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedService(null)}
                                className="absolute inset-0 bg-primary/40 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-3xl relative z-10 border border-accent/20 grayscale-0"
                            >
                                <div className="p-12 md:p-16">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="h-20 w-20 bg-primary text-accent rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden group">
                                            {(() => { const Icon = iconMap[selectedService.icon] || Info; return <Icon className="h-10 w-10 relative z-10" />; })()}
                                            <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        </div>
                                        <button 
                                            onClick={() => setSelectedService(null)} 
                                            className="h-12 w-12 hover:bg-gray-50 rounded-full flex items-center justify-center transition-all group"
                                        >
                                            <X className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform" />
                                        </button>
                                    </div>

                                    <h2 className="text-4xl font-serif text-primary mb-4 leading-tight">Seal Commission: {selectedService.name}</h2>
                                    <p className="text-lg text-gray-400 mb-12 font-medium italic italic leading-relaxed">"{selectedService.description}"</p>

                                    <div className="space-y-10">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] block mb-2">Guild Stake (Tax Incl.)</label>
                                            <p className="text-5xl font-serif text-primary tracking-tighter">Rs. {parseFloat(selectedService.base_price).toLocaleString()}</p>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] block mb-4">Commission Particulars</label>
                                            <textarea 
                                                value={bookingNotes}
                                                onChange={(e) => setBookingNotes(e.target.value)}
                                                placeholder="Provide specific details for the guild expert..."
                                                className="w-full bg-gray-50/50 border-2 border-accent/5 rounded-[2rem] px-8 py-6 text-sm focus:ring-4 focus:ring-accent/10 focus:border-accent/30 transition-all outline-none min-h-[160px] font-medium placeholder:italic"
                                            />
                                        </div>

                                        <div className="flex gap-6 pt-6">
                                            <button 
                                                className="flex-1 h-16 rounded-full border border-accent/20 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-gray-50 transition-all active:scale-95"
                                                onClick={() => setSelectedService(null)}
                                            >
                                                Abort
                                            </button>
                                            <button 
                                                className="flex-[2] h-16 rounded-full bg-primary text-accent font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:bg-accent hover:text-primary transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                                onClick={handleBook}
                                                disabled={bookingLoading}
                                            >
                                                {bookingLoading ? <Loader size="sm" /> : <>Seal & Send Decree <CheckCircle className="h-4 w-4" /></>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
}
