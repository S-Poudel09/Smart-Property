'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getAllLoans, updateLoanStatus } from '@/lib/loans/storage';
import { getPropertyById } from '@/lib/properties/storage';

import { LoanRequest, LoanStatus } from '@/types/loan';
import { LoanStatusBadge } from '@/components/loan/LoanStatusBadge';
import { Button } from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Landmark, Coins, Receipt, ArrowRight, X, Crown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLoansPage() {
    const [loans, setLoans] = useState<LoanRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const data = getAllLoans();
        setLoans(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    }, []);

    const fetchLoans = () => {
        const data = getAllLoans();
        setLoans(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    const handleStatusUpdate = (id: string, status: LoanStatus, reason?: string) => {
        updateLoanStatus(id, status, reason);
        toast.success(`Petition ${status.toLowerCase().replace('_', ' ')} by the Treasury`);
        fetchLoans();
        setSelectedLoan(null);
        setRejectionReason('');
    };

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.buyerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.propertyId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : loan.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-[#fffdf9] py-12">
                <Container>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Landmark className="h-5 w-5 text-[#c5a059]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Imperial Treasury</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-serif text-[#1a1a2e]">Financial Petitions</h1>
                            <p className="text-gray-400 mt-2 font-medium italic">Reviewing sovereign loan requests and endowment allocations</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
                                <input
                                    type="text"
                                    placeholder="Search petitions..."
                                    className="pl-12 pr-6 py-4 bg-white/80 backdrop-blur-xl border border-[#c5a059]/10 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 shadow-lg min-w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-white/80 backdrop-blur-xl border border-[#c5a059]/10 rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#c5a059]/20 shadow-lg"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All States</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="UNDER_REVIEW">In Review</option>
                                <option value="APPROVED">Treasury Grant</option>
                                <option value="REJECTED">Denied</option>
                            </select>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-[#c5a059]/5 border border-[#c5a059]/10 overflow-hidden min-h-[600px]"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fffdf9] text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-black border-b border-[#c5a059]/10">
                                    <tr>
                                        <th className="px-8 py-8">Petitioner</th>
                                        <th className="px-8 py-8">Target Asset</th>
                                        <th className="px-8 py-8">Request Value</th>
                                        <th className="px-8 py-8 text-center">Endowment State</th>
                                        <th className="px-8 py-8 text-right">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c5a059]/5">
                                    {filteredLoans.map((loan, i) => {
                                        const prop = getPropertyById(loan.propertyId);
                                        return (
                                            <motion.tr 
                                                key={loan.id} 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-[#c5a059]/5 transition-all group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center text-[#c5a059] shadow-lg group-hover:scale-110 transition-transform">
                                                            <Landmark className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-gray-400">#{loan.buyerId.slice(0, 10)}...</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-lg font-serif text-[#1a1a2e]">{prop?.title || 'Unknown Asset'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {loan.propertyId.slice(0, 12)}...</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-lg font-serif text-[#1a1a2e]">Rs {loan.amountRequested.toLocaleString()}</div>
                                                    <div className="text-[10px] text-[#c5a059] font-black uppercase tracking-tighter mt-1 italic">Income: Rs {loan.income.toLocaleString()}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <LoanStatusBadge status={loan.status} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Button
                                                        className="h-10 px-6 rounded-full bg-[#1a1a2e] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1a2e] border border-[#c5a059]/20 shadow-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                        onClick={() => setSelectedLoan(loan)}
                                                    >
                                                        Review Petition
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredLoans.length === 0 && (
                                <div className="py-32 text-center">
                                    <p className="text-lg font-serif text-gray-400 italic">No petitions found in the treasury archives.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </Container>

                {/* Management Modal */}
                <AnimatePresence>
                    {selectedLoan && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setSelectedLoan(null)}
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                className="bg-white/95 backdrop-blur-2xl rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border-t-8 border-t-[#c5a059]"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-3xl font-serif text-[#1a1a2e]">Treasury Appraisal</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] mt-2">Financial Standing Analysis</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedLoan(null)} 
                                        className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-inner"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6 mb-12">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-6 bg-[#fffdf9] border border-[#c5a059]/10 rounded-[2.5rem] shadow-sm">
                                            <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-2">Petitioner Standing</p>
                                            <p className="text-lg font-serif text-[#1a1a2e] capitalize">{selectedLoan.employmentStatus}</p>
                                        </div>
                                        <div className="p-6 bg-[#fffdf9] border border-[#c5a059]/10 rounded-[2.5rem] shadow-sm">
                                            <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-2">Declared Revenue</p>
                                            <p className="text-lg font-serif text-[#1a1a2e]">Rs {selectedLoan.income.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedLoan.message && (
                                        <div className="p-8 bg-[#fffdf9] border border-[#c5a059]/10 rounded-[3rem] shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Receipt className="h-12 w-12 text-[#c5a059]" />
                                            </div>
                                            <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-4">Petitioner&apos;s Appeal</p>
                                            <p className="text-sm text-[#1a1a2e] font-serif italic leading-relaxed">&quot;{selectedLoan.message}&quot;</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button
                                        className="h-16 rounded-full bg-[#1a1a2e] text-[#c5a059] font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 group border border-[#c5a059]/20"
                                        onClick={() => handleStatusUpdate(selectedLoan.id, 'UNDER_REVIEW')}
                                    >
                                        <Clock className="h-4 w-4 group-hover:rotate-45 transition-transform" /> Place Under Audit
                                    </Button>
                                    <Button
                                        className="h-16 rounded-full bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 group"
                                        onClick={() => handleStatusUpdate(selectedLoan.id, 'APPROVED')}
                                    >
                                        <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" /> Grant Endowment
                                    </Button>
                                    
                                    <div className="col-span-2 space-y-6 pt-10 border-t border-[#c5a059]/10 mt-6">
                                        <textarea
                                            className="w-full rounded-[2.5rem] border-[#c5a059]/20 bg-[#fffdf9] text-sm focus:border-red-500 transition-all p-8 min-h-[140px] outline-none font-medium italic"
                                            placeholder="Decree for denial (required for rejection)..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-16 rounded-full border-[#1a1a2e] text-[#1a1a2e] font-black uppercase tracking-widest text-[10px]"
                                                onClick={() => setSelectedLoan(null)}
                                            >
                                                Defer Judgment
                                            </Button>
                                            <Button
                                                className="flex-1 bg-red-600 hover:bg-red-700 h-16 rounded-full font-black uppercase tracking-widest text-[10px] text-white disabled:opacity-30 flex items-center justify-center gap-2 shadow-xl"
                                                disabled={!rejectionReason.trim()}
                                                onClick={() => handleStatusUpdate(selectedLoan.id, 'REJECTED', rejectionReason)}
                                            >
                                                <XCircle className="h-4 w-4" /> Banish Petition
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}
