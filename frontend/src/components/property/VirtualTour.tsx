'use client';

import { useState } from 'react';
import { Maximize, Minimize, Play } from 'lucide-react';

interface VirtualTourProps {
    tourUrl: string;
    title?: string;
}

export default function VirtualTour({ tourUrl, title }: VirtualTourProps) {
    const [isFullPage, setIsFullPage] = useState(false);

    if (!tourUrl) return null;

    return (
        <div className={`relative rounded-2xl overflow-hidden bg-gray-900 group ${isFullPage ? 'fixed inset-0 z-50' : 'aspect-video w-full border'}`}>
            <iframe
                src={tourUrl}
                title={title || "Virtual Tour"}
                className="w-full h-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            
            {/* Overlay Controls */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => setIsFullPage(!isFullPage)}
                    className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors"
                >
                    {isFullPage ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
            </div>

            {/* Initial Placeholder if needed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                    <Play className="h-8 w-8 fill-current" />
                </div>
                <p className="font-bold text-lg">Interactive 360° Tour</p>
                <p className="text-sm text-gray-200">Click to explore the property</p>
            </div>
        </div>
    );
}
