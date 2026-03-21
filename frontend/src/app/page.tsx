'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import api from '@/lib/api/http';
import {
    Search, Home, ShieldCheck, TrendingUp,
    MapPin, Bed, Bath, ArrowRight, Sparkles,
    Building2, Users, ReceiptText, Star,
    Crown, Gem, Heart, Navigation, MoveRight, 
    Play, Quote, Layers, Globe, Compass
} from 'lucide-react';
import { formatNPR } from '@/lib/utils/currency';

interface FeaturedProperty {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    status: string;
}

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

export default function HomePage() {
    const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
    const [stats, setStats] = useState({ properties: 0, users: 0, transactions: 0 });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('smartproperty_token') : null;
        setIsLoggedIn(!!token);

        api.get('/properties/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
                setFeaturedProperties(data.slice(0, 3).map((p: any) => ({
                    id: p.id ?? p.PropertyID ?? '',
                    title: p.title ?? 'Untitled Estate',
                    price: Number(p.price) || 0,
                    location: p.location ?? p.address ?? 'Nepal',
                    bedrooms: Number(p.bedrooms) || 0,
                    bathrooms: Number(p.bathrooms) || 0,
                    images: p.images ?? [],
                    status: p.status ?? 'PUBLISHED',
                })));
                setStats(prev => ({ ...prev, properties: data.length }));
            })
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-[#fffdf9] overflow-x-hidden selection:bg-[#c5a059]/30">
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex items-center pt-24 pb-32 overflow-hidden">
                {/* 3D Decorative Orbs & Gradients */}
                <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-accent/10 via-accent/5 to-transparent pointer-events-none" />
                <motion.div 
                    animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[5%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" 
                />
                <motion.div 
                    animate={{ y: [0, 40, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[120px] pointer-events-none" 
                />

                <Container className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                            className="text-left"
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-primary/20 shadow-xl shadow-primary/5 mb-10">
                                <Crown className="h-4 w-4 text-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">The Imperial Standard</span>
                            </motion.div>
                            
                            <motion.h1 
                                variants={fadeInUp}
                                className="text-6xl md:text-8xl lg:text-[7rem] font-serif text-primary leading-[0.85] mb-10 tracking-tight"
                            >
                                Royal <br />
                                <span className="italic relative inline-block text-accent">
                                    Heritage
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: 1, duration: 1.5 }}
                                        className="absolute -bottom-2 left-0 h-1.5 bg-accent/30 rounded-full"
                                    />
                                </span>
                                <br />
                                <span className="text-[0.6em] md:text-[0.55em] font-sans font-black uppercase tracking-widest text-primary/20">Legacy Estates</span>
                            </motion.h1>
                            
                            <motion.p 
                                variants={fadeInUp}
                                className="text-xl text-gray-500 max-w-lg mb-14 font-medium leading-relaxed italic border-l-4 border-accent/20 pl-6"
                            >
                                "Where the echoes of history meet the pinnacle of modern luxury. Discover Nepal's most prestigious sanctuaries, curated for the sovereign."
                            </motion.p>
                            
                            <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 items-center">
                                <Link href="/properties">
                                    <Button className="h-20 px-12 text-sm font-black rounded-full bg-primary text-white hover:bg-accent hover:text-primary shadow-[0_20px_40px_-10px_rgba(26,26,46,0.3)] hover:shadow-accent/40 transition-all duration-500 gap-4 group uppercase tracking-widest">
                                        <Compass className="h-5 w-5 group-hover:scale-110 transition-transform text-accent" /> Explore Registry
                                    </Button>
                                </Link>
                                {!isLoggedIn && (
                                    <Link href="/auth/register" className="group flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg group-hover:scale-110">
                                            <Play className="h-4 w-4 fill-current ml-1" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Access the Circle</p>
                                            <p className="text-sm font-bold text-primary">Join Membership</p>
                                        </div>
                                    </Link>
                                )}
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.85, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative hidden lg:block"
                        >
                            {/* Main Hero Card */}
                            <div className="relative z-20 rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(197,160,89,0.4)] border-[12px] border-white group">
                                <Image 
                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
                                    alt="Imperial Residence"
                                    width={1200}
                                    height={1600}
                                    className="object-cover h-[750px] w-full transition-transform duration-[3s] group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                
                                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-white">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-[9px] font-black uppercase tracking-widest mb-4">
                                            <Star className="h-3 w-3 fill-current" /> Platinum Listing
                                        </div>
                                        <h3 className="text-5xl font-serif">Aisiri Royal Villas</h3>
                                        <p className="text-sm font-medium text-gray-300 mt-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-accent" /> Budhanilkantha, Kathmandu
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-accent tracking-widest mb-1">Legacy Value</p>
                                        <p className="text-3xl font-serif">Rs 12.5Cr</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Glass Element */}
                            <motion.div 
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -left-16 top-1/2 -translate-y-1/2 z-30 p-8 bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/40 shadow-2xl shadow-black/10 max-w-[220px]"
                            >
                                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-accent mb-4 shadow-lg">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-black text-primary uppercase tracking-widest leading-tight">Sovereign Documents Verified</h4>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">AI-SCANNED LALPURJA</p>
                            </motion.div>

                            {/* Background Layers */}
                            <div className="absolute -top-10 -right-10 w-full h-full border-[1.5px] border-accent/20 rounded-[4rem] z-10" />
                            <div className="absolute -bottom-10 -left-10 w-full h-full bg-accent/5 rounded-[4rem] z-0 blur-xl" />
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* --- PRESTIGE STATS --- */}
            <section className="py-24 relative z-20">
                <Container>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 px-12 py-16 premium-gradient rounded-[4rem] border border-accent/30 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000" />
                        {[
                            { icon: <Building2 className="h-6 w-6" />, value: '850+', label: 'Imperial Estates' },
                            { icon: <Gem className="h-6 w-6" />, value: '100%', label: 'Citizen Verified' },
                            { icon: <Users className="h-6 w-6" />, value: '4.2k', label: 'Dignitaries' },
                            { icon: <Globe className="h-6 w-6" />, value: 'Rs 500B+', label: 'Registry Valuation' },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="text-center relative z-10 border-r last:border-0 border-accent/10 py-4"
                            >
                                <div className="mx-auto h-16 w-16 bg-accent/10 flex items-center justify-center rounded-2xl text-accent mb-6 shadow-inner">
                                    {stat.icon}
                                </div>
                                <h4 className="text-4xl font-serif text-white mb-2">{stat.value}</h4>
                                <p className="text-[10px] font-black uppercase text-accent tracking-[0.3em]">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* --- FEATURED COLLECTION --- */}
            <section className="py-32 bg-[#fffdf9] relative">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                        <motion.div
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="max-w-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px w-12 bg-accent" />
                                <span className="text-accent font-black text-xs uppercase tracking-[0.3em] inline-block">Curated Masterpieces</span>
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-serif text-primary leading-tight">Hand-Picked <br /> <span className="italic font-light">Sovereign Seats</span></h2>
                        </motion.div>
                        <motion.div
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <Link href="/properties">
                                <Button className="h-20 px-12 bg-white border border-accent/20 shadow-xl rounded-full text-xs font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-accent transition-all flex items-center gap-4 group">
                                    Full Registry <MoveRight className="h-5 w-5 group-hover:translate-x-3 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {featuredProperties.map((prop, i) => (
                            <motion.div
                                key={prop.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2, duration: 1 }}
                            >
                                <Link href={`/properties/${prop.id}`} className="group">
                                    <div className="bg-white rounded-[3.5rem] p-5 border border-accent/10 shadow-2xl shadow-accent/5 hover:shadow-accent/20 transition-all duration-700 hover:-translate-y-6">
                                        <div className="relative h-[450px] rounded-[3rem] overflow-hidden">
                                            <Image
                                                src={prop.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
                                                alt={prop.title}
                                                fill
                                                className="object-cover transition-transform duration-[4s] group-hover:scale-110"
                                            />
                                            <div className="absolute top-8 left-8">
                                                <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-accent/10">
                                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Available</span>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-10 left-10 right-10">
                                                <div className="bg-primary/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Acquisition Reserve</div>
                                                    <div className="text-2xl font-serif text-white">{formatNPR(prop.price)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2 mb-4">
                                                <MapPin className="h-3.5 w-3.5 text-accent" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-accent transition-colors">{prop.location}</span>
                                            </div>
                                            <h3 className="text-3xl font-serif text-primary mb-8 leading-tight line-clamp-1">{prop.title}</h3>
                                            <div className="flex items-center gap-8 pt-8 border-t border-accent/10">
                                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary/60">
                                                    <Bed className="h-5 w-5 text-accent/40" /> {prop.bedrooms} Bed
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary/60">
                                                    <Bath className="h-5 w-5 text-accent/40" /> {prop.bathrooms} Bath
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* --- TECHNOLOGY SHOWCASE --- */}
            <section className="py-40 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="bg-primary p-16 rounded-[4rem] text-white relative overflow-hidden group shadow-3xl"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <h2 className="text-5xl font-serif mb-10 text-accent">Imperial <br /><span className="text-white italic">Intelligence</span></h2>
                            <p className="text-lg text-gray-400 mb-16 font-medium leading-relaxed italic border-l-4 border-accent/30 pl-8">
                                "Our proprietary scanning engine cross-references sovereign Lalpurja data with the national registry in real-time, ensuring zero fraud."
                            </p>

                            <div className="space-y-12">
                                {[
                                    { icon: <ShieldCheck />, title: 'Sovereign OCR Scan', desc: 'Secure verification of official Nepali documents.' },
                                    { icon: <Layers />, title: 'Smart Contract Deeds', desc: 'Blockchain-backed immutable property records.' },
                                    { icon: <TrendingUp />, title: 'Market Oracle', desc: 'Predictive analytics for Nepal\'s changing real estate landscape.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-8 items-start group/item">
                                        <div className="h-16 w-16 bg-accent/10 rounded-3xl flex items-center justify-center shrink-0 text-accent group-hover/item:bg-accent group-hover/item:text-primary transition-all duration-500 shadow-lg">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-serif text-white mb-2">{item.title}</h4>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed opacity-70 group-hover/item:opacity-100 transition-opacity">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="relative"
                        >
                            <div className="relative z-10 p-5 bg-white rounded-[4rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.15)] border border-accent/20 group overflow-hidden">
                                <Image 
                                    src="https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=1200"
                                    alt="Technology Integration"
                                    width={1000}
                                    height={1200}
                                    className="rounded-[3rem] w-full transition-transform duration-[3s] group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/40 cursor-pointer hover:scale-125 transition-all shadow-2xl">
                                    <Crown className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            {/* Decorative Grid */}
                            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-accent/10 blur-[90px] rounded-full -z-10" />
                            <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/5 blur-[70px] rounded-full -z-10" />
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* --- ELEGANT CTA --- */}
            <section className="py-40 relative">
                <Container>
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                        className="bg-primary rounded-[5rem] py-32 text-center relative overflow-hidden border border-accent/30"
                    >
                        {/* Background Patterns */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 15, repeat: Infinity }}
                            className="absolute top-[-30%] right-[-10%] w-[70%] h-[70%] bg-accent/20 rounded-full blur-[180px] pointer-events-none" 
                        />

                        <div className="relative z-10 px-8">
                            <motion.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="mx-auto h-20 w-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mb-12 shadow-gold-glow"
                            >
                                <Crown className="h-10 w-10" />
                            </motion.div>
                            
                            <h2 className="text-5xl lg:text-8xl font-serif text-white mb-10 leading-tight">Begin Your Personal <br /> <span className="italic text-accent">Dynasty.</span></h2>
                            <p className="text-gray-400 max-w-2xl mx-auto mb-20 text-xl font-medium leading-relaxed italic">
                                "Gain exclusive access to the most coveted real estate opportunities in the Himalayas and preserve your heritage with imperial precision."
                            </p>
                            
                            <div className="flex flex-wrap gap-10 justify-center items-center">
                                <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
                                    <Button className="h-24 px-16 text-sm font-black rounded-full bg-accent text-primary hover:bg-white transition-all duration-500 shadow-[0_20px_50px_rgba(197,160,89,0.3)] hover:shadow-white/20 uppercase tracking-widest">
                                        {isLoggedIn ? 'Access Your Dashboard' : 'Initiate Membership'}
                                    </Button>
                                </Link>
                                <Link href="/properties">
                                    <Button variant="outline" className="h-24 px-16 text-sm font-black rounded-full border-white/20 text-white hover:bg-white/5 backdrop-blur-xl transition-all uppercase tracking-widest">
                                        Review Masterpieces
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </div>
    );
}

