'use client';

import { useEffect, useState } from 'react';
import { getLoans, Loan } from '@/lib/api/loans';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Landmark, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, Crown, Sparkles, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import Container from '@/components/layout/Container';
import { motion } from 'framer-motion';

export default function BuyerLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getLoans();
                setLoans(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#fffdf9] flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-16">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Crown className="h-6 w-6 text-accent" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Financial Sovereignty</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif text-primary leading-tight">Mortgage Registry</h1>
                    <p className="text-xl text-gray-400 mt-4 font-medium italic border-l-4 border-accent/30 pl-8">
                        "Tracking the imperial grants and financial vessels destined for your estate acquisitions."
                    </p>
                </motion.div>

                {loans.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-white/60 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-accent/20"
                    >
                        <div className="h-24 w-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-gold-glow">
                            <Landmark className="h-10 w-10 text-accent" />
                        </div>
                        <h2 className="text-4xl font-serif text-primary mb-4 leading-tight">No Active Financial Decree</h2>
                        <p className="text-gray-400 max-w-md mx-auto font-medium italic mb-12">
                            "The treasury records show no active loan applications for your account. Consult the royal calculators to begin your quest."
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {loans.map((loan, idx) => (
                            <motion.div 
                                key={loan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-accent/10 p-10 shadow-xl shadow-accent/5 hover:shadow-2xl hover:shadow-accent/10 transition-all group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-accent/10 transition-all duration-700" />
                                
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="h-16 w-16 bg-primary text-accent rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Landmark className="h-8 w-8" />
                                    </div>
                                    <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        loan.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        loan.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {loan.status.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                <div className="space-y-8 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 font-black">Imperial Grant Amount</p>
                                        <p className="text-5xl font-serif text-primary tracking-tight">Rs. {parseFloat(loan.loan_amount).toLocaleString()}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-10 border-t border-accent/5">
                                        <div className="flex items-center gap-4 group/box">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/box:bg-primary group-hover/box:text-accent transition-all">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sealed On</p>
                                                <p className="text-xs font-black text-primary uppercase">{format(new Date(loan.application_date), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group/box">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/box:bg-primary group-hover/box:text-accent transition-all">
                                                <TrendingUpIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Interest Decree</p>
                                                <p className="text-xs font-black text-primary uppercase">{loan.interest_rate}% APR</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
