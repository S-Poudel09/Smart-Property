'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactions, Transaction } from '@/lib/api/transactions';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatNPR } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Clock, CreditCard, ChevronRight, Filter, Building, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function BuyerTransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        getTransactions()
            .then(data => {
                const arr = Array.isArray(data) ? data : (data as { results?: Transaction[] }).results ?? [];
                setTransactions(arr);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = transactions.filter(tx => {
        const titleMatch = (tx.Property?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || tx.status?.toLowerCase() === statusFilter.toLowerCase();
        return titleMatch && statusMatch;
    });

    if (loading) return <div className="h-[60vh] flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Area */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-border/40 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-2 w-10 bg-accent rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Audited Records</span>
                    </div>
                    <h1 className="text-5xl font-black text-primary font-outfit tracking-tight italic leading-none">Operations Ledger</h1>
                    <p className="text-lg text-muted mt-5 font-medium italic border-l-4 border-accent/20 pl-8 max-w-xl">
                        &quot;Your consolidated history of asset inquiries, valuation decrees, and confirmed acquisitions.&quot;
                    </p>
                </div>
                
                <div className="flex items-center gap-5">
                    <button className="btn-premium bg-slate-100 text-primary hover:bg-slate-200 shadow-none border border-border/60">
                         <Download className="h-5 w-5" /> Export Statements
                    </button>
                    <Link href="/properties">
                        <button className="btn-premium bg-primary text-white hover:bg-slate-800 shadow-xl shadow-primary/20">
                             Initiate Inquiry
                        </button>
                    </Link>
                </div>
            </header>

            {/* Tactical Filters */}
            <div className="flex flex-wrap items-center justify-between gap-8 bg-white p-2 rounded-[2rem] border border-border/60 shadow-sm px-8 py-5">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-border/40">
                        <Filter className="h-3.5 w-3.5 text-muted" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Filter status</span>
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'completed', 'verified'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-white shadow-lg shadow-primary/10 scale-105' : 'hover:bg-slate-100 text-muted hover:text-primary'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-accent transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by property title..." 
                        className="w-full pl-14 pr-6 py-3.5 bg-slate-50/50 border border-border/60 rounded-2xl text-[13px] font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-32 border-2 border-dashed border-border/60 text-center">
                    <div className="h-24 w-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-10 border border-border/40">
                        <Activity className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-black text-primary font-outfit uppercase italic tracking-tighter">No Operations Detected</h2>
                    <p className="text-muted font-medium italic mt-4 max-w-sm mx-auto mb-12">
                        &quot;Your transaction registry is currently clear. Direct actions are required to initialize records.&quot;
                    </p>
                    <Link href="/properties">
                        <button className="btn-premium bg-primary text-white hover:bg-slate-800 shadow-xl shadow-primary/20">Launch Search</button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((tx, idx) => (
                            <motion.div
                                key={tx.TransactionID || idx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="dashboard-card group !p-8 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-accent/5 transition-all duration-700"></div>
                                
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className="h-20 w-20 bg-slate-50 border border-border/60 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                                            <Building className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h3 
                                                className="text-2xl font-black text-primary font-outfit truncate max-w-xs xl:max-w-md cursor-pointer hover:text-accent transition-colors leading-none tracking-tighter mb-4" 
                                                onClick={() => tx.Property?.id && router.push(`/properties/${tx.Property.id}`)}
                                            >
                                                {tx.Property?.title ?? 'Property Inquiry'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-border/40">
                                                    <Clock className="h-3 w-3 text-accent" />
                                                    Ref: #{(tx.TransactionID || 'ID').toString().split('-')[0].toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-border/40">
                                                    <CreditCard className="h-3 w-3 text-accent" />
                                                    {tx.payment_method || 'Imperial Wire'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end gap-16 border-t lg:border-t-0 pt-8 lg:pt-0">
                                        <div className="text-left lg:text-right">
                                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Registry Valuation</p>
                                            <p className="text-3xl font-black text-primary tracking-tighter">{formatNPR(tx.total_amount)}</p>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <div className="scale-110">
                                               <StatusBadge status={tx.status} />
                                            </div>
                                            <Link href={`/dashboard/buyer/transactions/${tx.TransactionID}`} className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white border border-border hover:bg-primary hover:border-primary group/link shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all">
                                                <ChevronRight className="h-6 w-6 text-muted group-hover/link:text-white transform group-hover/link:translate-x-1 transition-all" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <div className="bg-primary p-12 rounded-[3.5rem] text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-accent/40"></div>
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                     <div className="h-20 w-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0">
                         <ShieldCheck className="h-10 w-10 text-accent" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black font-outfit mb-2 italic">Registry Protocol Information</h3>
                        <p className="text-slate-300 font-medium leading-relaxed italic max-w-3xl">
                            &quot;Current operations remain in PENDING verification until documentation is authourized by the Imperial Council. 
                            If records appear stagnant, please verify your KYC status in the profile wing.&quot;
                        </p>
                     </div>
                 </div>
            </div>
        </div>
    );
}

