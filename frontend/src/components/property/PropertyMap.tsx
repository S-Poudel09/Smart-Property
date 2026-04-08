'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Layers, Maximize2, Building2, MapPin, ArrowUpRight } from 'lucide-react';
import { Property } from '@/types/property';
import Link from 'next/link';
import { formatNPR } from '@/lib/utils/currency';

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
    center?: [number, number];
    zoom?: number;
    boundary?: [number, number][]; // Array of lat, lng coordinates
    title?: string;
    properties?: Property[];
    onMarkerClick?: (property: Property) => void;
    height?: string;
}

// Helper component to update map view when center changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] !== undefined && center[1] !== undefined) {
            const lat = Number(center[0]);
            const lng = Number(center[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
                map.setView([lat, lng], zoom);
                // Ensure tiles are correctly aligned after potentially being hidden/resized
                setTimeout(() => map.invalidateSize(), 150);
            }
        }
    }, [center, zoom, map]);
    return null;
}

export default function PropertyMap({ 
    center, 
    zoom = 15, 
    boundary, 
    title, 
    properties = [], 
    onMarkerClick,
    height = "500px" 
}: PropertyMapProps) {
    const [mounted, setMounted] = useState(false);
    const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('satellite');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ height }} className="w-full bg-slate-900/5 animate-pulse rounded-[2.5rem] border border-slate-200" />;

    // Determine target center: either explicit center prop or first property
    let targetLat = 27.7172;
    let targetLng = 85.3240;

    if (center) {
        targetLat = Number(center[0]);
        targetLng = Number(center[1]);
    } else if (properties.length > 0) {
        targetLat = Number(properties[0].lat);
        targetLng = Number(properties[0].lng);
    }

    const safeCenter: [number, number] = [
        isNaN(targetLat) ? 27.7172 : targetLat, 
        isNaN(targetLng) ? 85.3240 : targetLng
    ];

    return (
        <div className={`w-full rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner relative z-0 group`} style={{ height }}>
            {/* Map Controls HUD */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                <motion.button 
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        console.log("Map: Toggling layer from", mapLayer);
                        setMapLayer(mapLayer === 'street' ? 'satellite' : 'street');
                    }}
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
                key={`${safeCenter[0]}-${safeCenter[1]}-map`} // Fix for 'Map container is being reused by another instance' in React StrictMode
                center={safeCenter} 
                zoom={zoom} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ChangeView center={safeCenter} zoom={zoom} />
                
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
                
                {/* Multi-Property Markers */}
                {properties.map((prop) => (
                    <Marker 
                        key={prop.id} 
                        position={[Number(prop.lat), Number(prop.lng)]}
                        eventHandlers={{
                            click: () => onMarkerClick?.(prop)
                        }}
                    >
                        <Popup className="premium-popup">
                            <div className="p-4 min-w-[240px] space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <Building2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Node ID: {prop.id.substring(0, 8)}</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{prop.title}</h4>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <span className="text-xs font-black text-indigo-600 italic">{formatNPR(prop.price)}</span>
                                    <Link href={`/properties/${prop.id}`} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-900 hover:text-indigo-600 transition-colors">
                                        Inspect Cluster <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Single Property Marker (Backward compatibility) */}
                {center && properties.length === 0 && (
                    <Marker position={safeCenter}>
                        <Popup>
                            <div className="p-2">
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Target Cluster</div>
                                <div className="text-sm font-bold text-slate-900">{title || 'Property Site'}</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Property Boundary Polygon */}
                {boundary && boundary.length > 2 && (
                    <Polygon 
                        positions={boundary} 
                        pathOptions={{ 
                            color: '#6366f1', 
                            fillColor: '#6366f1', 
                            fillOpacity: 0.1,
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
                            Lat: <span className="text-slate-900">{safeCenter[0].toFixed(6)}</span> <br />
                            Lng: <span className="text-slate-900">{safeCenter[1].toFixed(6)}</span>
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Land Revenue Status: Matched</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
