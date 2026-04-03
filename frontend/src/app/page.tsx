'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import api from '@/lib/api/http';
import { 
    Search, 
    Home, 
    ShieldCheck, 
    ArrowRight, 
    MapPin, 
    Star, 
    Building, 
    Users, 
    ChevronRight,
    PlayCircle,
    CheckCircle2
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

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" as const }
};

export default function HomePage() {
    const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('smartproperty_token') : null;
        setIsLoggedIn(!!token);

        api.get('/properties/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
                const published = data.filter((p: any) => p.status === 'published' || !p.status);
                setFeaturedProperties(published.slice(0, 3).map((p: any, index: number) => {
                    // Support multiple ID formats and generate a stable fallback
                    const rawId = p.id || p._id || p.PropertyID || p.property_id;
                    const fallbackId = `${(p.title || 'estate').replace(/\s+/g, '-').toLowerCase()}-${(p.location || 'nepal').replace(/\s+/g, '-').toLowerCase()}-${index}`;
                    const finalId = rawId ? String(rawId) : fallbackId;

                    return {
                        id: finalId,
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
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Immersive Hero Section */}
            <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1600585154340-be6191da010e?auto=format&fit=crop&q=80&w=2000" 
                        alt="Premium Real Estate" 
                        className="w-full h-full object-cover brightness-[0.3]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-transparent to-black/40" />
                </div>

                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center lg:text-left lg:mx-0">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-10 shadow-xl shadow-primary/10"
                        >
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                            Nepal's Trusted Property Registry
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-10 tracking-tight font-outfit"
                        >
                            Find Your <br />
                            <span className="text-primary italic font-medium">Elevated Living.</span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-white/80 text-xl md:text-2xl mb-14 leading-relaxed max-w-2xl font-medium"
                        >
                            SmartProperty is the premier digital ecosystem for real estate in Nepal, facilitating secure, verified, and direct property transitions.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-6"
                        >
                            <Link href="/properties">
                                <Button size="lg" className="rounded-2xl h-16 px-12 group shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                                    Browse Listings
                                    <ArrowRight className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button variant="outline" size="lg" className="rounded-2xl h-16 px-12 border-white/20 text-white backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all">
                                    Join the Network
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </Container>

                {/* Stat Cards */}
                <div className="absolute bottom-0 right-0 left-0 hidden lg:block">
                    <div className="max-w-[1400px] mx-auto px-12 translate-y-1/2">
                        <div className="grid grid-cols-4 gap-8">
                            {[
                                { label: "Verified Assets", val: "5K+", icon: ShieldCheck },
                                { label: "Total Transactions", val: "Rs 15B+", icon: Building },
                                { label: "Active Members", val: "12K+", icon: Users },
                                { label: "Expert Advisors", val: "150+", icon: Star }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                                    className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 flex items-center gap-6"
                                >
                                    <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-foreground font-outfit">{stat.val}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="pt-48 pb-32 bg-background">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="max-w-2xl">
                            <motion.div 
                                {...fadeInUp}
                                className="h-1.5 w-12 bg-primary rounded-full mb-8"
                            />
                            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-outfit">Exclusive Property Registry</h2>
                            <p className="text-muted text-xl">Curated premium listings representing the finest real estate available in Nepal today.</p>
                        </div>
                        <Link href="/properties">
                            <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold border-border shadow-sm hover:border-primary/50 transition-all">
                                View Entire Portfolio <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {featuredProperties.length > 0 ? (
                            featuredProperties.map((property, i) => (
                                <motion.div 
                                    key={property.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                >
                                    <PropertyCard property={property as any} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-3 py-32 text-center">
                                <span className="text-muted text-lg animate-pulse">Syncing with registry...</span>
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            {/* Modern Standard Grid */}
            <section className="py-40 bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-primary/5 rounded-l-[10rem] pointer-events-none blur-3xl opacity-50" />
                
                <Container>
                    <div className="text-center max-w-3xl mx-auto mb-28">
                        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 tracking-tight font-outfit">The Modern Standard</h2>
                        <p className="text-muted text-xl leading-relaxed">SmartProperty transcends traditional listing sites by integrating rigorous authentication and legal integrity into every step.</p>
                    </div>
  
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Verified Assets",
                                desc: "Every listing undergoes a multi-layer verification process to ensure legal compliance and ownership authenticity."
                            },
                            {
                                icon: Search,
                                title: "P2P Transactions",
                                desc: "Direct connections between verified buyers and sellers facilitate transparent negotiations with zero intermediary friction."
                            },
                            {
                                icon: Building,
                                title: "Smart Contracts",
                                desc: "Proprietary digital workflows manage the complete transaction lifecycle, from commitment to final registry transfer."
                            }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-12 rounded-[2.5rem] bg-background border border-border/50 transition-all hover:bg-card hover:shadow-2xl hover:shadow-primary/5"
                            >
                                <div className="h-16 w-16 bg-card rounded-2xl flex items-center justify-center text-primary mb-10 shadow-lg shadow-black/[0.02] border border-border/40 transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-6 font-outfit">{feature.title}</h3>
                                <p className="text-muted leading-relaxed text-lg font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Premium CTA */}
            <section className="py-40 bg-background">
                <Container>
                    <div className="bg-foreground rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32 transition-all group-hover:bg-primary/30" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <motion.h2 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="text-5xl md:text-7xl font-bold mb-10 leading-[1.1] font-outfit"
                            >
                                Experience the <span className="text-primary italic">Transformation.</span>
                            </motion.h2>
                            <p className="text-white/60 text-xl mb-16 leading-relaxed">Join the most advanced property network in Nepal. Secure, seamless, and sophisticated.</p>
                            
                            <div className="flex flex-wrap justify-center gap-8">
                                <Link href="/properties">
                                    <Button size="lg" className="rounded-2xl h-16 px-14 bg-white text-primary hover:bg-gray-100 font-bold shadow-2xl">
                                        Explore the Registry
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="lg" variant="outline" className="rounded-2xl h-16 px-14 border-white/20 text-white hover:bg-white/10 font-bold backdrop-blur-sm">
                                        Start Your Journey
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
}

