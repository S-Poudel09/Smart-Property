'use client';

import { useState } from 'react';
import { calculateEMI, checkEligibility } from '@/lib/api/loans';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { Calculator, CheckCircle, AlertCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatNPR } from '@/lib/utils/currency';

export default function EMICalculator() {
    const [amount, setAmount] = useState('100000');
    const [rate, setRate] = useState('8.5');
    const [tenure, setTenure] = useState('20');
    const [income, setIncome] = useState('80000');
    
    const [emiResult, setEmiResult] = useState<any>(null);
    const [eligibility, setEligibility] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const res = await calculateEMI(parseFloat(amount), parseFloat(rate), parseInt(tenure));
            setEmiResult(res);
            
            const elig = await checkEligibility(parseFloat(income), parseFloat(amount));
            setEligibility(elig);
        } catch (e) {
            toast.error('Failed to calculate. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Inputs */}
                <div className="p-8 lg:p-10 border-r border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Calculator className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Loan Intelligence</h2>
                            <p className="text-sm text-gray-500">Calculate EMI & check eligibility instantly</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Loan Amount (Rs)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Interest Rate (%)</label>
                                <div className="relative">
                                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Tenure (Years)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="number"
                                        value={tenure}
                                        onChange={(e) => setTenure(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Annual Income (Rs)</label>
                            <input 
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold"
                            />
                        </div>

                        <Button 
                            onClick={handleCalculate} 
                            disabled={loading}
                            className="w-full !py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20"
                        >
                            {loading ? <Loader size="sm" /> : 'Calculate My Options'}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div className="p-8 lg:p-10 bg-blue-50/50">
                    {!emiResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Calculator className="h-8 w-8 text-blue-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Yet</h3>
                            <p className="text-sm text-gray-500 max-w-[240px]">Fill in the details to see your monthly commitments and eligibility status.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* EMI Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                                <p className="text-4xl font-black text-blue-600 mb-4">{formatNPR(emiResult.monthly_emi)}</p>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total Interest</p>
                                        <p className="font-bold text-gray-900">{formatNPR(emiResult.total_interest)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total Payable</p>
                                        <p className="font-bold text-gray-900">{formatNPR(emiResult.total_payable)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Eligibility Status */}
                            <div className={`p-6 rounded-3xl border ${
                                !eligibility ? 'bg-gray-50 border-gray-100' :
                                eligibility.is_eligible 
                                    ? 'bg-indigo-50 border-indigo-100' 
                                    : 'bg-red-50 border-red-100'
                            }`}>
                                {!eligibility ? (
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-6 w-6 text-gray-400" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">Awaiting Eligibility</h3>
                                            <p className="text-xs text-gray-500 mt-1">Check your income to see if you qualify.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-4">
                                        {eligibility.is_eligible ? (
                                            <CheckCircle className="h-6 w-6 text-indigo-700 shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                                        )}
                                        <div>
                                            <h3 className={`font-bold ${eligibility.is_eligible ? 'text-green-900' : 'text-red-900'}`}>
                                                {eligibility.is_eligible ? 'Likely Eligible' : 'Eligibility Warning'}
                                            </h3>
                                            <p className={`text-sm mt-1 mb-4 ${eligibility.is_eligible ? 'text-indigo-800' : 'text-red-700'}`}>
                                                {eligibility.recommendation || 'No recommendation provided.'}
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="opacity-60">Max Monthly Debt Allowed</span>
                                                    <span className="font-bold">{formatNPR(eligibility.max_allowed_emi || 0)}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${eligibility.is_eligible ? 'bg-indigo-600' : 'bg-red-500'}`}
                                                        style={{ width: `${Math.min(100, (eligibility.estimated_emi / (eligibility.max_allowed_emi || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-tight font-medium leading-relaxed">
                                * This is an automated estimate for informational purposes only. Actual approval depends on document verification.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
