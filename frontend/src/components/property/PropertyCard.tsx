'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin, CheckCircle2, Crown, Sparkles, Heart, Play } from 'lucide-react';
import { Property, PropertyImage } from '@/types/property';
import { StatusBadge } from '../common/StatusBadge';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { getVibrantImage } from '@/lib/utils/images';
import { useState } from 'react';

interface PropertyCardProps {
    property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
    const [is3DMode, setIs3DMode] = useState(false);
    const mainImage = typeof property.images[0] === 'string' 
        ? property.images[0] 
        : (property.images[0] as unknown as PropertyImage)?.previewUrl || getVibrantImage(property.id);

    return (
        <motion.div 
            whileHover={{ y: -12 }}
            className="group relative bg-white rounded-[2.5rem] border border-accent/10 shadow-xl shadow-accent/5 hover:shadow-primary/15 transition-all duration-500 overflow-hidden"
        >
            <div className="relative h-[320px] overflow-hidden">
                <AnimatePresence mode="wait">
                    {!is3DMode ? (
                        <motion.div
                            key="standard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={mainImage}
                                alt={property.title}
                                fill
                                className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="3d-mode"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 premium-gradient flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="absolute inset-0 opacity-40">
                                <Image src={mainImage} alt="3D Background" fill className="object-cover blur-md" />
                            </div>
                            <div className="relative z-10">
                                <motion.div 
                                    animate={{ rotateY: [0, 360] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="h-24 w-24 bg-accent rounded-2xl flex items-center justify-center shadow-gold-glow border border-white/20 mb-6 mx-auto"
                                >
                                    <Sparkles className="h-12 w-12 text-primary" />
                                </motion.div>
                                <h4 className="text-white font-serif text-xl mb-2">3D Virtual Projection</h4>
                                <p className="text-accent text-[10px] font-black uppercase tracking-widest px-4">Calibrating spatial coordinates for {property.title}...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Status & Verification Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
                    <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl p-1 shadow-2xl">
                        <StatusBadge status={property.status} />
                    </div>
                    {property.isVerified && (
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 w-fit rounded-full bg-accent px-4 py-2 text-[10px] font-black text-primary shadow-xl border border-white/20 uppercase tracking-[0.2em]"
                        >
                            <Crown className="h-3.5 w-3.5" /> Imperial Seal
                        </motion.div>
                    )}
                </div>

                {/* Like Button */}
                <button className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-accent hover:text-primary transition-all shadow-xl group/like z-20">
                    <Heart className="h-5 w-5 group-hover/like:fill-current" />
                </button>

                {/* 3D Video Button Overlay */}
                <button 
                    onClick={() => setIs3DMode(!is3DMode)}
                    className="absolute bottom-24 right-6 bg-accent text-primary px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/30 flex items-center gap-2 z-30 hover:scale-110 active:scale-95 transition-all"
                >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {is3DMode ? 'Exit Vision' : 'View 3D Video'}
                </button>

                {/* Price Label */}
                <Link href={`/properties/${property.id}`} className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="bg-primary/80 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl flex justify-between items-center group-hover:translate-y-[-10px] transition-transform duration-500">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-0.5">Valuation</p>
                            <div className="text-xl font-serif text-white">
                                {formatNPR(property.price)}
                                {property.type === 'rent' && <span className="text-xs font-normal opacity-60 ml-1">/mo</span>}
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>

            <div className="p-8">
                <div className="flex items-center gap-2 mb-4 text-accent">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">
                        {property.city}, {property.location}
                    </span>
                </div>
                
                <Link href={`/properties/${property.id}`} className="block">
                    <h3 className="mb-6 text-2xl font-serif text-primary line-clamp-1 group-hover:text-accent transition-colors leading-tight">
                        {property.title}
                    </h3>
                </Link>

                <div className="flex items-center justify-between border-t border-accent/10 pt-6">
                    <div className="flex flex-col items-center gap-1 group/spec">
                        <Bed className="h-5 w-5 text-gray-300 group-hover:text-accent transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">{property.bedrooms} Bed</span>
                    </div>
                    <div className="h-8 w-px bg-accent/10" />
                    <div className="flex flex-col items-center gap-1 group/spec">
                        <Bath className="h-5 w-5 text-gray-300 group-hover:text-accent transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">{property.bathrooms} Bath</span>
                    </div>
                    <div className="h-8 w-px bg-accent/10" />
                    <div className="flex flex-col items-center gap-1 group/spec">
                        <Maximize2 className="h-5 w-5 text-gray-300 group-hover:text-accent transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">{property.area} sq.ft.</span>
                    </div>
                </div>
            </div>
            
            {/* 3D Decorative Gradient */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};

export default PropertyCard;
