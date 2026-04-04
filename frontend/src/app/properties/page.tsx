'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import PropertyFilters, { FilterState } from '@/components/property/PropertyFilters';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/common/Button';
import { Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Building, Globe } from 'lucide-react';
import { Property } from '@/types/property';
import { motion, AnimatePresence } from 'framer-motion';
import { getProperties } from '@/lib/api/properties';

const ITEMS_PER_PAGE = 6;

export default function PropertiesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('latest');
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setIsLoading(true);
                const data = await getProperties();
                setProperties(data.filter((p: Property) => p.status === 'published'));
            } catch {
                setError('Failed to reach Node Registry.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        type: 'all',
        category: 'all',
        minPrice: '',
        maxPrice: '',
        district: '',
        amenities: [],
        hostelGender: 'all',
        foodIncluded: 'all'
    });

    const [activeFilters, setActiveFilters] = useState<FilterState>(filters);

    const filteredAndSortedProperties = useMemo(() => {
        let result = [...properties];
        if (activeFilters.search) {
            const searchLower = activeFilters.search.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(searchLower) ||
                p.location.toLowerCase().includes(searchLower)
            );
        }
        if (activeFilters.type !== 'all') result = result.filter(p => p.type === activeFilters.type);
        if (activeFilters.category !== 'all') result = result.filter(p => p.category === activeFilters.category);
        if (activeFilters.minPrice) result = result.filter(p => p.price >= parseInt(activeFilters.minPrice));
        if (activeFilters.maxPrice) result = result.filter(p => p.price <= parseInt(activeFilters.maxPrice));
        if (activeFilters.amenities.length > 0) {
            result = result.filter(p => activeFilters.amenities.every(amenity => p.features.includes(amenity)));
        }
        if (activeFilters.category === 'hostel') {
            if (activeFilters.hostelGender && activeFilters.hostelGender !== 'all') result = result.filter(p => p.hostelGender === activeFilters.hostelGender);
            if (activeFilters.foodIncluded !== 'all') result = result.filter(p => p.foodIncluded === activeFilters.foodIncluded);
        }
        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return result;
    }, [activeFilters, sortBy, properties]);

    const totalPages = Math.ceil(filteredAndSortedProperties.length / ITEMS_PER_PAGE);
    const currentItems = filteredAndSortedProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleReset = () => {
        const reset: FilterState = { search: '', type: 'all', category: 'all', minPrice: '', maxPrice: '', district: '', amenities: [], hostelGender: 'all', foodIncluded: 'all' };
        setFilters(reset); setActiveFilters(reset); setCurrentPage(1);
    };

    const handleApply = () => {
        setActiveFilters(filters); setCurrentPage(1);
    };

    return (
        <div className="bg-[#fafafa] min-h-screen pb-32">
            {/* Cinematic Header -- Lighter Style */}
            <div className="bg-white pt-40 pb-20 border-b border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 [mask-image:linear-gradient(to_left,black,transparent)] pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                                <Building className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Smart Index v2.0</span>
                                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                                    <Globe className="h-3.3 w-3.5" /> Institutional Asset Registry
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-8 font-outfit tracking-tighter italic leading-none">
                            Discover <span className="text-indigo-600">Premium</span> <br />Real Estate Assets.
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium italic max-w-xl">
                            Nepal's premier institutional node for verified real estate discovery. Navigate a curated grid of high-performance assets with full legal transparency.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container className="mt-[-40px] relative z-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 items-start">
                    {/* Filters Sidebar -- Refined Node Style */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-24">
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] mb-4">
                                <div className="flex items-center gap-4 text-slate-900">
                                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                                        <SlidersHorizontal className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest italic">Node Filter</h3>
                                </div>
                            </div>
                            <div className="p-2">
                                <PropertyFilters
                                    filters={filters}
                                    onFilterChange={setFilters}
                                    onApply={handleApply}
                                    onReset={handleReset}
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Property List Area */}
                    <div className="lg:col-span-3">
                        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic">
                                    {filteredAndSortedProperties.length} Verified Nodes Discovered
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 min-w-[240px]">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex-shrink-0">Sort Strategy —</span>
                                <select
                                    className="bg-transparent border-none focus:ring-0 cursor-pointer text-slate-900 font-black text-[10px] uppercase tracking-widest outline-none w-full italic"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="latest">Newest First</option>
                                    <option value="price-low">Price: Ascending</option>
                                    <option value="price-high">Price: Descending</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center py-48 gap-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <div className="h-16 w-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 italic">Syncing Asset Registry...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <p className="text-red-600 font-black uppercase tracking-widest mb-10 italic">{error}</p>
                                <button onClick={() => window.location.reload()} className="h-12 px-10 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95">
                                    Re-Initialize Node
                                </button>
                            </div>
                        ) : currentItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <AnimatePresence mode="popLayout">
                                    {currentItems.map((property, idx) => (
                                        <motion.div
                                            key={property.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <PropertyCard property={property} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-48 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-50/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
                                <Search className="h-16 w-16 text-slate-100 mx-auto mb-8 group-hover:scale-110 transition-transform duration-700" />
                                <h3 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter italic mb-4">Zero Matching Nodes</h3>
                                <p className="text-slate-400 font-medium italic mb-12 max-w-sm mx-auto">"Our neural scan found no assets matching your current filtering parameters."</p>
                                <button onClick={handleReset} className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 relative z-10">
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination Area -- Institutional Style */}
                        {totalPages > 1 && (
                            <div className="mt-24 flex justify-center items-center gap-6">
                                <button
                                    className="h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center disabled:opacity-20 text-slate-900 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <div className="flex gap-3">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                                                currentPage === i + 1 
                                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 active:scale-95' 
                                                : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400'
                                            }`}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center disabled:opacity-20 text-slate-900 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
