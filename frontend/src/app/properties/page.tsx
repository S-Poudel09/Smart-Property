'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import PropertyFilters, { FilterState } from '@/components/property/PropertyFilters';
import PropertyCard from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Property } from '@/types/property';
import api from '@/lib/api/http';
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
                setError('Failed to fetch properties. Please try again later.');
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
        if (activeFilters.category === 'hostel') {
            if (activeFilters.hostelGender && activeFilters.hostelGender !== 'all') {
                result = result.filter(p => p.hostelGender === activeFilters.hostelGender);
            }
            if (activeFilters.foodIncluded !== 'all') {
                result = result.filter(p => p.foodIncluded === activeFilters.foodIncluded);
            }
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
        <div className="bg-background min-h-screen">
            {/* Header Section */}
            <div className="bg-primary pt-32 pb-24 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <nav className="flex items-center gap-2 mb-6 text-white/60 text-sm font-medium">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">Properties</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Explore Properties</h1>
                        <p className="text-lg text-white/70 leading-relaxed font-medium">
                            Discover the most authentic and verified real estate listings across Nepal. Your journey to property ownership starts here.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container className="py-12 md:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 items-start">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-8 border border-border shadow-sm sticky top-24">
                            <div className="flex items-center gap-3 mb-8 text-gray-900 border-b border-gray-100 pb-4">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                <h3 className="text-base font-bold">Filters</h3>
                            </div>
                            <PropertyFilters
                                filters={filters}
                                onFilterChange={setFilters}
                                onApply={handleApply}
                                onReset={handleReset}
                            />
                        </div>
                    </aside>

                    {/* Property List Area */}
                    <div className="lg:col-span-3">
                        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    {filteredAndSortedProperties.length} Properties Available
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-border">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort By:</span>
                                <select
                                    className="bg-transparent border-none focus:ring-0 cursor-pointer text-gray-900 font-bold text-xs uppercase tracking-widest outline-none"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="latest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center py-40 gap-4">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading properties...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-border shadow-sm">
                                <p className="text-red-600 font-bold mb-6">{error}</p>
                                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full px-10 font-bold">
                                    Retry
                                </Button>
                            </div>
                        ) : currentItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {currentItems.map((property, idx) => (
                                        <motion.div
                                            key={property.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <PropertyCard property={property} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-white rounded-2xl border border-border shadow-sm">
                                <Search className="h-12 w-12 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
                                <p className="text-gray-500 mb-10">We couldn't find any properties matching your current filters.</p>
                                <Button onClick={handleReset} className="px-10 font-bold h-12 rounded-full">
                                    Reset Filters
                                </Button>
                            </div>
                        )}

                        {/* Pagination Area */}
                        {totalPages > 1 && (
                            <div className="mt-20 flex justify-center items-center gap-3">
                                <button
                                    className="h-10 w-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 text-gray-500 hover:bg-gray-50 transition-colors"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`h-10 w-10 rounded-full font-bold text-xs transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-primary text-white shadow-md' 
                                                : 'bg-white border border-border text-gray-500 hover:border-primary/30'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="h-10 w-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 text-gray-500 hover:bg-gray-50 transition-colors"
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

