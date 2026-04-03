'use client';

import { useEffect, useState } from 'react';
import { getLoans, Loan } from '@/lib/api/loans';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Landmark, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, TrendingUp, ChevronRight, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import Container from '@/components/layout/Container';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

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

    if (loading) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Mortgage & Financing</h1>
                        <p className="text-gray-500 mt-1">Manage your loan applications and track repayment schedules.</p>
                    </div>
                    
                    <Link href="/dashboard/buyer/mortgage-calculator">
                        <Button className="h-11 rounded-lg flex items-center gap-2 font-bold px-6 shadow-lg shadow-primary/20">
                            <Calculator className="h-4 w-4" /> New Application
                        </Button>
                    </Link>
                </div>

                {loans.length === 0 ? (
                    <div className="bg-white rounded-xl p-20 border border-border shadow-sm text-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Landmark className="h-10 w-10 text-gray-200" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No active loans found</h2>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium italic">
                            You haven't applied for any property financing yet. Use our calculator to see your eligibility.
                        </p>
                        <Link href="/dashboard/buyer/mortgage-calculator">
                            <Button variant="outline" className="h-11 rounded-lg px-8 border-border text-gray-500 font-bold">Try Loan Calculator</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {loans.map((loan, idx) => (
                                <motion.div 
                                    key={loan.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-2xl border border-border p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
                                    
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className="h-14 w-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform border border-primary/10">
                                            <Landmark className="h-7 w-7" />
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                            loan.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            loan.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {loan.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1.5 font-bold">Total Principal Amount</p>
                                            <p className="text-3xl font-bold text-gray-900 tracking-tight">Rs. {parseFloat(loan.loan_amount).toLocaleString()}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Application Date</p>
                                                    <p className="text-xs font-bold text-gray-900">{format(new Date(loan.application_date), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <TrendingUp className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Interest Rate</p>
                                                    <p className="text-xs font-bold text-gray-900">{loan.interest_rate}% Fixed APR</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-xs font-bold text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all">
                                            View Full Schedule <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                
                <div className="mt-12 bg-[#F8F7FC] p-8 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center text-gray-400">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Planning your next acquisition?</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Estimate your monthly payments and interest costs with our advanced EMI calculator.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/buyer/mortgage-calculator">
                        <Button className="rounded-lg h-11 px-8 text-xs font-bold shadow-sm bg-white text-gray-500 border-border hover:bg-gray-50">Open Calculator</Button>
                    </Link>
                </div>
            </Container>
        </div>
    );
}

