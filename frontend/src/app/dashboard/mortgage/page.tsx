'use client';

import EMICalculator from '@/components/loans/EMICalculator';
import { Landmark, Compass, ShieldCheck, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MortgageIntelligencePage() {
    return (
        <div className="max-w-7xl mx-auto space-y-16">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-slate-100 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Landmark className="h-6 w-6 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Capital Forensics</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter italic">Mortgage Intelligence</h1>
                    <p className="text-lg text-slate-500 mt-5 font-medium italic border-l-4 border-indigo-500/20 pl-8 max-w-xl leading-relaxed">
                        "High-precision amortization analysis and structural financing eligibility for premium property acquisitions."
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-indigo-50 px-8 py-5 rounded-[2rem] border border-indigo-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/40 transition-all duration-1000"></div>
                    <div className="h-10 w-10 bg-white rounded-xl shadow-lg border border-indigo-100 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">Yield Projection</p>
                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 font-sans animate-pulse">Optimal Credit Ready</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <div className="xl:col-span-2">
                    <EMICalculator />
                </div>
                
                <div className="space-y-10">
                    <div className="bg-[#0f172a] p-12 rounded-[3.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-indigo-500/40 transition-all duration-1000"></div>
                        <TrendingUp className="h-10 w-10 text-indigo-500 mb-10" />
                        <h3 className="text-2xl font-black font-outfit mb-4 italic">Rate Trajectory</h3>
                        <p className="text-slate-400 text-sm mb-12 font-medium italic leading-relaxed">
                            "Current market volatility is low. Lockdown your fixed rates now to maximize generational portfolio growth."
                        </p>
                        <button className="w-full bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-indigo-900/10 hover:bg-indigo-400 active:scale-95">
                            Connect with Financer
                        </button>
                    </div>

                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="h-12 w-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-100">
                                 <AlertCircle className="h-6 w-6" />
                             </div>
                             <div>
                                 <h4 className="text-lg font-black text-slate-900 font-outfit">Risk Profile</h4>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Automated Oversight</p>
                             </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                            "Your financing trajectory is based on current state interest benchmarks and imperial registry history."
                        </p>
                        <div className="mt-10 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                             <div className="h-full w-4/5 bg-indigo-500 rounded-full"></div>
                        </div>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-4 text-center">80% System Health Match</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
