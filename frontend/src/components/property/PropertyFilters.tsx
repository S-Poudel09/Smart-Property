'use client';

import { Search, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
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
    // Hostel specific
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
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50 gap-1"
                    onClick={onReset}
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </Button>
            </div>

            <div className="space-y-6">
                <div>
                    <Input
                        placeholder="Search by location or ward..."
                        label="Location"
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>

                {/* District / City Filter */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">District / City</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.district || ''}
                        onChange={(e) => updateFilter('district', e.target.value)}
                    >
                        <option value="">All Locations</option>
                        {NEPAL_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Property Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['all', 'sale', 'rent'].map((t) => (
                            <button
                                key={t}
                                onClick={() => updateFilter('type', t as 'sale' | 'rent' | 'all')}
                                className={`rounded-md border py-2 text-sm font-medium transition-all capitalize ${filters.type === t
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.category}
                        onChange={(e) => updateFilter('category', e.target.value as PropertyCategory | 'all')}
                    >
                        {NEPAL_PROPERTY_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                {filters.category === 'hostel' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2 border-t border-gray-100"
                    >
                        <div>
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Hostel For</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['boys', 'girls', 'mixed'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => updateFilter('hostelGender', g as any)}
                                        className={`rounded-lg border py-2 text-[11px] font-bold transition-all capitalize ${filters.hostelGender === g
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="food"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                checked={filters.foodIncluded === true}
                                onChange={(e) => updateFilter('foodIncluded', e.target.checked)}
                            />
                            <label htmlFor="food" className="text-sm font-bold text-gray-700 cursor-pointer">Food Included</label>
                        </div>
                    </motion.div>
                )}

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Price Range (Rs)</label>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Min (Rs)"
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => updateFilter('minPrice', e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                            placeholder="Max (Rs)"
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Amenities & Nearby</label>
                    <div className="space-y-2">
                        {NEPAL_AMENITIES.map((amenity) => (
                            <label key={amenity} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={filters.amenities.includes(amenity)}
                                    onChange={() => toggleAmenity(amenity)}
                                />
                                {amenity}
                            </label>
                        ))}
                    </div>
                </div>

                <Button className="w-full gap-2" onClick={onApply}>
                    <Search className="h-4 w-4" />
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};

export default PropertyFilters;
