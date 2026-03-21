'use client';

import { Search, Filter, Sparkles } from 'lucide-react';
import { ServiceCategory } from '@/types/service';
import { motion } from 'framer-motion';

interface ServiceFiltersProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    categoryFilter: string;
    onCategoryChange: (val: string) => void;
}

export const ServiceFilters = ({
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryChange
}: ServiceFiltersProps) => {
    const categories: { value: ServiceCategory | 'all', label: string }[] = [
        { value: 'all', label: 'All Services' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'legal', label: 'Legal' },
        { value: 'valuation', label: 'Valuation' },
        { value: 'moving', label: 'Movers' },
        { value: 'renovation', label: 'Renovation' },
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-10 items-center justify-between">
            <div className="relative w-full xl:w-[600px] group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-accent group-hover:scale-110 transition-transform">
                    <Search />
                </div>
                <input
                    type="text"
                    placeholder="Search by artisan name or city..."
                    className="w-full bg-white/60 backdrop-blur-md border border-accent/10 rounded-2xl pl-16 pr-8 py-6 text-sm focus:border-accent shadow-inner font-medium text-primary placeholder:text-gray-400 focus:ring-4 focus:ring-accent/5 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 no-scrollbar">
                {categories.map((cat, idx) => (
                    <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCategoryChange(cat.value)}
                        className={`whitespace-nowrap px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${categoryFilter === cat.value
                                ? 'bg-primary text-accent border-accent shadow-xl shadow-primary/20 scale-105'
                                : 'bg-white/60 text-primary border-accent/10 hover:border-accent hover:bg-white'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            {categoryFilter === cat.value && <Sparkles className="h-3 w-3" />}
                            {cat.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
