'use client';

import { useState } from 'react';

import { ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils/images';

interface PropertyGalleryProps {
    images: (string | { previewUrl: string; image?: string })[];
}

const PropertyGallery = ({ images }: PropertyGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const galleryImages = Array.isArray(images) && images.length > 0 
        ? images.map(img => {
            const url = typeof img === 'string' ? img : (img?.image || img?.previewUrl || '');
            return getFullImageUrl(url);
        }).filter(url => url !== '')
        : ['https://placehold.co/800x600/FDFBF8/1A1A1A?font=inter&text=Property+Image+Unavailable'];

    const next = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    return (
        <div className="space-y-4">
            <div className="group relative aspect-video overflow-hidden rounded-2xl bg-gray-100">
                <img
                    src={galleryImages[currentIndex]}
                    alt={`Property image ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-500"
                    loading="eager"
                />

                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={prev}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md backdrop-blur-sm hover:bg-white"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={next}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md backdrop-blur-sm hover:bg-white"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                <button className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-black/70">
                    <Maximize className="h-4 w-4" />
                    View All Photos
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {galleryImages.slice(0, 4).map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative aspect-video overflow-hidden rounded-lg transition-all border-2 ${
                            currentIndex === idx ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PropertyGallery;
