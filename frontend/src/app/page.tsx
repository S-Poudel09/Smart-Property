'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import api from '@/lib/api/http';
import { 
    Search, 
    ShieldCheck, 
    ArrowRight, 
    MapPin, 
    Star, 
    Building, 
    Users, 
    ChevronRight,
    TrendingUp,
    Navigation,
    Sparkles,
    Landmark,
    CheckCircle
} from 'lucide-react';
import PropertyCard from '@/components/property/PropertyCard';

interface FeaturedProperty {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    status: string;
    area?: number;
    description?: string;
}

export default function HomePage() {
    const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/properties/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
                const published = data.filter((p: any) => p.status === 'published' || !p.status);
                setFeaturedProperties(published.slice(0, 3).map((p: any, index: number) => {
                    const rawId = p.id || p._id || p.PropertyID || p.property_id;
                    const fallbackId = `${(p.title || 'estate').replace(/\s+/g, '-').toLowerCase()}-${(p.location || 'nepal').replace(/\s+/g, '-').toLowerCase()}-${index}`;
                    return {
                        id: rawId ? String(rawId) : fallbackId,
                        title: p.title ?? 'Untitled Estate',
                        price: Number(p.price) || Number(p.total_amount) || 0,
                        location: p.location ?? p.address ?? 'Nepal',
                        bedrooms: Number(p.bedrooms) || Number(p.beds) || 0,
                        bathrooms: Number(p.bathrooms) || Number(p.baths) || 0,
                        area: Number(p.area) || Number(p.area_sqft) || 0,
                        description: p.description ?? '',
                        images: p.property_images?.map((img: any) => typeof img === 'string' ? img : img.image) || p.images || [],
                        status: p.status ?? 'published',
                    };
                }));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa] selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            
            {/* Massive Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />
                
                <Container className="relative z-10">
                    <div className="text-center max-w-5xl mx-auto space-y-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-100 rounded-full shadow-xl shadow-slate-200/50"
                        >
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Nepal's Premier Property Registry</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 font-outfit tracking-tighter leading-[0.85] italic mb-10"
                        >
                            Acquire Premium <br />
                            <span className="text-indigo-600">Property Nodes.</span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl md:text-2xl text-slate-500 font-medium italic max-w-3xl mx-auto leading-relaxed"
                        >
                            "Navigate the elite landscape of verified assets, secure transactions, and institutional-grade real estate governance."
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                        >
                            <Link href="/dashboard/properties">
                                <button className="h-16 px-12 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 flex items-center gap-3">
                                    Explore Index <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                            <Link href="/auth/register">
                                <button className="h-16 px-12 bg-white border border-slate-200 text-slate-900 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                                    Join Network
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                    
                    {/* Floating Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 border-y border-slate-100 py-16">
                        {[
                            { label: 'Asset Vol', val: 'Rs 40B+', icon: Building },
                            { label: 'Active nodes', val: '15k+', icon: Users },
                            { label: 'Security Score', val: '100%', icon: ShieldCheck },
                            { label: 'Market Index', val: '+14.2%', icon: TrendingUp },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-slate-100">
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="text-3xl font-black text-slate-900 font-outfit uppercase italic">{stat.val}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5 italic">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Featured Registry Section */}
            <section className="py-32 bg-white relative">
                 <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 opacity-50" />
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Featured Streams</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter leading-tight italic">Elite Properties</h2>
                            <p className="text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-8 max-w-xl text-lg">
                                Discover high-liquidity assets optimized for portfolio growth and structural integrity across the capital.
                            </p>
                        </div>
                        <Link href="/dashboard/properties">
                            <button className="h-14 px-8 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-indigo-600 transition-all">
                                Expanded Index →
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-96 bg-slate-50 rounded-[2.5rem] animate-pulse" />
                            ))
                        ) : featuredProperties.length > 0 ? (
                            featuredProperties.map((property, i) => (
                                <motion.div 
                                    key={property.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                >
                                    <PropertyCard property={property as any} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-3 py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                <span className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase italic">Initial Registry Scan Node Active... Discovered 0 Properties</span>
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            {/* Infrastructure & The Smart Standard */}
            <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-24 -mb-24" />
                
                <Container className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full mb-12 backdrop-blur-md">
                        <ShieldCheck className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">Operational Integrity</span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black font-outfit tracking-tighter leading-[0.85] mb-12 italic">Advanced Registry <br /> Infrastructure.</h2>
                    <p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto mb-24">
                        "We integrate rigorous authentication and legal integrity into every step of the high-stakes property journey."
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 text-left">
                        {[
                             {
                                icon: ShieldCheck,
                                title: "Full Verification",
                                desc: "Every listing undergoes multiple layers of verification to ensure legal compliance and ownership authenticity."
                            },
                            {
                                icon: Landmark,
                                title: "Secure P2P",
                                desc: "Direct connections between agents and investors facilitate transparent negotiations with institutional security."
                            },
                            {
                                icon: Navigation,
                                title: "Smart Workflow",
                                desc: "Our digital workflow manages the complete transaction lifecycle, from discovery to final deed transfer."
                            }
                        ].map((feature, i) => (
                            <motion.div 
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm transition-all hover:bg-white/10"
                            >
                                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-black font-outfit uppercase tracking-tight italic mb-4">{feature.title}</h3>
                                <p className="text-slate-400 font-medium italic leading-relaxed text-sm">"{feature.desc}"</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Premium CTA */}
            <section className="py-48 bg-[#fafafa]">
                <Container>
                    <div className="bg-slate-900 rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-indigo-500/20 rounded-full blur-[120px] -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/30" />
                        
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <motion.h2 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="text-5xl md:text-8xl font-black mb-10 leading-[0.85] font-outfit italic"
                            >
                                Initialize Your <br/><span className="text-indigo-400">Digital Registry.</span>
                            </motion.h2>
                            <p className="text-slate-400 text-xl md:text-2xl italic font-medium mb-16 max-w-2xl mx-auto leading-relaxed">Join the most advanced property network in the region. Built for speed, secured by protocol.</p>
                            
                            <div className="flex flex-wrap justify-center gap-8">
                                <Link href="/dashboard/properties">
                                    <button className="h-20 px-16 bg-white text-slate-900 text-base font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-400 hover:text-white transition-all shadow-xl group">
                                        Exploration Hub
                                    </button>
                                </Link>
                                <Link href="/auth/register">
                                    <button className="h-20 px-16 bg-white/5 border border-white/20 text-white text-base font-black uppercase tracking-widest rounded-3xl hover:bg-white/10 transition-all backdrop-blur-sm">
                                        Establish Node
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </div>
    );
}
