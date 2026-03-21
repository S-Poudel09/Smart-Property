'use client';

import { ServiceProvider } from '@/types/service';
import { Star, MapPin, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ServiceCardProps {
    provider: ServiceProvider;
}

export const ServiceCard = ({ provider }: ServiceCardProps) => {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-accent/10 p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden relative group hover:-translate-y-2 duration-500">
            <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.2em] border border-accent/20">
                    {provider.category}
                </span>
                {provider.verified && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4" />
                        Verified
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-serif text-primary mb-2 group-hover:text-accent transition-colors leading-tight">{provider.name}</h3>
            
            <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 text-accent">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm font-black text-primary">{provider.rating}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Elite Reviews</span>
            </div>

            <div className="space-y-3 mb-8 text-[11px] text-gray-500 font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    {provider.city}
                </div>
                <div className="inline-block px-3 py-1 bg-accent/10 rounded-lg text-accent text-[9px] border border-accent/20">
                    {provider.priceRange}
                </div>
            </div>

            <p className="text-sm text-gray-600 font-medium italic line-clamp-2 mb-10 h-10 leading-relaxed border-l-2 border-accent/20 pl-4">
                "{provider.description}"
            </p>

            <Link href={`/services/${provider.id}`}>
                <Button className="w-full h-16 rounded-full bg-primary text-accent hover:bg-accent hover:text-primary border border-accent/30 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group/btn shadow-xl transition-all">
                    Commission Expert
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
            </Link>

            <div className="absolute -top-10 -right-10 h-32 w-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all"></div>
        </div>
    );
};
