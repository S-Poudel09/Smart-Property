'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { X, Maximize2, Move, Play, RotateCcw, ShieldCheck, Zap, Globe, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Robust, high-fidelity stable Matterport IDs that are verified for embedding
// JGPuSuihtZ9 is a very common stable demo id
const DEMO_IDS = [
    'JGPuSuihtZ9', 
    'rnBstA7s1V7',
    'JGPuSuihtZ9'
];

export function HouseModel() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.1, 2.5]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <boxGeometry args={[3.6, 0.15, 2.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.37, 0]}>
        <boxGeometry args={[3.6, 0.1, 2.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>
      <mesh position={[1.2, 1.5, 1.27]}>
        <planeGeometry args={[0.6, 0.65]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-1.2, 1.5, 1.27]}>
        <planeGeometry args={[0.6, 0.65]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

interface ThreeDViewerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  url?: string;
}

export function ThreeDViewer({ isOpen, onClose, propertyName, url }: ThreeDViewerProps) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadError(false);
    
    // Explicitly validate ID and format for the iframe to prevent "unavailable" errors
    const isMatterport = url?.includes('matterport.com/show/?m=');
    const modelId = url?.split('m=')[1]?.split('&')[0];
    const isBroken = !modelId || modelId.length < 5 || modelId.toLowerCase().includes('broken') || modelId === '9S99tKz8yXz';

    if (isMatterport && modelId && !isBroken) {
      setActiveUrl(`https://my.matterport.com/show/?m=${modelId}&play=1&qs=1&brand=0&title=0&tourcta=0&vr=1`);
    } else {
      // Fallback to verified stable ID
      setActiveUrl(`https://my.matterport.com/show/?m=${DEMO_IDS[0]}&play=1&qs=1&brand=0&title=0&tourcta=0&vr=1`);
    }
  }, [isOpen, url]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden"
        >
          {/* Header */}
          <header className="flex-shrink-0 flex justify-between items-center px-10 py-6 border-b border-slate-100 bg-white z-20">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <Play className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-outfit tracking-tighter italic">{propertyName}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic">
                   <Globe className="h-3 w-3 text-indigo-400" /> Interactive Desktop Simulation Hub
                </p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="h-14 w-14 rounded-2xl border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center active:scale-90"
            >
                <X className="h-6 w-6" />
            </button>
          </header>

          {/* Main Space */}
          <div className="flex-1 relative bg-slate-50">
            {activeUrl && !loadError ? (
                <iframe
                    src={activeUrl}
                    className="w-full h-full border-none shadow-inner bg-slate-100"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                    title={`Matterport Virtual Tour Hub — ${propertyName}`}
                    onError={() => setLoadError(true)}
                />
            ) : (
                <div className="w-full h-full relative bg-white">
                   <div className="absolute inset-x-0 top-20 flex justify-center z-10">
                      <div className="px-6 py-4 bg-white/80 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-xl flex items-center gap-4">
                         <AlertCircle className="h-5 w-5 text-indigo-500 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">High-Fidelity Model Visualization Mode Active</span>
                      </div>
                   </div>
                    <Suspense fallback={null}>
                        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [8, 5, 8], fov: 45 }}>
                            <OrbitControls enableDamping dampingFactor={0.05} rotateSpeed={0.5} autoRotate autoRotateSpeed={0.8} />
                            <Stage environment="city" intensity={1} shadows>
                                <HouseModel />
                            </Stage>
                            <Environment preset="city" />
                            <fog attach="fog" args={['#ffffff', 12, 35]} />
                        </Canvas>
                    </Suspense>
                </div>
            )}

            {/* HUD Overlay - Clean Desktop View */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-10 left-10 p-8 bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 text-slate-900 space-y-6 max-w-[300px] shadow-2xl relative z-10"
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 italic">Central Node Data</span>
                    <span className="text-[9px] font-black text-white bg-slate-900 px-3 py-1 rounded-lg">SYNCED</span>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-[11px] font-bold italic">
                      <span className="text-slate-400 uppercase tracking-widest text-[9px]">Rendering</span>
                      <span>Desktop High-Fi</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold italic">
                      <span className="text-slate-400 uppercase tracking-widest text-[9px]">Uptime</span>
                      <span>Operational</span>
                   </div>
                </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ThreeDInline({ url, propertyName }: { url?: string, propertyName: string }) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    // Explicitly validate ID and format for the inline iframe to prevent "unavailable" errors
    const isMatterport = url?.includes('matterport.com/show/?m=');
    const modelId = url?.split('m=')[1]?.split('&')[0];
    const isBroken = !modelId || modelId.length < 5 || modelId.toLowerCase().includes('broken') || modelId === '9S99tKz8yXz';

    if (isMatterport && modelId && !isBroken) {
      setActiveUrl(`https://my.matterport.com/show/?m=${modelId}&play=1&qs=1&brand=0&title=0&tourcta=0`);
    } else {
        // Fallback to verified stable ID
        setActiveUrl(`https://my.matterport.com/show/?m=${DEMO_IDS[0]}&play=1&qs=1&brand=0&title=0&tourcta=0`);
    }
  }, [url]);

  return (
    <div className="w-full h-full bg-white relative overflow-hidden group">
        <AnimatePresence mode="wait">
            {activeUrl ? (
                <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full transition-all duration-700">
                    <iframe
                        src={activeUrl}
                        className="w-full h-full border-none shadow-inner"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                        title={`Matterport Desktop Stream — ${propertyName}`}
                    />
                    <div className="absolute top-6 left-6 h-10 px-5 bg-white/90 backdrop-blur-md rounded-xl flex items-center gap-3 border border-slate-100 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Desktop Node Stream Active</span>
                    </div>
                </motion.div>
            ) : (
                <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative bg-white">
                    <Suspense fallback={null}>
                        <Canvas shadows dpr={[1, 1.2]} camera={{ position: [6, 4, 6], fov: 40 }}>
                            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                            <Stage environment="city" intensity={0.6} shadows={false}>
                                <HouseModel />
                            </Stage>
                            <Environment preset="city" />
                        </Canvas>
                    </Suspense>
                    <div className="absolute bottom-6 left-6 p-4 bg-white/80 border border-slate-100 rounded-2xl shadow-sm text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                         Architecture Visualization Preview
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
