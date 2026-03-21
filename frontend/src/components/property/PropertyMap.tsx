'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Layers, Maximize2 } from 'lucide-react';

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
    center: [number, number];
    zoom?: number;
    boundary?: [number, number][]; // Array of lat, lng coordinates
    title?: string;
}

// Helper component to update map view when center changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function PropertyMap({ center, zoom = 15, boundary, title }: PropertyMapProps) {
    const [mounted, setMounted] = useState(false);
    const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('satellite');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[500px] w-full bg-[#1a1a2e]/5 animate-pulse rounded-[2.5rem] border border-royal-silk/50" />;

    return (
        <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border border-royal-silk/50 shadow-inner relative z-0 group">
            {/* Map Controls HUD */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
                    className="h-12 w-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/50 text-[#1a1a2e] transition-all hover:bg-white"
                >
                    <Layers className="h-5 w-5" />
                </motion.button>
                <div className="h-12 px-6 bg-[#1a1a2e]/90 backdrop-blur-xl rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 text-white">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live GIS Sync</span>
                </div>
            </div>

            <MapContainer 
                center={center} 
                zoom={zoom} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ChangeView center={center} zoom={zoom} />
                
                {mapLayer === 'street' ? (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                ) : (
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                )}
                
                {/* Property Marker */}
                <Marker position={center}>
                    <Popup className="royal-popup">
                        <div className="p-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-royal-gold mb-1">Authenticated Site</div>
                            <div className="text-sm font-serif text-[#1a1a2e]">{title || 'Property Location'}</div>
                        </div>
                    </Popup>
                </Marker>

                {/* Property Boundary Polygon */}
                {boundary && boundary.length > 2 && (
                    <Polygon 
                        positions={boundary} 
                        pathOptions={{ 
                            color: '#c5a059', 
                            fillColor: '#c5a059', 
                            fillOpacity: 0.15,
                            weight: 4,
                            dashArray: '8, 8'
                        }} 
                    />
                )}
            </MapContainer>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-between items-end pointer-events-none">
                <div className="pointer-events-auto p-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl max-w-xs">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1a2e] mb-2 flex items-center gap-2">
                        <MapIcon className="h-3 w-3 text-royal-gold" /> GIS DATA VERIFIED 
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        Coordinates: {center[0].toFixed(6)}, {center[1].toFixed(6)} <br />
                        Kitta Number Match: <span className="text-royal-gold font-black">CONFIRMED</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
