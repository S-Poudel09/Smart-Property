'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getAllProfiles, updateKycStatus } from '@/lib/profile/storage';
import { UserProfile } from '@/types/profile';
import { Button } from '@/components/common/Button';
import { ShieldCheck, ShieldAlert, XCircle, Search, Eye, FileText, CheckCircle, Crown, UserCheck, Mail, History, ArrowRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminKycPage() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        setProfiles(getAllProfiles());
    }, []);

    const fetchProfiles = () => {
        setProfiles(getAllProfiles());
    };

    const handleAction = (userId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
        updateKycStatus(userId, status, reason);
        toast.success(`Subject ${status.toLowerCase()} by the Crown`);
        fetchProfiles();
        setSelectedProfile(null);
        setRejectionReason('');
    };

    const filtered = profiles.filter(p =>
        p.kycStatus === 'SUBMITTED' &&
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <ShieldCheck className="h-5 w-5 text-[#c5a059]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Identity Sanctum</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-serif text-[#1a1a2e]">Sovereignty Verification</h1>
                            <p className="text-gray-400 mt-2 font-medium italic">Vetting the lineage and credentials of platform citizens</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
                                <input
                                    type="text"
                                    placeholder="Search bloodlines..."
                                    className="pl-12 pr-6 py-4 bg-white/80 backdrop-blur-xl border border-[#c5a059]/10 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 shadow-lg min-w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-[#c5a059]/5 border border-[#c5a059]/10 overflow-hidden min-h-[500px]"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fffdf9] text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-black border-b border-[#c5a059]/10">
                                    <tr>
                                        <th className="px-8 py-8">Full Name</th>
                                        <th className="px-8 py-8">Citizen ID</th>
                                        <th className="px-8 py-8">Entry Date</th>
                                        <th className="px-8 py-8">Evidence</th>
                                        <th className="px-8 py-8 text-right">Judgment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c5a059]/5">
                                    {filtered.map((profile, i) => (
                                        <motion.tr 
                                            key={profile.userId} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-[#c5a059]/5 transition-all group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="text-lg font-serif text-[#1a1a2e]">{profile.fullName}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">{profile.userId.slice(0, 12)}...</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-bold text-gray-500 italic">
                                                    {new Date(profile.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[#c5a059] text-[10px] font-black uppercase tracking-widest">
                                                    <FileText className="h-4 w-4" /> {profile.kycDocs.length} Archives
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button
                                                    className="h-10 px-6 rounded-full bg-[#1a1a2e] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1a2e] border border-[#c5a059]/20 shadow-lg text-[10px] font-black uppercase tracking-widest"
                                                    onClick={() => setSelectedProfile(profile)}
                                                >
                                                    Grant Audience
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {filtered.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-32 text-center"
                                >
                                    <div className="h-24 w-24 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <h2 className="text-3xl font-serif text-[#1a1a2e] mb-2">The Registry is Clear</h2>
                                    <p className="text-gray-400 max-w-sm mx-auto font-medium italic">
                                        No pending sovereignty applications require your imperial judgment.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </Container>

                {/* Review Modal */}
                <AnimatePresence>
                    {selectedProfile && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setSelectedProfile(null)}
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                className="bg-white/95 backdrop-blur-2xl rounded-[4rem] p-12 max-w-3xl w-full shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border-t-8 border-t-[#c5a059]"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-3xl font-serif text-[#1a1a2e]">Civic Examination</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] mt-2">Authenticating Citizen Lineage</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedProfile(null)} 
                                        className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-inner"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                    <div className="p-6 bg-[#fffdf9] rounded-[2rem] border border-[#c5a059]/10">
                                        <label className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-2 block">Applicant Full Name</label>
                                        <p className="text-lg font-serif text-[#1a1a2e]">{selectedProfile.fullName}</p>
                                    </div>
                                    <div className="p-6 bg-[#fffdf9] rounded-[2rem] border border-[#c5a059]/10">
                                        <label className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-2 block">Registry Contact</label>
                                        <p className="text-lg font-serif text-[#1a1a2e]">{selectedProfile.phone || 'No direct wire'}</p>
                                    </div>
                                </div>

                                <div className="mb-12">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block">Documentary Evidence</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedProfile.kycDocs.map((doc, idx) => (
                                            <motion.div 
                                                key={idx} 
                                                whileHover={{ y: -5 }}
                                                className="p-5 rounded-[2rem] border border-[#c5a059]/10 bg-[#fffdf9] group cursor-pointer hover:bg-white transition-all shadow-sm"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-[#c5a059] shadow-inner group-hover:scale-110 transition-all">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-[#1a1a2e] truncate">{doc.name}</p>
                                                        <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-tighter mt-1">{doc.docType}</p>
                                                    </div>
                                                    <Eye className="h-4 w-4 text-[#c5a059] opacity-40 group-hover:opacity-100" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-[#c5a059]/10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 h-16 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 group text-white"
                                            onClick={() => handleAction(selectedProfile.userId, 'VERIFIED')}
                                        >
                                            <CheckCircle className="h-4 w-4" /> Bestow Verified Status
                                        </Button>
                                        <Button
                                            className="bg-white text-[#1a1a2e] border border-[#1a1a2e] hover:bg-gray-50 h-16 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg"
                                            onClick={() => setSelectedProfile(null)}
                                        >
                                            Defer Judgment
                                        </Button>

                                        <div className="col-span-2 mt-8 space-y-6">
                                            <div className="relative">
                                                <textarea
                                                    placeholder="Imperial decree for rejection..."
                                                    className="w-full rounded-[2.5rem] border-[#c5a059]/20 bg-[#fffdf9] text-sm focus:border-[#c5a059] transition-all p-8 min-h-[140px] outline-none font-medium italic"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                className="w-full bg-red-600 hover:bg-red-700 h-16 rounded-full font-black uppercase tracking-widest text-[10px] text-white disabled:opacity-30 flex items-center justify-center gap-2 shadow-xl"
                                                disabled={!rejectionReason.trim()}
                                                onClick={() => handleAction(selectedProfile.userId, 'REJECTED', rejectionReason)}
                                            >
                                                <XCircle className="h-4 w-4" /> Issue Rejection Decree
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
