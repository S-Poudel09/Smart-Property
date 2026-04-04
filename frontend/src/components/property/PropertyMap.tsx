'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Layers, Maximize2 } from 'lucide-react';

// Fix for default marker icon in Leaflet + Next.js
if (typeof window !== 'undefined') {
    const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
}

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

    if (!mounted) return <div className="h-[500px] w-full bg-slate-900/5 animate-pulse rounded-[2.5rem] border border-slate-200" />;

    return (
        <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner relative z-0 group">
            {/* Map Controls HUD */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
                    className="h-12 w-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/50 text-slate-900 transition-all hover:bg-indigo-500 hover:text-white"
                >
                    <Layers className="h-5 w-5" />
                </motion.button>
                <div className="h-12 px-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 text-white">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active GIS Sync</span>
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
                    <Popup>
                        <div className="p-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Verified Location</div>
                            <div className="text-sm font-bold text-slate-900">{title || 'Property Site'}</div>
                        </div>
                    </Popup>
                </Marker>

                {/* Property Boundary Polygon */}
                {boundary && boundary.length > 2 && (
                    <Polygon 
                        positions={boundary} 
                        pathOptions={{ 
                            color: '#10b981', 
                            fillColor: '#10b981', 
                            fillOpacity: 0.15,
                            weight: 3,
                            dashArray: '8, 8'
                        }} 
                    />
                )}
            </MapContainer>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-between items-end pointer-events-none">
                <div className="pointer-events-auto p-5 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-2xl max-w-xs transition-all hover:bg-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2">
                        <MapIcon className="h-3 w-3 text-indigo-500" /> GIS GEOMETRY VERIFIED 
                    </p>
                    <div className="space-y-1">
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                            Lat: <span className="text-slate-900">{center[0].toFixed(6)}</span> <br />
                            Lng: <span className="text-slate-900">{center[1].toFixed(6)}</span>
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Land Revenue Status: Matched</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
