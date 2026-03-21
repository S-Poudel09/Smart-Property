'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getAllProviders, updateProviderVerified } from '@/lib/services/storage';
import { ServiceProvider } from '@/types/service';
import { Button } from '@/components/common/Button';
import { ShieldCheck, ShieldAlert, Star, MapPin, Search, Crown, UserCheck, Mail, History, ArrowRight, X, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminServicesPage() {
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setProviders(getAllProviders());
    }, []);

    const fetchProviders = () => {
        setProviders(getAllProviders());
    };

    const toggleVerify = (id: string, current: boolean) => {
        updateProviderVerified(id, !current);
        toast.success(`Provider ${!current ? 'commissioned' : 'decommissioned'} by the Crown`);
        fetchProviders();
    };

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <Crown className="h-5 w-5 text-[#c5a059]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Guild Management</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-serif text-[#1a1a2e]">Guild Masters</h1>
                            <p className="text-gray-400 mt-2 font-medium italic">Vetting and commissioning elite service artisans for the realm</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
                                <input
                                    type="text"
                                    placeholder="Search guilds or masters..."
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
                                        <th className="px-8 py-8">Artisan Master</th>
                                        <th className="px-8 py-8">Guild Category</th>
                                        <th className="px-8 py-8 text-center">Imperial Acclaim</th>
                                        <th className="px-8 py-8 text-center">Commission State</th>
                                        <th className="px-8 py-8 text-right">Judgment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c5a059]/5">
                                    {filteredProviders.map((provider, i) => (
                                        <motion.tr 
                                            key={provider.id} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-[#c5a059]/5 transition-all group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-[#c5a059] shadow-lg group-hover:scale-110 transition-transform">
                                                        <Briefcase className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-serif text-[#1a1a2e]">{provider.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {provider.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-4 py-1.5 rounded-full bg-[#1a1a2e] text-[#c5a059] text-[10px] font-black uppercase tracking-widest border border-[#c5a059]/30 shadow-sm">
                                                    {provider.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-1 text-[#c5a059]">
                                                        <Star className="h-3.5 w-3.5 fill-current" />
                                                        <span className="text-sm font-bold text-[#1a1a2e]">{provider.rating}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1 group-hover:text-[#c5a059] transition-colors">
                                                        <MapPin className="h-3 w-3" /> {provider.city}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    {provider.verified ? (
                                                        <span className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                                            <ShieldCheck className="h-4 w-4" /> Imperial Partner
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                                                            <ShieldAlert className="h-4 w-4" /> Defered Audience
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button
                                                    className={`h-10 px-6 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${provider.verified
                                                            ? 'bg-white text-red-600 border border-red-100 hover:bg-red-50'
                                                            : 'bg-[#1a1a2e] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1a2e] border border-[#c5a059]/20'
                                                        }`}
                                                    onClick={() => toggleVerify(provider.id, provider.verified)}
                                                >
                                                    {provider.verified ? 'Revoke Commission' : 'Verify Artisan'}
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredProviders.length === 0 && (
                                <div className="py-32 text-center">
                                    <p className="text-lg font-serif text-gray-400 italic">No guild masters found in the imperial directory.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
