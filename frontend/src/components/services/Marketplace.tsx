'use client';

import { useState, useEffect } from 'react';
import { getServices, bookService, Service } from '@/lib/api/services';
import { 
    Search, Hammer, Droplets, Zap, Shield, 
    Ruler, Sparkles, 
    ArrowRight, Clock, ShoppingBag,
    CheckCircle, X
} from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNPR } from '@/lib/utils/currency';

const CATEGORIES = [
    { id: 'all', name: 'All Services', icon: Sparkles },
    { id: 'maintenance', name: 'Maintenance', icon: Hammer },
    { id: 'cleaning', name: 'Cleaning', icon: Droplets },
    { id: 'legal', name: 'Legal & Tax', icon: Shield },
    { id: 'design', name: 'Design', icon: Ruler },
];

const EXTRA_SERVICES: Service[] = [
    { id: 'ext-1', name: 'Legal Document Verification', category: 'legal', description: 'Complete registry verification and structural deed auditing by certified professionals.', base_price: '15000', icon: 'Shield' },
    { id: 'ext-2', name: 'Professional Deep Cleaning', category: 'cleaning', description: 'Comprehensive sanitation of all internal and external property surfaces.', base_price: '8500', icon: 'Droplets' },
    { id: 'ext-3', name: 'Structural Safety Audit', category: 'maintenance', description: 'Advanced structural audit and reinforcement analysis for safety compliance.', base_price: '25000', icon: 'Hammer' },
    { id: 'ext-4', name: '3D Property Rendering', category: 'design', description: 'High-fidelity 3D photorealistic visualization of architectural changes.', base_price: '12000', icon: 'Ruler' },
];

export default function Marketplace() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const apiServices = await getServices();
                const merged = [...apiServices, ...EXTRA_SERVICES].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
                setServices(merged);
            } catch (_e) {
                console.warn('API connection unstable, using local registry');
                setServices(EXTRA_SERVICES);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = services.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchSearch && matchCat;
    });

    const handleOpenBooking = (service: Service) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedService) return;
        setBookingLoading(true);
        try {
            await bookService(selectedService.id, bookingNotes);
            toast.success('Service requested successfully');
            setIsBookingModalOpen(false);
            setBookingNotes('');
        } catch (_e) {
            toast.error('Failed to process request');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-12 max-w-7xl mx-auto py-4">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Professional Network</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter leading-none italic">Service Marketplace</h1>
                    <p className="text-lg text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-8 max-w-xl">
                        &quot;Connect with verified specialists for property maintenance, legal advisory, and architectural design.&quot;
                    </p>
                </div>
                
                <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-all duration-1000"></div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest relative z-10">Service Status</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 animate-pulse relative z-10">100% Expert Verified</p>
                </div>
            </header>

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 relative group bg-white border border-slate-100 p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth p-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <cat.icon className={`h-4 w-4 ${selectedCategory === cat.id ? 'text-indigo-400' : 'text-slate-300'}`} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full xl:w-[400px] bg-white border border-slate-100 p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/40 flex items-center px-6">
                    <Search className="h-5 w-5 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Search for services..." 
                        className="w-full bg-transparent border-none py-4 px-4 text-sm font-black uppercase tracking-widest outline-none italic placeholder:text-slate-200 text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                    {filtered.map((service, idx) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700 group hover:-translate-y-2 flex flex-col h-full relative"
                        >
                            <div className="absolute top-10 right-10">
                                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                            </div>
                            
                            <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-slate-900 group-hover:text-indigo-400 transition-all duration-500 shadow-inner group-hover:scale-110">
                                {service.category === 'cleaning' ? <Droplets className="h-7 w-7" /> : 
                                 service.category === 'legal' ? <Shield className="h-7 w-7" /> :
                                 service.category === 'maintenance' ? <Hammer className="h-7 w-7" /> :
                                 service.category === 'design' ? <Ruler className="h-7 w-7" /> :
                                 <Sparkles className="h-7 w-7" />}
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-1.5 w-6 bg-indigo-600 rounded-full"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">{service.category}</p>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter mb-4 group-hover:text-indigo-600 transition-colors leading-tight italic">{service.name}</h3>
                            <p className="text-sm text-slate-500 font-medium italic leading-relaxed mb-10 flex-1 line-clamp-3">&quot;{service.description}&quot;</p>
                            
                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Estimation</p>
                                    <p className="text-xl font-black text-slate-900 italic">{formatNPR(service.base_price)}</p>
                                </div>
                                <button 
                                    onClick={() => handleOpenBooking(service)}
                                    className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10 group-hover:bg-indigo-600 transition-colors active:scale-90"
                                >
                                    <PlusIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isBookingModalOpen && selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                            onClick={() => setIsBookingModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-3xl overflow-hidden relative z-[101] border border-white/20"
                        >
                            <div className="p-12">
                                <button 
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="absolute top-10 right-10 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="flex items-center gap-6 mb-10">
                                    <div className="h-16 w-16 bg-slate-900 text-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
                                        <ShoppingBag className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter italic">Request Service</h2>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Provider confirmation active</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-black text-slate-900 font-outfit tracking-tight">{selectedService.name}</h3>
                                            <span className="text-lg font-black text-indigo-600 italic">{formatNPR(selectedService.base_price)}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-bold italic">&quot;{selectedService.description}&quot;</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] block mb-4 ml-1">Requirement Notes</label>
                                        <textarea 
                                            rows={4}
                                            placeholder="Detail your requirements for the service provider..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all italic placeholder:text-slate-300 resize-none shadow-inner"
                                            value={bookingNotes}
                                            onChange={(e) => setBookingNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                                         <Clock className="h-5 w-5 text-indigo-600" />
                                         <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Expected Response: Within 24-48 Hours</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5 pt-4">
                                        <button 
                                            disabled={bookingLoading}
                                            onClick={() => setIsBookingModalOpen(false)}
                                            className="py-5 rounded-xl border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                        >
                                            Cancel Request
                                        </button>
                                        <button 
                                            disabled={bookingLoading || !bookingNotes.trim()}
                                            onClick={handleConfirmBooking}
                                            className="py-5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30 flex items-center justify-center gap-3"
                                        >
                                            {bookingLoading ? <Loader size="sm" /> : (
                                                <>Confirm Request <ArrowRight className="h-4 w-4" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                 )}
            </AnimatePresence>
        </div>
    );
}

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);
