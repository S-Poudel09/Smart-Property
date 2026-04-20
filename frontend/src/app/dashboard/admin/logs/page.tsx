'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/http';
import { Loader } from '@/components/common/Loader';
import { 
    ScrollText, User, Activity, Clock, ShieldCheck, 
    XCircle, CheckCircle, Search, RefreshCw, 
    ChevronLeft, ChevronRight, Crown, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import { format } from 'date-fns';

interface ActivityLog {
    id: string;
    user: string;
    action: string;
    status: 'success' | 'failure' | 'pending';
    details: any;
    timestamp: string;
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const res = await api.get('admin/activity_logs/');
            setLogs(res.data);
        } catch (e) {
            console.error('Failed to fetch logs', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Dynamic Update: Poll every 10 seconds
        const interval = setInterval(() => {
            fetchLogs(true);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => 
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-12 flex justify-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-16 pb-32">
            <Container>
                {/* Hero Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5 }}
                                className="h-10 w-10 bg-[#1a1a2e] flex items-center justify-center rounded-xl shadow-lg border border-[#c5a059]/30"
                            >
                                <Crown className="h-5 w-5 text-[#c5a059]" />
                            </motion.div>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#c5a059]">Imperial Oversight</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-serif text-[#1a1a2e] mb-4">Sovereign Ledger</h1>
                        <p className="text-gray-400 font-medium italic border-l-4 border-[#c5a059]/30 pl-8 max-w-xl">
                            The eternal chronicle of all activities within the sovereign realm. Every decree, every acquisition, and every rite is recorded here.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#c5a059] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search the annals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 pr-8 py-4 bg-white border border-[#c5a059]/10 rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 transition-all font-medium italic shadow-xl shadow-[#c5a059]/5"
                            />
                        </div>
                        <Button 
                            onClick={() => fetchLogs()}
                            className={`h-14 w-14 rounded-full bg-[#1a1a2e] border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center p-0 transition-all active:scale-95 ${refreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                    </div>
                </motion.div>

                {/* Logs Table */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-[#c5a059]/10 shadow-2xl shadow-[#c5a059]/5 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#c5a059]/5 bg-[#1a1a2e]/5">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a2e]/60">Sovereign</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a2e]/60">Decree</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a2e]/60">Sanctity</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a2e]/60">Time Rite</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a2e]/60 text-right">Identifier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c5a059]/5">
                                <AnimatePresence mode="popLayout">
                                    {filteredLogs.map((log, i) => (
                                        <motion.tr 
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group hover:bg-[#c5a059]/5 transition-colors cursor-default"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-[#1a1a2e] text-[#c5a059] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-serif text-[#1a1a2e] group-hover:text-[#c5a059] transition-colors">{log.user}</p>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Imperial Citizen</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-[#1a1a2e] uppercase tracking-wider">{log.action.replace('_', ' ')}</span>
                                                    <span className="text-[10px] text-gray-400 italic font-medium">{JSON.stringify(log.details).substring(0, 50)}...</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                                                    log.status === 'success' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    log.status === 'failure' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                    {log.status === 'success' ? <CheckCircle className="h-3 w-3" /> : 
                                                     log.status === 'failure' ? <XCircle className="h-3 w-3" /> : 
                                                     <AlertCircle className="h-3 w-3" />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{log.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    <Clock className="h-3.5 w-3.5 text-[#c5a059]/50" />
                                                    <span className="text-[11px] font-bold italic">{format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <code className="text-[9px] font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-400 group-hover:text-[#c5a059] group-hover:bg-white transition-all">
                                                    {log.id.substring(log.id.length - 8)}
                                                </code>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center">
                                                <ScrollText className="h-16 w-16 text-[#c5a059]/20 mb-6" />
                                                <h3 className="text-2xl font-serif text-[#1a1a2e]">The Annals are Empty</h3>
                                                <p className="text-sm text-gray-400 font-medium italic mt-2">No activity has been recorded matching your quest.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Footer Stats */}
                <div className="mt-12 flex justify-center items-center gap-12">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-[#c5a059]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Real-time Sentinel Active</span>
                    </div>
                    <div className="h-4 w-px bg-[#c5a059]/20" />
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Integrity Verified</span>
                    </div>
                </div>
            </Container>
        </div>
    );
}
