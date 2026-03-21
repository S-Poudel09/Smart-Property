import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
    location?: string;
    className?: string;
}

const MapPlaceholder = ({ location = 'Property Location', className = '' }: MapPlaceholderProps) => {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,0,0,0/800x400?access_token=none')] opacity-20 filter grayscale"></div>
            <div className="relative z-10 flex flex-col items-center gap-3 text-center p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <MapPin className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">Map View Available</h4>
                    <p className="text-sm text-gray-500 mt-1">{location}</p>
                </div>
                <p className="max-w-[240px] text-xs text-gray-400 mt-2">
                    Interactive map integration is coming soon in Phase 2.
                </p>
            </div>
        </div>
    );
};

export default MapPlaceholder;
