'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import { 
    ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft,
    Building, CreditCard, RefreshCw, AlertCircle, Trash2, 
    Fingerprint, Activity, Terminal, ArrowRight, Eye, Shield,
    UserCheck, Search, ShieldX, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface FraudAlert {
    id: string;
    category: 'CYBER_THREAT' | 'LISTING_INTEGRITY' | 'FINANCIAL_ANOMALY';
    type: string;
    user?: string;
    target: string;
    risk_score: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: string;
    description: string;
    amount?: string;
}

export default function FraudAuditPage() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [activeAlert, setActiveAlert] = useState<FraudAlert | null>(null);

    const fetchAlerts = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const res = await api.get('admin/fraud/');
            setAlerts(res.data);
            if (res.data.length > 0) {
                setActiveAlert(res.data[0]);
            } else {
                setActiveAlert(null);
            }
        } catch (e) {
            console.error('Failed to fetch fraud alerts', e);
            toast.error("Threat telemetry synchronization failed.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleDismiss = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        toast.success("Threat signature dismissed successfully.");
        if (activeAlert?.id === id) {
            setActiveAlert(null);
        }
    };

    const handleEscalate = (alert: FraudAlert) => {
        toast.success(`Threat escalated to Security Board. Ticket ID #${Math.floor(Math.random() * 90000) + 10000}`);
    };

    const handleForceSweep = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 1200));
        fetchAlerts(true);
        toast.success("Full system intelligence sweep complete. No new threats detected.");
    };

    const filteredAlerts = alerts.filter(a => {
        const matchesQuery = 
            a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user && a.user.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (filterCategory === 'ALL') return matchesQuery;
        return a.category === filterCategory && matchesQuery;
    });

    if (loading) return <div className="p-12 flex justify-center min-h-[60vh] items-center"><Loader size="lg" /></div>;

    const cyberThreatsCount = alerts.filter(a => a.category === 'CYBER_THREAT').length;
    const financialAnomaliesCount = alerts.filter(a => a.category === 'FINANCIAL_ANOMALY').length;
    const listingIntegrityCount = alerts.filter(a => a.category === 'LISTING_INTEGRITY').length;

    return (
        <div className="min-h-screen bg-slate-950 text-white py-12 pb-32 relative overflow-hidden">
            {/* Background glowing gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

            <Container>
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8"
                >
                    <div className="space-y-4">
                        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Monitor
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Core Shield v3.1</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black font-outfit tracking-tighter leading-tight italic uppercase text-white">
                            Fraud Integrity Scan
                        </h1>
                        <p className="text-slate-400 font-medium italic border-l-4 border-indigo-500/20 pl-8 max-w-xl text-sm leading-relaxed">
                            "Real-time heuristic threat detection ledger. Inspect listing multi-entry attempts, dark-web anomalies, and treasury thresholds."
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
                        <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">Sentinel Guard: ACTIVE</span>
                    </div>
                </motion.div>

                {/* Micro-Telemetry Node Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Compromised Assets', value: 'None', status: 'Optimal', icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                        { label: 'Anomalous Transfer', value: alerts.length, status: alerts.length > 0 ? 'Action Req' : 'Optimal', icon: Activity, color: alerts.length > 0 ? 'text-rose-400' : 'text-emerald-400', bg: alerts.length > 0 ? 'bg-rose-500/5' : 'bg-emerald-500/5', border: alerts.length > 0 ? 'border-rose-500/10' : 'border-emerald-500/10' },
                        { label: 'Node Authenticity', value: 'Verified', status: 'Nominal', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' }
                    ].map((f, i) => (
                        <motion.div 
                            key={f.label} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`${f.bg} border ${f.border} p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <f.icon className={`h-6 w-6 ${f.color} mb-4`} />
                            <div className="text-3xl font-black font-outfit italic mb-2">{f.value}</div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">{f.label}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                    f.status === 'Optimal' || f.status === 'Nominal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>{f.status}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter and Control Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex flex-wrap items-center gap-3">
                        {[
                            { id: 'ALL', label: 'All Telemetries', count: alerts.length },
                            { id: 'CYBER_THREAT', label: 'Cyber Threats', count: cyberThreatsCount },
                            { id: 'FINANCIAL_ANOMALY', label: 'Financial Anomalies', count: financialAnomaliesCount },
                            { id: 'LISTING_INTEGRITY', label: 'Listing Integrity', count: listingIntegrityCount }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterCategory(btn.id)}
                                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filterCategory === btn.id 
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' 
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                            >
                                {btn.label} <span className="ml-1 opacity-50 font-medium font-mono">({btn.count})</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative group flex-1 lg:flex-initial">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search system audit..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl w-full lg:w-64 focus:outline-none focus:border-indigo-500 focus:bg-white/10 text-xs font-bold text-white transition-all placeholder:text-slate-500"
                            />
                        </div>
                        <button 
                            onClick={handleForceSweep}
                            className={`h-12 w-12 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center p-0 transition-all active:scale-95 shrink-0 ${refreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Threat Logs Queue */}
                    <div className="xl:col-span-7">
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-black font-outfit italic tracking-tighter text-white uppercase">Threat Signatures</h2>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Realtime Audit Sentinel Pool</p>
                                </div>
                                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {filteredAlerts.length} Node{filteredAlerts.length !== 1 ? 's' : ''} Listed
                                </span>
                            </div>

                            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                                <AnimatePresence mode="popLayout">
                                    {filteredAlerts.map((alert, i) => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setActiveAlert(alert)}
                                            className={`p-6 flex items-start justify-between gap-6 hover:bg-white/[0.02] transition-all cursor-pointer ${
                                                activeAlert?.id === alert.id ? 'bg-indigo-600/10 border-l-4 border-l-indigo-600' : ''
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                                                    alert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    alert.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                }`}>
                                                    <ShieldAlert className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-xs font-black uppercase tracking-wider text-white">{alert.type}</h3>
                                                        <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                            alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                                                            alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-indigo-500/20 text-indigo-400'
                                                        }`}>{alert.severity}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium">Affected: <span className="text-indigo-300 font-bold">{alert.target}</span></p>
                                                    <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">{alert.description}</p>
                                                </div>
                                            </div>

                                            <div className="text-right space-y-2 shrink-0">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Risk Factor</span>
                                                    <span className={`text-sm font-black font-outfit tabular-nums italic ${
                                                        alert.risk_score >= 90 ? 'text-rose-400' :
                                                        alert.risk_score >= 70 ? 'text-amber-400' :
                                                        'text-indigo-400'
                                                    }`}>{alert.risk_score}%</span>
                                                </div>
                                                <span className="text-[8px] font-medium text-slate-500 block">
                                                    {format(new Date(alert.timestamp), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredAlerts.length === 0 && (
                                    <div className="p-20 text-center flex flex-col items-center">
                                        <ShieldCheck className="h-16 w-16 text-emerald-500/20 mb-4 animate-bounce" />
                                        <h3 className="text-lg font-black font-outfit uppercase tracking-tighter text-white italic">Ecosystem Immaculate</h3>
                                        <p className="text-slate-500 text-xs italic mt-2">Zero active threats detected in this sector scan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Threat Inspector Sidebar */}
                    <div className="xl:col-span-5">
                        <AnimatePresence mode="wait">
                            {activeAlert ? (
                                <motion.div
                                    key={activeAlert.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl space-y-8 sticky top-8"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Inspector Terminal</span>
                                            <h2 className="text-2xl font-black font-outfit italic tracking-tighter text-white uppercase mt-1">Audit Details</h2>
                                        </div>
                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                                            activeAlert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/10' :
                                            activeAlert.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10' :
                                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                        }`}>
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {/* Score Meter */}
                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Hazard Probability</span>
                                            <span className={`text-xl font-black font-outfit italic ${
                                                activeAlert.risk_score >= 90 ? 'text-rose-400' :
                                                activeAlert.risk_score >= 70 ? 'text-amber-400' :
                                                'text-indigo-400'
                                            }`}>{activeAlert.risk_score}% Risk</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${activeAlert.risk_score}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className={`h-full ${
                                                    activeAlert.risk_score >= 90 ? 'bg-rose-500' :
                                                    activeAlert.risk_score >= 70 ? 'bg-amber-500' :
                                                    'bg-indigo-500'
                                                }`} 
                                            />
                                        </div>
                                    </div>

                                    {/* Threat Data Fields */}
                                    <div className="space-y-4 text-xs font-bold text-slate-400">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Threat Type</div>
                                                <div className="text-white truncate">{activeAlert.type}</div>
                                            </div>
                                            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Threat ID</div>
                                                <code className="text-indigo-400 text-[10px] font-mono">{activeAlert.id.slice(0, 14)}...</code>
                                            </div>
                                        </div>

                                        {activeAlert.user && (
                                            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Account</div>
                                                <div className="text-indigo-300 font-mono break-all">{activeAlert.user}</div>
                                            </div>
                                        )}

                                        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Asset Node</div>
                                            <div className="text-white flex items-center gap-2">
                                                <Building className="h-4 w-4 text-slate-500" />
                                                {activeAlert.target}
                                            </div>
                                        </div>

                                        {activeAlert.amount && (
                                            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Transfer Valuation</div>
                                                <div className="text-xl font-black text-emerald-400 font-outfit italic tracking-tight">{activeAlert.amount}</div>
                                            </div>
                                        )}

                                        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">System Timestamp</div>
                                            <div className="text-white">
                                                {format(new Date(activeAlert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-2">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Heuristic Analysis Description</div>
                                            <p className="text-slate-300 text-[11px] font-medium leading-relaxed italic">
                                                "{activeAlert.description}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Group */}
                                    <div className="pt-6 border-t border-white/5 space-y-3">
                                        <button
                                            onClick={() => handleEscalate(activeAlert)}
                                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Shield className="h-4 w-4" /> Escalate to Security Board
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleDismiss(activeAlert.id)}
                                                className="h-12 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <ShieldX className="h-4 w-4" /> Dismiss Threat
                                            </button>
                                            <button
                                                onClick={() => {
                                                    toast.success("Treasury validation check triggered successfully.");
                                                }}
                                                className="h-12 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <UserCheck className="h-4 w-4" /> Verify Treasury
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <ShieldCheck className="h-16 w-16 text-indigo-500/20 mb-6" />
                                    <h2 className="text-xl font-black font-outfit uppercase tracking-tighter text-white italic">Zero Threats Inspected</h2>
                                    <p className="text-slate-500 text-xs italic mt-2 max-w-xs leading-relaxed">
                                        Select any active threat signature from the ledger log queue to run a deep-dive security inspection on the node.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Container>
        </div>
    );
}
