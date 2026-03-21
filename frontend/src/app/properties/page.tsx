'use client';

import { useState, useMemo, useEffect } from 'react';
import Container from '@/components/layout/Container';
import PropertyFilters, { FilterState } from '@/components/property/PropertyFilters';
import PropertyCard from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Loader2, Crown, Sparkles, SlidersHorizontal, ArrowRight, ArrowLeft, Search, Navigation } from 'lucide-react';
import { Property } from '@/types/property';
import api from '@/lib/api/http';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 6;

// Map backend API fields to frontend Property type
function mapProperty(p: any): Property {
    return {
        id: p.id ?? p.PropertyID ?? '',
        sellerId: p.sellerId ?? p.owner?.id ?? '',
        title: p.title ?? 'Untitled Estate',
        description: p.description ?? '',
        price: Number(p.price) || 0,
        location: p.location ?? p.address ?? 'Nepal',
        address: p.address ?? p.location ?? '',
        city: p.city ?? '',
        lat: p.lat ?? p.latitude,
        lng: p.lng ?? p.longitude,
        type: p.type ?? p.property_type ?? 'sale',
        category: p.category ?? 'house',
        bedrooms: Number(p.bedrooms) || 0,
        bathrooms: Number(p.bathrooms) || 0,
        area: Number(p.area) || Number(p.area_sqft) || 0,
        images: p.images ?? [],
        documents: p.documents ?? [],
        status: p.status ?? 'PUBLISHED',
        isVerified: p.isVerified ?? p.is_verified ?? false,
        features: p.features ?? [],
        createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
        updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
    };
}

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
                const response = await api.get('/properties/');
                const data = Array.isArray(response.data) ? response.data : response.data?.results ?? [];
                setProperties(data.map(mapProperty));
            } catch {
                setError('Failed to summon local registers');
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
        if (activeFilters.type !== 'all') {
            result = result.filter(p => p.type === activeFilters.type);
        }
        if (activeFilters.category !== 'all') {
            result = result.filter(p => p.category === activeFilters.category);
        }
        if (activeFilters.minPrice) {
            result = result.filter(p => p.price >= parseInt(activeFilters.minPrice));
        }
        if (activeFilters.maxPrice) {
            result = result.filter(p => p.price <= parseInt(activeFilters.maxPrice));
        }
        if (activeFilters.amenities.length > 0) {
            result = result.filter(p =>
                activeFilters.amenities.every(amenity => p.features.includes(amenity))
            );
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
        const reset: FilterState = { search: '', type: 'all', category: 'all', minPrice: '', maxPrice: '', district: '', amenities: [] };
        setFilters(reset); setActiveFilters(reset); setCurrentPage(1);
    };

    const handleApply = () => {
        setActiveFilters(filters); setCurrentPage(1);
    };

    return (
        <div className="bg-[#fffdf9] min-h-screen pb-32">
            <div className="premium-gradient text-white py-24 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Crown className="h-6 w-6 text-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">The Imperial Collection</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-serif mb-6 leading-[0.9]">Estate Registry</h1>
                        <p className="text-xl text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8">
                            Discerning the finest sanctuaries in the realm. Currently overlooking an archive of {properties.length} authenticated estates.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 items-start">
                    {/* Filters Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 sticky top-24"
                    >
                        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 border border-accent/20 shadow-2xl shadow-accent/5 border-t-8 border-t-accent">
                            <div className="flex items-center gap-3 mb-8 text-primary">
                                <SlidersHorizontal className="h-5 w-5 text-accent" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Adjust Perspective</h3>
                            </div>
                            <PropertyFilters
                                filters={filters}
                                onFilterChange={setFilters}
                                onApply={handleApply}
                                onReset={handleReset}
                            />
                        </div>
                    </motion.div>

                    {/* Property List */}
                    <div className="lg:col-span-3">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 px-4"
                        >
                            <div className="flex items-center gap-4">
                                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                                <p className="text-sm font-black uppercase tracking-widest text-gray-400 italic">
                                    {filteredAndSortedProperties.length} Matches in Registry
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-accent/10 shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Order by:</span>
                                <select
                                    className="bg-transparent border-none focus:ring-0 cursor-pointer text-accent font-black text-xs uppercase tracking-widest"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="latest">Latest Seals</option>
                                    <option value="price-low">Entry Valuation</option>
                                    <option value="price-high">Peak Valuation</option>
                                </select>
                            </div>
                        </motion.div>

                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center py-40 gap-6">
                                <div className="h-16 w-16 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-gold-glow" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">Summoning Registers...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-red-100">
                                <p className="text-serif text-xl text-red-600 mb-6">{error}</p>
                                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full px-10 h-14 font-black uppercase tracking-widest text-[10px] border-red-100 text-red-600 hover:bg-red-50">Retry Manifest</Button>
                            </div>
                        ) : currentItems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                                <AnimatePresence mode="popLayout">
                                    {currentItems.map((property, idx) => (
                                        <motion.div
                                            key={property.id}
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <PropertyCard property={property} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-accent/20">
                                <Navigation className="h-16 w-16 text-accent/20 mx-auto mb-6" />
                                <h3 className="text-3xl font-serif text-primary mb-2">No Records Exist</h3>
                                <p className="text-gray-400 font-medium italic mb-10">Your perspective yields no results in this sector of the realm.</p>
                                <Button className="h-16 px-12 bg-primary text-accent rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-accent hover:text-primary transition-all" onClick={handleReset}>Clear All Decrees</Button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-20 flex justify-center items-center gap-4"
                            >
                                <Button
                                    className="h-12 w-12 rounded-full border border-accent/20 disabled:opacity-30 text-primary"
                                    variant="ghost"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>

                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`h-12 w-12 rounded-full font-black text-xs transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-primary text-accent shadow-xl scale-110' 
                                                : 'bg-white border border-accent/10 text-gray-400 hover:border-accent/30'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    className="h-12 w-12 rounded-full border border-accent/20 disabled:opacity-30 text-primary"
                                    variant="ghost"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
