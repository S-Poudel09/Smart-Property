'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { getProperties } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { Loader } from '@/components/common/Loader';
import { 
    Search, MapPin, Bath, Bed, Square, 
    ArrowRight, Compass, ShieldCheck, 
    Filter, LayoutGrid, List, Sparkles,
    Landmark, Building2, Map as MapIcon
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNPR } from '@/lib/utils/currency';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/property/PropertyMap'), { 
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-[2.5rem]" />
});

export default function DashboardPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getProperties();
                setProperties(data.filter((p: Property) => p.status === 'published' || p.status === 'approved'));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = properties.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8 py-4">
            {/* Sector Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm">
                            <Compass className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Asset Discovery</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter leading-tight max-w-2xl">Property Intel & Market Analysis</h1>
                    <p className="text-lg text-slate-500 mt-5 font-medium italic border-l-4 border-indigo-600/20 pl-8 max-w-xl">
                        Explore our curated registry of verified assets, ranging from residential sanctuaries to high-yield commercial holdings.
                    </p>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-3xl border border-slate-200">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-3.5 rounded-[1.25rem] transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-3.5 rounded-[1.25rem] transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                    >
                        <List className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`p-3.5 rounded-[1.25rem] transition-all duration-300 ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Map View"
                    >
                        <MapIcon className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Tactical Search Matrix */}
            <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row gap-5 items-stretch">
                <div className="flex-1 relative group bg-slate-50/80 p-5 rounded-[2rem] border border-slate-200/50 focus-within:bg-white focus-within:border-indigo-600/30 transition-all duration-500">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by title, location or asset ID..."
                        className="w-full bg-transparent pl-14 pr-4 py-1.5 outline-none text-sm font-bold tracking-tight placeholder:font-medium placeholder:italic placeholder:text-slate-400 text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-3 bg-slate-50/80 px-6 rounded-[2rem] border border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Price Range</span>
                        <div className="flex items-center gap-2">
                             <input type="number" placeholder="Min" className="w-20 bg-transparent border-none outline-none text-xs font-bold text-slate-700" />
                             <span className="text-slate-300 text-xs">-</span>
                             <input type="number" placeholder="Max" className="w-20 bg-transparent border-none outline-none text-xs font-bold text-slate-700" />
                        </div>
                    </div>
                    <button className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-900/10 flex items-center gap-4 active:scale-95">
                        <Filter className="h-4 w-4" /> Filter Catalog
                    </button>
                </div>
            </div>

            {/* Asset Matrix */}
            <div className={viewMode === 'map' ? "w-full" : (viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-10")}>
                <AnimatePresence mode="popLayout">
                    {viewMode === 'map' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <PropertyMap 
                                properties={filtered} 
                                height="650px"
                                zoom={13}
                            />
                        </motion.div>
                    ) : (
                        filtered.map((property, idx) => (
                        <motion.div 
                            key={property.id || `prop-${idx}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className={`group relative ${viewMode === 'grid' ? '' : 'w-full'}`}
                        >
                            <div className={`relative bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl overflow-hidden group-hover:shadow-indigo-500/10 group-hover:shadow-2xl transition-all duration-700 ${viewMode === 'grid' ? '' : 'flex flex-col md:flex-row min-h-[400px]'}`}>
                                <div className={`relative overflow-hidden bg-slate-100 ${viewMode === 'grid' ? 'h-80 w-full' : 'h-80 md:h-auto md:w-[450px] shrink-0'}`}>
                                    <img 
                                        src={typeof property.images?.[0] === 'string' ? property.images[0] : (property.images?.[0] as any)?.previewUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'} 
                                        alt={property.title}
                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl border border-slate-100/50">
                                        <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-800">{property.category || 'Residential'}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent">
                                         <p className="text-white text-3xl font-black font-outfit tracking-tighter italic drop-shadow-lg">{formatNPR(property.price)}</p>
                                    </div>
                                </div>

                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="h-2 w-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20"></div>
                                        <div className="flex items-center gap-2.5 text-slate-400">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{property.location}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter group-hover:text-indigo-600 transition-colors mb-8 line-clamp-2 leading-tight">{property.title}</h3>
                                    
                                    <div className="grid grid-cols-3 gap-6 mb-10 pb-10 border-b border-slate-100">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Bed className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600">{property.bedrooms || 0} Beds</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 border-x border-slate-100 px-4">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Bath className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600">{property.bathrooms || 0} Baths</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Square className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">{property.area || 0} Sq Ft</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-3.5 bg-slate-50/50 p-2 pr-5 rounded-2xl border border-slate-100">
                                            <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-md border border-indigo-100/30">
                                                <ShieldCheck className="h-5.5 w-5.5" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Asset State</p>
                                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Verified Entry</p>
                                            </div>
                                        </div>
                                        <Link href={`/properties/${property.id}`} className="group-hover:translate-x-3 transition-transform duration-500">
                                            <div className="h-16 w-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-slate-900/30 group-hover:bg-indigo-600 group-hover:shadow-indigo-600/30 transition-all duration-500">
                                                <ArrowRight className="h-7 w-7" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border border-slate-200/50 shadow-inner">
                            <Compass className="h-20 w-20 text-slate-200 mx-auto mb-8" />
                            <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase italic tracking-tighter">No Assets Found</h2>
                            <p className="text-slate-400 font-medium italic mt-3">"We couldn't find any properties matching your current filters."</p>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-10 px-10 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-md active:scale-95"
                            >
                                Reset Search Parameters
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
