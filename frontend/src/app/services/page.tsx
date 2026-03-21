'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import { getAllProviders } from '@/lib/services/storage';
import { ServiceProvider } from '@/types/service';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { Briefcase, Sparkles, Crown, Search, Navigation, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';

export default function ServicesPage() {
    const [providers, setProviders] = useState<ServiceProvider[]>(() => {
        if (typeof window === 'undefined') return [];
        return getAllProviders();
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredProviders = providers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#fffdf9] pb-32">
            {/* Hero Section */}
            <div className="premium-gradient py-32 text-white relative overflow-hidden mb-16 px-4 sm:px-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Crown className="h-6 w-6 text-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">The Royal Registry of Artisans</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-serif mb-8 leading-[0.9]">Masterpiece <br /> <span className="italic text-accent">Marketplace.</span></h1>
                        <p className="text-xl text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8 leading-relaxed max-w-2xl">
                            "Connecting the realm's finest estate holders with elite artisans and verified experts of unparalleled skill."
                        </p>
                    </motion.div>
                </Container>

                {/* Decorative Elements */}
                <div className="absolute top-[-100px] right-[-100px] h-[400px] w-[400px] bg-accent/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-50px] left-[10%] h-[200px] w-[200px] bg-primary/20 rounded-full blur-[80px]"></div>
                <Briefcase className="absolute right-[5%] bottom-[-80px] h-96 w-96 text-white opacity-5 rotate-12 hidden lg:block" />
            </div>

            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16 bg-white/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-accent/10 shadow-2xl shadow-accent/5"
                >
                    <div className="flex items-center gap-3 mb-10 text-primary">
                        <Filter className="h-5 w-5 text-accent" />
                        <h3 className="text-sm font-black uppercase tracking-widest italic">Selective Perspective</h3>
                    </div>
                    <ServiceFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                    />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredProviders.map((provider, idx) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <ServiceCard provider={provider} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredProviders.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-white/60 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-accent/20"
                    >
                        <div className="h-24 w-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-gold-glow">
                            <Navigation className="h-10 w-10 text-accent" />
                        </div>
                        <h2 className="text-4xl font-serif text-primary mb-4 leading-tight">Expert Missing in Current Registry</h2>
                        <p className="text-gray-400 max-w-sm mx-auto font-medium italic mb-12">
                            "The heralds find no artisans matching your decree in this sector of the realm. Expand your search or check again later."
                        </p>
                        <Button 
                            onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                            className="h-16 px-12 bg-primary text-accent rounded-full font-black uppercase tracking-widest text-[10px] border border-accent/30 hover:bg-accent hover:text-primary transition-all shadow-xl"
                        >
                            Reset Discovery Manifest
                        </Button>
                    </motion.div>
                )}
            </Container>
        </div>
    );
}
