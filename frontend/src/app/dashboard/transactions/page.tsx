'use client';

import { useEffect, useState } from 'react';
import { getTransactions, Transaction, uploadPaymentProof, verifyPaymentProof } from '@/lib/api/transactions';
import { getUser } from '@/lib/auth/getUser';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { 
    CreditCard, Upload, CheckCircle, Clock, ArrowRight, 
    Home, DollarSign, FileText, Crown, Sparkles, Navigation, X,
    Fingerprint, Receipt, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Container from '@/components/layout/Container';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [uploading, setUploading] = useState(false);
    const [proofAmount, setProofAmount] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const user = getUser();

    const loadTx = async () => {
        try {
            const data = await getTransactions();
            const arr = Array.isArray(data) ? data : (data as any).results ?? [];
            setTransactions(arr);
            if (selectedTx) {
                const updated = arr.find((t: any) => (t.TransactionID || t.id) === (selectedTx.TransactionID || selectedTx.id));
                if (updated) setSelectedTx(updated);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTx();
    }, []);

    const handleUploadProof = async (e: React.FormEvent) => {
        e.preventDefault();
        const txId = selectedTx?.TransactionID || (selectedTx as any)?.id;
        if (!txId || !proofFile || !proofAmount || uploading) return;

        setUploading(true);
        try {
            await uploadPaymentProof(txId, parseFloat(proofAmount), proofFile);
            toast.success('Payment proof uploaded successfully!');
            setProofAmount('');
            setProofFile(null);
            loadTx();
        } catch (e) {
            toast.error('Failed to upload proof');
        } finally {
            setUploading(false);
        }
    };

    const handleVerifyProof = async (proofId: string) => {
        const txId = selectedTx?.TransactionID || (selectedTx as any)?.id;
        if (!txId) return;
        try {
            await verifyPaymentProof(txId, proofId);
            toast.success('Payment verified!');
            loadTx();
        } catch (e) {
            toast.error('Failed to verify payment');
        }
    };

    if (loading) return <div className="min-h-screen bg-[#fffdf9] flex justify-center items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Crown className="h-6 w-6 text-accent" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Imperial Ledger</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif text-primary leading-tight">Financial Manifest</h1>
                    <p className="text-xl text-gray-400 mt-4 font-medium italic border-l-4 border-accent/30 pl-8">
                        "Tracking the flow of wealth and the sealing of property covenants across the realm."
                    </p>
                </motion.div>

                {transactions.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-white/60 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-accent/20"
                    >
                        <div className="h-24 w-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-gold-glow">
                            <CreditCard className="h-10 w-10 text-accent" />
                        </div>
                        <h2 className="text-4xl font-serif text-primary mb-4 leading-tight">No Active Manifests</h2>
                        <p className="text-gray-400 max-w-md mx-auto font-medium italic mb-12">
                            "The royal ledger contains no active financial covenents for your account."
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* List */}
                        <div className="lg:col-span-1 space-y-6">
                            <AnimatePresence>
                                {transactions.map((tx, idx) => {
                                    const txId = tx.TransactionID || (tx as any).id;
                                    const isSelected = (selectedTx?.TransactionID || (selectedTx as any)?.id) === txId;
                                    
                                    return (
                                        <motion.button
                                            key={txId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => setSelectedTx(tx)}
                                            className={`w-full text-left p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
                                                isSelected 
                                                    ? 'bg-primary text-white border-accent shadow-2xl scale-[1.02] active:scale-95' 
                                                    : 'bg-white/80 border-accent/10 hover:border-accent/40 hover:shadow-xl active:scale-95'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                                                        isSelected ? 'bg-accent text-primary' : 'bg-primary/5 text-primary'
                                                    }`}>
                                                        <Home className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-1 ${isSelected ? 'text-accent' : 'text-gray-400'}`}>Estate Asset</span>
                                                        <span className="font-serif text-lg truncate max-w-[150px] block leading-tight">{tx.Property?.title}</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                                                    tx.status === 'COMPLETED' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                                    tx.status === 'PARTIAL' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end relative z-10">
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-accent/60' : 'text-gray-400'}`}>Imperial Investment</p>
                                                    <p className={`text-2xl font-serif ${isSelected ? 'text-white' : 'text-primary'}`}>Rs. {parseFloat(tx.total_amount).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-accent/60' : 'text-gray-400'}`}>Manifest Date</p>
                                                    <p className={`text-xs font-black uppercase ${isSelected ? 'text-white' : 'text-primary'}`}>{format(new Date(tx.created_at), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <motion.div 
                                                    layoutId="active-indicator"
                                                    className="absolute bottom-0 left-0 right-0 h-1 bg-accent shadow-gold-glow"
                                                />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Detail Area */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {selectedTx ? (
                                    <motion.div 
                                        key={(selectedTx.TransactionID || (selectedTx as any).id)}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-accent/10 shadow-3xl overflow-hidden shadow-accent/5 flex flex-col h-full"
                                    >
                                        <div className="p-10 border-b border-accent/5 bg-primary text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Fingerprint className="h-5 w-5 text-accent" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Manifest Identity</span>
                                                    </div>
                                                    <h2 className="text-3xl font-serif mb-2 leading-tight">Covenant Details</h2>
                                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">ID: {selectedTx.TransactionID || (selectedTx as any).id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-2 block">Accord Progress</span>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-5xl font-serif text-white leading-none">{(selectedTx as any).Progress || 0}%</p>
                                                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                                                            <div 
                                                                className="h-full bg-accent shadow-gold-glow transition-all duration-1000" 
                                                                style={{ width: `${(selectedTx as any).Progress || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-12 space-y-12 overflow-y-auto max-h-[700px] scrollbar-hide">
                                            {/* Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-accent/5 group hover:bg-white hover:shadow-xl transition-all">
                                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-2">Total Decree</p>
                                                    <p className="text-xl font-serif text-primary leading-tight">Rs. {parseFloat(selectedTx.total_amount).toLocaleString()}</p>
                                                </div>
                                                <div className="p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50 group hover:bg-white hover:shadow-xl transition-all">
                                                    <p className="text-[9px] text-indigo-600 uppercase font-black tracking-widest mb-2">Wealth Transferred</p>
                                                    <p className="text-xl font-serif text-indigo-700 leading-tight">Rs. {parseFloat(selectedTx.amount_paid).toLocaleString()}</p>
                                                </div>
                                                <div className="p-6 bg-amber-50/30 rounded-[2rem] border border-amber-100/50 group hover:bg-white hover:shadow-xl transition-all">
                                                    <p className="text-[9px] text-amber-600 uppercase font-black tracking-widest mb-2">Due Balance</p>
                                                    <p className="text-xl font-serif text-amber-700 leading-tight">Rs. {(parseFloat(selectedTx.total_amount) - parseFloat(selectedTx.amount_paid)).toLocaleString()}</p>
                                                </div>
                                                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/5 group hover:bg-white hover:shadow-xl transition-all">
                                                    <p className="text-[9px] text-primary uppercase font-black tracking-widest mb-2">Vault Method</p>
                                                    <p className="text-xl font-serif text-primary leading-tight lowercase truncate">{selectedTx.payment_method}</p>
                                                </div>
                                            </div>

                                            {/* Proofs */}
                                            <div>
                                                <div className="flex items-center justify-between mb-8 border-b border-accent/5 pb-6">
                                                    <h3 className="text-2xl font-serif text-primary flex items-center gap-4">
                                                        <Receipt className="h-6 w-6 text-accent" />
                                                        Accord Records
                                                    </h3>
                                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">Imperial Proofs</span>
                                                </div>
                                                
                                                {(!selectedTx.Proofs || selectedTx.Proofs.length === 0) ? (
                                                    <div className="py-20 text-center border-2 border-dashed border-accent/10 rounded-[3rem] bg-gray-50/30">
                                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                            <FileText className="h-6 w-6 text-gray-200" />
                                                        </div>
                                                        <p className="text-sm font-medium italic text-gray-400">No payment proofs currently sealed.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {selectedTx.Proofs.map((proof: any) => (
                                                            <motion.div 
                                                                key={proof.ProofID || proof.id} 
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="flex items-center justify-between p-6 bg-white border border-accent/5 rounded-[2rem] hover:shadow-2xl hover:shadow-accent/5 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                                                                        proof.is_verified ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                                                    }`}>
                                                                        <Receipt className="h-7 w-7" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xl font-serif text-primary">Rs. {parseFloat(proof.amount).toLocaleString()}</p>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{format(new Date(proof.created_at), 'PPP')}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    {proof.is_verified ? (
                                                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                                                                            <CheckCircle className="h-3.5 w-3.5" /> Verified Accord
                                                                        </span>
                                                                    ) : (
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Pending Degree</span>
                                                                            {user?.role?.toLowerCase() === 'seller' && (
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    onClick={() => handleVerifyProof(proof.ProofID || proof.id)}
                                                                                    className="h-10 px-6 rounded-full bg-primary text-accent text-[9px] font-black uppercase tracking-widest border border-accent/30 shadow-lg hover:bg-accent hover:text-primary transition-all active:scale-95"
                                                                                >
                                                                                    Seal Record
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    <a 
                                                                        href={proof.proof_file} 
                                                                        target="_blank" 
                                                                        className="h-12 w-12 border border-accent/10 rounded-full flex items-center justify-center text-primary/30 hover:text-accent hover:border-accent group-hover:bg-primary transition-all active:scale-90"
                                                                    >
                                                                        <ArrowRight className="h-5 w-5" />
                                                                    </a>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Box */}
                                            {user?.role?.toLowerCase() === 'buyer' && selectedTx.status !== 'COMPLETED' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-10 bg-primary rounded-[3rem] text-white relative overflow-hidden shadow-3xl border border-accent/20 group"
                                                >
                                                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                                                    
                                                    <div className="relative z-10">
                                                        <h3 className="text-3xl font-serif text-accent mb-2 leading-tight">Transfer Wealth</h3>
                                                        <p className="text-white/60 font-medium italic mb-10">"Seal the next phase of your property covenent by providing visual evidence of your transfer."</p>
                                                        
                                                        <form onSubmit={handleUploadProof} className="space-y-8">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] block mb-4">Investment Amount</label>
                                                                    <div className="relative">
                                                                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                                                                        <input 
                                                                            type="number"
                                                                            value={proofAmount}
                                                                            onChange={(e) => setProofAmount(e.target.value)}
                                                                            placeholder="Amount in Rs."
                                                                            className="w-full bg-white/5 border-2 border-accent/20 rounded-[2rem] pl-16 pr-8 py-5 text-lg font-serif placeholder:italic placeholder:text-white/20 focus:bg-white/10 focus:border-accent transition-all outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] block mb-4">Decree Witness (File)</label>
                                                                    <div className="relative group/file h-[72px]">
                                                                        <input 
                                                                            type="file"
                                                                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                        />
                                                                        <div className="absolute inset-0 bg-white/5 border-2 border-dashed border-accent/20 rounded-[2rem] flex items-center justify-center gap-3 group-hover/file:bg-white/10 group-hover/file:border-accent transition-all">
                                                                            <Upload className="h-5 w-5 text-accent" />
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                                                                {proofFile ? proofFile.name : 'Select Imperial Witness'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button 
                                                                type="submit" 
                                                                disabled={uploading || !proofFile || !proofAmount}
                                                                className="w-full h-16 rounded-full bg-accent text-primary font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white hover:text-primary transition-all shadow-3xl shadow-accent/20 disabled:opacity-50 active:scale-95"
                                                            >
                                                                {uploading ? <Loader size="sm" /> : <><ShieldCheck className="h-5 w-5 mr-3" /> Seal & Dispatch Proof</>}
                                                            </Button>
                                                        </form>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-primary/20 bg-white/40 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-accent/20 py-40"
                                    >
                                        <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-inner mb-10 border border-white">
                                            <Navigation className="h-12 w-12 text-accent/20 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl font-serif text-primary/40 mb-4 italic leading-tight">Awaiting Selection</h3>
                                        <p className="text-sm font-medium italic text-gray-400">"Choose a manifest from the ledger to begin your financial audit."</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
