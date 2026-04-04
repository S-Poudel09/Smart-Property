'use client';

import { Search, RotateCcw, Filter, Map, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyCategory } from '@/types/property';
import { NEPAL_PROPERTY_CATEGORIES, NEPAL_AMENITIES, NEPAL_DISTRICTS } from '@/lib/utils/currency';

export interface FilterState {
    search: string;
    type: 'sale' | 'rent' | 'all';
    category: PropertyCategory | 'all';
    minPrice: string;
    maxPrice: string;
    district: string;
    amenities: string[];
    hostelGender?: 'all' | 'boys' | 'girls' | 'mixed';
    foodIncluded?: boolean | 'all';
}

interface PropertyFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onApply: () => void;
    onReset: () => void;
}

const PropertyFilters = ({ filters, onFilterChange, onApply, onReset }: PropertyFiltersProps) => {
    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const toggleAmenity = (amenity: string) => {
        const newAmenities = filters.amenities.includes(amenity)
            ? filters.amenities.filter((a) => a !== amenity)
            : [...filters.amenities, amenity];
        updateFilter('amenities', newAmenities);
    };

    return (
        <div className="space-y-8">
            {/* Search Node */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic ml-1 flex items-center gap-2">
                    <Search className="h-3 w-3" /> Keyword Scan
                </label>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="District, Ward, Landmark..."
                        className="w-full h-14 pl-6 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 outline-none transition-all placeholder:text-slate-300 italic"
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>
            </div>

            {/* Type Protocol */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic ml-1 flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Asset Status
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {['all', 'sale', 'rent'].map((t) => (
                        <button
                            key={t}
                            onClick={() => updateFilter('type', t as any)}
                            className={`h-10 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all italic ${filters.type === t
                                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                                    : 'text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Registry */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic ml-1 flex items-center gap-2">
                    <Map className="h-3 w-3" /> Zone Distribution
                </label>
                <div className="relative">
                    <select
                        className="w-full h-14 pl-6 pr-10 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 outline-none transition-all cursor-pointer appearance-none italic"
                        value={filters.district || ''}
                        onChange={(e) => updateFilter('district', e.target.value)}
                    >
                        <option value="">Global Network (NP)</option>
                        {NEPAL_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                        <Filter className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Category Cluster */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic ml-1 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> Usage Taxonomy
                </label>
                <select
                    className="w-full h-14 pl-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 outline-none transition-all cursor-pointer italic"
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value as any)}
                >
                    {NEPAL_PROPERTY_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            <AnimatePresence>
                {filters.category === 'hostel' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 pt-6 border-t border-slate-100 overflow-hidden"
                    >
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 italic ml-1">Admission Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['boys', 'girls', 'mixed'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => updateFilter('hostelGender', g as any)}
                                        className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic border ${filters.hostelGender === g
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded-lg border-indigo-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                checked={!!filters.foodIncluded}
                                onChange={(e) => updateFilter('foodIncluded', e.target.checked)}
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 italic">Full Mess Package</span>
                        </label>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Price Topology */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic ml-1">Capital Bounds (NPR)</label>
                <div className="flex items-center gap-3">
                    <input
                        placeholder="Minimum"
                        type="number"
                        className="w-full h-14 pl-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-200 italic"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                    />
                    <div className="w-4 h-[1.5px] bg-slate-200 flex-shrink-0" />
                    <input
                        placeholder="Maximum"
                        type="number"
                        className="w-full h-14 pl-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-200 italic"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    />
                </div>
            </div>

            {/* Comms & Actions */}
            <div className="pt-8 flex flex-col gap-3">
                <button 
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-95 transition-all hover:bg-black italic"
                    onClick={onApply}
                >
                    <Search className="h-4 w-4" /> Commit Search Scan
                </button>
                <button 
                    className="w-full h-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all italic"
                    onClick={onReset}
                >
                    <RotateCcw className="h-3 w-3" /> Re-Initialize Node
                </button>
            </div>
        </div>
    );
};

export default PropertyFilters;
