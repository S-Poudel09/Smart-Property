'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei';
import { Suspense } from 'react';
import { Loader } from '../common/Loader';
import { X, Maximize2, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function HouseModel({ type }: { type?: string }) {
  // A stylized, modern block representation of a "Royal" villa or apartment
  return (
    <group>
      {/* Main Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 3]} />
        <meshStandardMaterial color="#fff" roughness={0.1} metalness={0.1} />
      </mesh>
      
      {/* Upper Floor */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1, 2.5]} />
        <meshStandardMaterial color="#fffdf9" roughness={0.1} metalness={0.1} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 2.1, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.5, 0.2, 2.8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      
      {/* Windows (Glowing for 'Royal' effect) */}
      <mesh position={[1.5, 1.5, 1.26]}>
        <planeGeometry args={[0.5, 0.6]} />
        <meshStandardMaterial color="#c5a059" emissive="#c5a059" emissiveIntensity={1} />
      </mesh>
      
      <mesh position={[-1.5, 1.5, 1.26]}>
        <planeGeometry args={[0.5, 0.6]} />
        <meshStandardMaterial color="#c5a059" emissive="#c5a059" emissiveIntensity={1} />
      </mesh>

      {/* Decorative Pillar */}
      <mesh position={[1.8, 0.5, 1.3]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[-1.8, 0.5, 1.3]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.2} />
      </mesh>

      {/* Floor / Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  );
}

interface ThreeDViewerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
}

export function ThreeDViewer({ isOpen, onClose, propertyName }: ThreeDViewerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] bg-[#1a1a2e]/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-royal-gold/20 rounded-xl flex items-center justify-center">
                <Maximize2 className="h-5 w-5 text-royal-gold" />
              </div>
              <div>
                <h3 className="text-white font-serif text-lg">{propertyName}</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Move className="h-3 w-3" /> Drag to Orbit • Scroll to Zoom
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-12 w-12 rounded-full border border-white/10 text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 3D Scene */}
          <div className="flex-1 relative">
            <Suspense fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                    <Loader size="lg" />
                    <span className="text-sm font-black uppercase tracking-widest animate-pulse">Initializing 3D Engine...</span>
                </div>
            }>
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={45} />
                    <OrbitControls 
                        enableDamping={true} 
                        dampingFactor={0.05} 
                        rotateSpeed={0.5} 
                        maxDistance={25} 
                        minDistance={5} 
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                    />
                    
                    <Stage environment="city" intensity={1}>
                        <HouseModel />
                    </Stage>
                    
                    <Environment preset="city" />
                    
                    <fog attach="fog" args={['#1a1a2e', 10, 30]} />
                </Canvas>
            </Suspense>

            {/* AI Scan HUD Overlay */}
            <div className="absolute bottom-10 left-10 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white space-y-4 max-w-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-royal-gold">Structural Scan</span>
                    <span className="text-[10px] font-bold text-green-400">STATUS: MATCHED</span>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium opacity-60">
                        <span>Foundation Depth</span>
                        <span>8.5 Meters</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium opacity-60">
                        <span>Concrete Grade</span>
                        <span>M25 Elite</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium opacity-60">
                        <span>Seismic Resilience</span>
                        <span>9.2 Richter Core</span>
                    </div>
                </div>
                <div className="pt-2">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "94%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                            className="h-full bg-royal-gold" 
                        />
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
