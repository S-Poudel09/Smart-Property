'use client';

import { useState } from 'react';
import { 
    Sparkles, TrendingUp, Info, 
    ChevronRight, Loader2, Target,
    BarChart3, PieChart, Calculator,
    ShieldCheck, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictPrice } from '@/lib/api/properties';
import { formatNPR } from '@/lib/utils/currency';
import { toast } from 'react-hot-toast';

interface MarketInsightsProps {
    propertyId: string;
    currentPrice: number;
    area: number;
    location: string;
}

export default function MarketInsights({ propertyId, currentPrice, area, location }: MarketInsightsProps) {
    const [prediction, setPrediction] = useState<any>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [roiInputs, setRoiInputs] = useState({
        monthlyRent: currentPrice * 0.003, // Estimate 0.3% of price as monthly rent
        occupancy: 95,
        annualAppreciation: 8
    });
    const [showRoi, setShowRoi] = useState(false);

    const handlePredict = async () => {
        try {
            setIsPredicting(true);
            const data = await predictPrice(propertyId);
            setPrediction(data.prediction);
            toast.success('Market valuation synchronized');
        } catch (err) {
            toast.error('Prediction node timeout');
        } finally {
            setIsPredicting(false);
        }
    };

    const annualRent = roiInputs.monthlyRent * 12 * (roiInputs.occupancy / 100);
    const grossYield = (annualRent / currentPrice) * 100;
    const estimatedRoi = grossYield + roiInputs.annualAppreciation;

    return (
        <div className="space-y-10">
            {/* AI Prediction Section */}
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px] -mr-40 -mt-40 transition-all group-hover:bg-indigo-100/40 duration-1000" />
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic">Neural Valuation Engine</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter italic uppercase flex items-center gap-6">
                                <Sparkles className="h-8 w-8 text-indigo-600" />
                                AI-Powered Prediction
                            </h2>
                        </div>
                        
                        {!prediction && (
                            <button 
                                onClick={handlePredict}
                                disabled={isPredicting}
                                className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-4 shadow-xl active:scale-95 disabled:opacity-50 italic group/btn"
                            >
                                {isPredicting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Target className="h-5 w-5 group-hover/btn:scale-125 transition-transform" />
                                )}
                                {isPredicting ? 'Synthesizing Node Data...' : 'Generate Market Estimate'}
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {prediction ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner group/card">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Estimated Asset Value</p>
                                    <div className="text-4xl font-black text-indigo-600 font-outfit tracking-tighter italic">
                                        {formatNPR(prediction.estimated_price)}
                                    </div>
                                    <div className="mt-4 flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase italic">
                                        <TrendingUp className="h-4 w-4" /> Market Synergy: Stable
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Confidence Metric</p>
                                    <div className="flex items-end gap-3 text-4xl font-black text-slate-900 font-outfit tracking-tighter italic">
                                        {prediction.confidence * 100}%
                                        <span className="text-[11px] font-bold text-slate-400 mb-1">Precision</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full mt-4 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${prediction.confidence * 100}%` }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="h-full bg-indigo-500" 
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 italic">Model Core</p>
                                        <p className="text-white text-[12px] font-black uppercase tracking-widest italic">{prediction.model_type}</p>
                                    </div>
                                    <button 
                                        onClick={() => setPrediction(null)}
                                        className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all italic text-left"
                                    >
                                        Reset Calculation Cache
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50/50">
                                <TrendingUp className="h-12 w-12 text-slate-200 mb-6" />
                                <p className="text-slate-400 text-sm font-medium italic leading-relaxed max-w-sm">
                                    Launch the Neural Valuation Engine to generate a high-precision market estimate based on current regional telemetry and asset specs.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Investment Analysis Section */}
            <div className="bg-slate-950 p-12 lg:p-16 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:scale-150 duration-1000" />
                
                <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                    <div className="flex-1 space-y-10">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 italic">ROI Prediction Protocol</span>
                            </div>
                            <h2 className="text-4xl font-black text-white font-outfit tracking-tighter italic uppercase flex items-center gap-6">
                                <Calculator className="h-8 w-8 text-emerald-400" />
                                Investment Analysis
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block">Target Monthly Revenue (NPR)</label>
                                <input 
                                    type="number" 
                                    value={roiInputs.monthlyRent}
                                    onChange={(e) => setRoiInputs({...roiInputs, monthlyRent: Number(e.target.value)})}
                                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-xl font-black italic focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block">Projected Occupancy (%)</label>
                                <input 
                                    type="number" 
                                    value={roiInputs.occupancy}
                                    onChange={(e) => setRoiInputs({...roiInputs, occupancy: Number(e.target.value)})}
                                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-xl font-black italic focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-start gap-6">
                            <AlertCircle className="h-6 w-6 text-emerald-400 mt-1" />
                            <p className="text-[11px] font-medium text-emerald-100/60 leading-relaxed italic">
                                Professional intelligence suggests a current market baseline of 3-5% annual rental yield for this sector, supplemented by 8-12% capital appreciation.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-[400px]">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-3xl text-center space-y-10 group/res relative">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/res:opacity-100 transition-opacity rounded-[2.5rem]" />
                            
                            <div className="relative">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 italic">Forecasted Annual ROI</p>
                                <div className="text-7xl font-black text-white font-outfit tracking-tighter italic mb-4">
                                    {estimatedRoi.toFixed(1)}%
                                </div>
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 italic">
                                    <Target className="h-3.5 w-3.5" /> High Potential Asset
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/10 relative">
                                <div className="text-left py-4 px-6 bg-white/5 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Yield Index</p>
                                    <p className="text-xl font-black text-white italic">{grossYield.toFixed(2)}%</p>
                                </div>
                                <div className="text-left py-4 px-6 bg-white/5 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Annual Cash</p>
                                    <p className="text-xl font-black text-white italic">{formatNPR(annualRent)}</p>
                                </div>
                            </div>

                            <button className="w-full h-16 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl italic relative z-10">
                                Download Investment Prospectus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

