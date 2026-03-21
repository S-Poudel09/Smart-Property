'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize } from 'lucide-react';

interface PropertyGalleryProps {
    images: string[];
}

const PropertyGallery = ({ images }: PropertyGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter out invalid images or use placeholders if empty
    const galleryImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=800',
    ];

    const next = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    return (
        <div className="space-y-4">
            <div className="group relative aspect-video overflow-hidden rounded-2xl bg-gray-100">
                <Image
                    src={galleryImages[currentIndex]}
                    alt={`Property image ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-all duration-500"
                    priority
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
                        className={`relative aspect-video overflow-hidden rounded-lg transition-all ${currentIndex === idx ? 'ring-2 ring-blue-600' : 'opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PropertyGallery;
