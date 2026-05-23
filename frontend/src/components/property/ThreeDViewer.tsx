import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, Stage, Environment, useGLTF } from '@react-three/drei';
import { Suspense, useState, useEffect, memo } from 'react';
import { X, Maximize2, Move, Play, RotateCcw, ShieldCheck, Zap, Globe, Sparkles, AlertCircle, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GLTFModel({ url }: { url: string }) {
  // Safe fallback: render a simple box instead of attempting to load a GLTF.
  console.warn('GLTFModel loading disabled for safety. URL:', url);
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

export function HouseModel({ propertyType = 'house', beds = 1, modelUrl }: { propertyType?: string, beds?: number, modelUrl?: string }) {
  if (modelUrl) {
    return (
      <Suspense fallback={<mesh><boxGeometry args={[2, 2, 2]} /><meshStandardMaterial color="#6366f1" wireframe /></mesh>}>
        <Center top>
          <GLTFModel url={modelUrl} />
        </Center>
      </Suspense>
    );
  }

  if (propertyType.toLowerCase() === 'land') {
    return (
      <group dispose={null}>
        <mesh position={[0, -0.05, 0.5]} receiveShadow>
          <boxGeometry args={[6, 0.2, 6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
        {/* Fences */}
        {[-2.9, 2.9].map(x => (
          <mesh key={x} position={[x, 0.5, 0.5]} castShadow>
            <boxGeometry args={[0.1, 1, 6]} />
            <meshStandardMaterial color="#a1a1aa" roughness={0.9} />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#dcfce7" />
        </mesh>
      </group>
    );
  }

  if (propertyType.toLowerCase() === 'hostel' || propertyType.toLowerCase() === 'apartment') {
    const floors = propertyType.toLowerCase() === 'apartment' ? 4 : 2;
    return (
      <group dispose={null}>
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[8, 0.2, 8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
        {/* Tower */}
        <mesh position={[0, floors * 1.5 - 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, floors * 3, 5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Windows */}
        {Array.from({ length: floors }).map((_, f) => (
          <group key={f} position={[0, f * 3, 2.51]}>
            <mesh position={[-1.5, 1.5, 0]}>
              <boxGeometry args={[1.5, 1, 0.05]} />
              <meshStandardMaterial color="#94a3b8" emissive="#6366f1" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[1.5, 1.5, 0]}>
              <boxGeometry args={[1.5, 1, 0.05]} />
              <meshStandardMaterial color="#94a3b8" emissive="#6366f1" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
      </group>
    );
  }

  return (
    <group dispose={null}>
      {/* Foundation / Driveway */}
      <mesh position={[0, -0.05, 0.5]} receiveShadow>
        <boxGeometry args={[6, 0.2, 6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {/* Main Structure (Left Wing) */}
      <mesh position={[-0.8, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2, 3.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Garage (Right Wing) */}
      <mesh position={[1.4, 0.75, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.5, 2.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Garage Door */}
      <mesh position={[1.4, 0.6, 1.61]}>
        <boxGeometry args={[1.2, 0.9, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Roof - Compound Sloped */}
      <group position={[0, 2, 0]}>
        {/* Main Roof */}
        <mesh position={[-0.8, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.4, 1.2, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Garage Roof */}
        <mesh position={[1.4, 0.25, 0.4]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.5, 0.8, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
      </group>

      {/* Main Entry Door */}
      <mesh position={[-0.8, 0.6, 1.61]}>
        <boxGeometry args={[0.7, 1.2, 0.05]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Window Arrays */}
      {[-1.8, 0.2].map((x) => (
        <mesh key={x} position={[x, 1.2, 1.61]}>
          <boxGeometry args={[0.7, 0.7, 0.02]} />
          <meshStandardMaterial color="#94a3b8" emissive="#6366f1" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Side Windows */}
      <mesh position={[-2.21, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.2, 0.7, 0.02]} />
        <meshStandardMaterial color="#94a3b8" emissive="#6366f1" emissiveIntensity={0.3} />
      </mesh>

      {/* Ground Ambience */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={propertyType === 'land' ? "#dcfce7" : "#f1f5f9"} />
      </mesh>
    </group>
  );
}

interface ThreeDViewerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  url?: string;
  propertyType?: string;
  image?: string;
  beds?: number;
  modelUrl?: string;
}

export const ThreeDViewer = memo(function ThreeDViewer({ isOpen, onClose, propertyName, url, propertyType, image, beds, modelUrl }: ThreeDViewerProps) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [dimensionsReady, setDimensionsReady] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDimensionsReady(false);
      setHasTimedOut(false);
      return;
    }

    const isMatterport = url?.includes('matterport.com/show/?m=');
    const modelId = url?.split('m=')[1]?.split('&')[0];
    const isDemoId = !modelId || modelId.length < 11 || ["JGPuSuihtZ9", "9S99tKz8yXz", "rnBstA7s1V7"].includes(modelId);
    const isBroken = !modelId || ["broken", "null", "undefined"].includes(modelId.toLowerCase());

    if (isMatterport && modelId && !isDemoId && !isBroken) {
      setActiveUrl(`https://my.matterport.com/show/?m=${modelId}&play=1&brand=0&title=0&tourcta=0&vr=1`);
    } else if (url && url.startsWith('http') && !isMatterport && !isBroken) {
      setActiveUrl(url);
    } else {
      setActiveUrl(null);
    }

    // Preload architectural assets to reduce perceived latency
    if (modelUrl) {
      try {
        useGLTF.preload(modelUrl);
      } catch (e) {
        console.warn("Preload failed for node:", modelUrl);
      }
    }

    // Watchdog Timer: if meshes don't resolve in 10s, reveal the procedural hub
    const watchdog = setTimeout(() => setHasTimedOut(true), 10000);
    const renderDelay = setTimeout(() => setDimensionsReady(true), 200);

    return () => {
      clearTimeout(watchdog);
      clearTimeout(renderDelay);
    };
  }, [isOpen, url]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-[#020617] flex flex-col overflow-hidden"
        >
          {/* Pro Header */}
          <header className="flex-shrink-0 flex justify-between items-center px-12 py-8 border-b border-white/5 bg-[#020617]/50 backdrop-blur-3xl z-20">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-900 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="h-6 w-6 relative z-10 fill-current ml-1" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white font-outfit tracking-tighter italic uppercase">{propertyName}</h3>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Internal Imperial Model Synchronized</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-16 w-16 rounded-2xl border-2 border-white/10 text-white/40 hover:bg-white hover:text-slate-900 hover:border-white transition-all flex items-center justify-center active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
          </header>

          <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
            {activeUrl ? (
              <iframe
                src={activeUrl}
                className="w-full h-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                title={`Virtual Hub — ${propertyName}`}
              />
            ) : (
              <div className="w-full h-full relative group/canvas overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-10" />

                {dimensionsReady && (
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/5 font-black uppercase tracking-[1em]">Scanning Mesh...</div>}>
                    {!hasTimedOut ? (
                      <Canvas
                        shadows
                        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                        dpr={[1, 2]}
                        camera={{ position: [12, 10, 12], fov: 35 }}
                        onCreated={({ gl }) => {
                          gl.shadowMap.enabled = true;
                          gl.shadowMap.type = THREE.PCFShadowMap;
                        }}
                      >
                        <OrbitControls makeDefault enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.3} />
                        <Stage environment="city" intensity={0.4} shadows="contact" adjustCamera>
                          <HouseModel propertyType={propertyType} beds={beds} modelUrl={modelUrl} />
                        </Stage>
                        <Environment preset="city" blur={1} />
                        <fog attach="fog" args={['#020617', 20, 60]} />
                      </Canvas>
                    ) : (
                      <Canvas
                        shadows
                        gl={{ antialias: true, alpha: true }}
                        dpr={[1, 2]}
                        camera={{ position: [12, 10, 12], fov: 35 }}
                      >
                        <OrbitControls makeDefault enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.3} />
                        <Stage environment="city" intensity={0.4} shadows="contact" adjustCamera>
                          <HouseModel propertyType={propertyType} beds={beds} />
                        </Stage>
                        <Environment preset="city" blur={1} />
                        <fog attach="fog" args={['#020617', 20, 60]} />
                      </Canvas>
                    )}
                  </Suspense>
                )}

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-40 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="px-10 py-5 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-3xl flex items-center gap-6 relative z-10 translate-y-[-240px]">
                      <RotateCcw className="h-6 w-6 text-indigo-400 animate-[spin_6s_linear_infinite]" />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">{hasTimedOut ? 'Procedural Backup Active' : 'Procedural Registry Active'}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1 italic">High-Fidelity Internal Mesh Engine</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 text-white space-y-6 w-80 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] pointer-events-auto"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic font-outfit">Node Telemetry</span>
                  <div className="flex gap-1.5">
                    <div className={`h-1.5 w-1.5 ${hasTimedOut ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`} />
                    <div className="h-1.5 w-1.5 bg-emerald-500/40 rounded-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold italic">
                    <span className="text-white/30 uppercase tracking-widest text-[9px]">Platform</span>
                    <span>IMPERIAL V4</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold italic">
                    <span className="text-white/30 uppercase tracking-widest text-[9px]">Sync Mode</span>
                    <span>{hasTimedOut ? 'PROCEDURAL' : 'REAL-TIME'}</span>
                  </div>
                </div>
              </motion.div>

              <div className="flex items-center gap-5 py-4 px-10 bg-white text-slate-900 rounded-full shadow-3xl text-[10px] font-black uppercase tracking-[0.4em] italic pointer-events-auto cursor-help hover:scale-105 transition-all">
                <Move className="h-5 w-5" /> Manipulate Node
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export const ThreeDInline = memo(function ThreeDInline({ url, propertyName, propertyType, image, beds, modelUrl }: { url?: string, propertyName: string, propertyType?: string, image?: string, beds?: number, modelUrl?: string }) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const isMatterport = url?.includes('matterport.com/show/?m=');
    const modelId = url?.split('m=')[1]?.split('&')[0];
    const isDemoId = !modelId || modelId.length < 11 || ["JGPuSuihtZ9", "9S99tKz8yXz", "rnBstA7s1V7"].includes(modelId);
    const isBroken = !modelId || ["broken", "null", "undefined"].includes(modelId.toLowerCase());

    if (isMatterport && modelId && !isDemoId && !isBroken) {
      setActiveUrl(`https://my.matterport.com/show/?m=${modelId}&play=1&brand=0&title=0&tourcta=0`);
    } else if (url && url.startsWith('http') && !isMatterport && !isBroken) {
      setActiveUrl(url);
    } else {
      setActiveUrl(null);
    }

    const timer = setTimeout(() => setIsRendered(true), 200);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="w-full h-full bg-slate-950 relative overflow-hidden group">
      <AnimatePresence mode="wait">
        {activeUrl ? (
          <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
            <iframe
              src={activeUrl}
              className="w-full h-full border-none"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
              title={`Simulation Stream — ${propertyName}`}
            />
            <div className="absolute top-8 left-8 h-10 px-6 bg-slate-900/90 backdrop-blur-md rounded-xl flex items-center gap-4 text-white border border-white/10 shadow-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Telemetry Active</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative bg-slate-950">
            {isRendered && (
              <Suspense fallback={null}>
                <Canvas
                  shadows
                  gl={{ antialias: true, alpha: true }}
                  dpr={[1, 1.2]}
                  camera={{ position: [10, 8, 10], fov: 32 }}
                  onCreated={({ gl }) => {
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = THREE.PCFShadowMap;
                  }}
                >
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
                  <Stage environment="city" intensity={0.4} shadows={false} adjustCamera>
                    <HouseModel propertyType={propertyType} beds={beds} modelUrl={modelUrl} />
                  </Stage>
                  <Environment preset="city" />
                </Canvas>
              </Suspense>
            )}
            <div className="absolute bottom-8 left-8 flex flex-col gap-2">
              <div className="px-6 py-2.5 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-[0.4em] italic shadow-2xl opacity-0 group-hover:opacity-100 transition-all font-outfit">
                High-Fidelity Registry Mirror
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
