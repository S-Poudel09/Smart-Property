'use client';

import Link from 'next/link';
import { MapPin, Bed, Bath, Square, ChevronRight, Heart, ArrowRight } from 'lucide-react';
import { Property, PropertyImage } from '@/types/property';
import { motion } from 'framer-motion';
import { getVibrantImage } from '@/lib/utils/images';
import { Button } from '@/components/common/Button';

interface PropertyCardProps {
    property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
    const imageUrl = property.images && property.images.length > 0
        ? (typeof property.images[0] === 'string' 
            ? property.images[0] 
            : (property.images[0] as unknown as PropertyImage)?.previewUrl)
        : getVibrantImage(property.id);

    return (
        <div
            className="premium-card group bg-white overflow-hidden shadow-sm"
        >
            <Link href={`/properties/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={property.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-5 right-5 flex gap-2">
                    <button className="h-10 w-10 bg-white/90 backdrop-blur-md rounded-xl text-muted hover:text-danger hover:bg-white transition-all shadow-lg shadow-black/5 flex items-center justify-center">
                        <Heart className="h-5 w-5" />
                    </button>
                </div>
                {property.status && (
                    <div className="absolute top-5 left-5">
                        <div className="bg-primary/90 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-primary/20">
                            {property.status}
                        </div>
                    </div>
                )}
            </Link>

            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">{property.type || 'Residential'}</span>
                        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1 font-outfit">
                            {property.title}
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-foreground font-outfit">
                            Rs {Number(property.price).toLocaleString()}
                        </div>
                    </div>
                </div>

                <p className="text-muted text-sm line-clamp-2 mb-8 h-10 font-medium">
                    {property.description}
                </p>

                <div className="flex items-center justify-between py-6 border-y border-border/50 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Bed className="h-4 w-4 text-muted" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{property.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Bath className="h-4 w-4 text-muted" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{property.bathrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Square className="h-4 w-4 text-muted" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{property.area || 0} sqft</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted max-w-[150px]">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold truncate tracking-tight">{property.location || property.city}</span>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                        <Button variant="ghost" className="h-10 px-0 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-transparent group/btn">
                            View Details
                            <ArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
