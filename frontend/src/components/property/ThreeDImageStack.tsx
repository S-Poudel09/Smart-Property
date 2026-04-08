'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Image as DreiImage, MeshDistortMaterial, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Move, Layers, Sparkles, Building2, MousePointer2 } from 'lucide-react';

interface ImagePlaneProps {
    url: string;
    position: [number, number, number];
    rotation: [number, number, number];
    index: number;
}

function ImagePlane({ url, position, rotation, index }: ImagePlaneProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime + index) * 0.002;
            if (hovered) {
                meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1), 0.1);
            } else {
                meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
    });

    return (
        <group position={position} rotation={rotation}>
            <DreiImage
                ref={meshRef as any}
                url={url}
                transparent
                opacity={0.9}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <MeshDistortMaterial
                    speed={2}
                    distort={0.1}
                    radius={1}
                />
            </DreiImage>
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[1.05, 1.05]} />
                <meshBasicMaterial color="#6366f1" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}

function ImageGallery3D({ images }: { images: string[] }) {
    const groupRef = useRef<THREE.Group>(null);
    
    const items = useMemo(() => {
        return images.slice(0, 6).map((url, i) => {
            const angle = (i / Math.min(images.length, 6)) * Math.PI * 2;
            const radius = 4;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (i - 2.5) * 0.5;
            
            return {
                url,
                position: [x, y, z] as [number, number, number],
                rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number]
            };
        });
    }, [images]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef}>
            {items.map((item, i) => (
                <ImagePlane 
                    key={item.url} 
                    url={item.url} 
                    position={item.position} 
                    rotation={item.rotation}
                    index={i}
                />
            ))}
            
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text
                    position={[0, 3, 0]}
                    fontSize={0.4}
                    color="#ffffff"
                    font="/fonts/Outfit-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                >
                    ASSET VISUAL CLUSTER
                </Text>
            </Float>
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
                <circleGeometry args={[6, 32]} />
                <MeshDistortMaterial color="#6366f1" opacity={0.05} transparent speed={1} />
            </mesh>
        </group>
    );
}

function FrameWatchdog({ onLoaded }: { onLoaded?: () => void }) {
    useFrame(() => {
        if (onLoaded) onLoaded();
    });
    return null;
}

function SceneContent({ images, onLoaded }: { images: string[], onLoaded?: () => void }) {
    return (
        <Canvas shadows dpr={[1, 2]}>
            <FrameWatchdog onLoaded={onLoaded} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <OrbitControls enableDamping dampingFactor={0.05} enablePan={false} minDistance={5} maxDistance={15} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <ImageGallery3D images={images} />
            <Environment preset="night" />
        </Canvas>
    );
}

export default function ThreeDImageStack({ images, isOpen, onClose, propertyName, isStatic = false }: { 
    images: string[], 
    isOpen: boolean, 
    onClose: () => void,
    propertyName: string,
    isStatic?: boolean
}) {
    const [isResolved, setIsResolved] = useState(isStatic);

    useEffect(() => {
        if (!isOpen) {
            setIsResolved(false);
            return;
        }
        if (isStatic) {
            setIsResolved(true);
            return;
        }
        const timer = setTimeout(() => setIsResolved(true), 8000);
        return () => clearTimeout(timer);
    }, [isOpen, isStatic]);

    if (!isOpen) return null;

    const safeImages = images.length > 0 ? images : ['/placeholder-property.jpg'];
    const Container = isStatic ? 'div' : motion.div;

    return (
        <AnimatePresence>
            <Container
                {...(!isStatic && {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                })}
                className="fixed inset-0 z-[300] bg-[#020617] flex flex-col pt-24"
            >
                <header className="absolute top-0 left-0 right-0 h-24 flex justify-between items-center px-12 z-50">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-2xl">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{propertyName}</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic mt-1">3D Volumetric Visualizer</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-14 w-14 rounded-2xl bg-white/5 text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center border border-white/10"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <div className="flex-1 relative">
                    {!isResolved ? (
                        <Suspense fallback={
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10">
                                <Sparkles className="h-20 w-20 animate-pulse mb-8" />
                                <p className="text-[10px] font-black uppercase tracking-[1em]">Synthesizing 3D Matrix</p>
                            </div>
                        }>
                            <SceneContent images={safeImages} onLoaded={() => setIsResolved(true)} />
                        </Suspense>
                    ) : (
                        <SceneContent images={safeImages} />
                    )}

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-10">
                        <div className="flex items-center gap-4 py-4 px-10 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-[0.3em] italic shadow-2xl">
                            <MousePointer2 className="h-4 w-4" /> Rotate Cluster
                        </div>
                        <div className="flex items-center gap-4 py-4 px-10 bg-indigo-600/20 backdrop-blur-2xl rounded-full border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-indigo-600/10">
                            <Building2 className="h-4 w-4" /> Registry Intel Active
                        </div>
                    </div>
                </div>
            </Container>
        </AnimatePresence>
    );
}
