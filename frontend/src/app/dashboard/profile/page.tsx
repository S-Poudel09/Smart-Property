'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api/auth';
import KYCUpload from '@/components/auth/KYCUpload';
import Container from '@/components/layout/Container';
import { User, Mail, Shield, UserCheck, Settings, Lock, Crown, Gem, BadgeCheck, Sparkles, Fingerprint } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const data = await getMe();
            setUser(data);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen bg-[#fffdf9] items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full shadow-gold-glow"
                />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-20 text-center bg-[#fffdf9] min-h-screen">
                <p className="font-serif text-2xl text-red-500 italic">"The Imperial Records fail to recognize your identity."</p>
            </div>
        );
    }

    return (
        <div className="bg-[#fffdf9] min-h-screen pb-32">
            {/* Elegant Header */}
            <div className="bg-primary text-white py-24 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <Container className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Crown className="h-6 w-6 text-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Imperial Dossier</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-serif mb-6 leading-[0.9]">Personal Sanctuary</h1>
                        <p className="text-xl text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8">
                            Managing the sovereign identity and credentials of <span className="text-white not-italic">{user.name}</span>.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-start">
                    {/* Left Column: Identity Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-8 sticky top-24"
                    >
                        <div className="bg-white rounded-[3rem] p-10 border border-accent/10 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-accent/10 transition-all duration-700" />
                            
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-primary p-1 border border-accent/30 shadow-gold-glow mb-8 overflow-hidden group/avatar">
                                    <div className="h-full w-full rounded-[2.2rem] bg-primary flex items-center justify-center text-accent group-hover/avatar:scale-110 transition-transform duration-500">
                                        <User className="h-16 w-16" />
                                    </div>
                                </div>
                                
                                <h2 className="text-3xl font-serif text-primary mb-2">{user.name}</h2>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-widest text-accent rounded-full mb-8">
                                    <Gem className="h-3.5 w-3.5" /> Imperial {user.role}
                                </div>
                                
                                <div className="w-full space-y-6 text-left border-t border-[#c5a059]/10 pt-8 mt-4">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-[#1a1a2e] group-hover/item:text-[#c5a059] transition-all">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Communication Archive</p>
                                            <p className="text-sm font-bold text-[#1a1a2e]">{user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-[#1a1a2e] group-hover/item:text-[#c5a059] transition-all">
                                            <BadgeCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Registry Status</p>
                                            <p className="text-sm font-bold text-[#1a1a2e] flex items-center gap-2">
                                                {user.is_verified ? 'Identity Sealed' : 'Identity Unverified'}
                                                {user.is_verified && <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Vault */}
                        <div className="bg-primary rounded-[3rem] p-10 border border-accent/20 shadow-xl text-white relative overflow-hidden group">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-xl font-serif text-accent mb-8 flex items-center gap-3">
                                <Lock className="h-5 w-5" />
                                Security Vault
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group/toggle">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover/toggle:text-white transition-colors">
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-widest opacity-80">Dual-Shield</p>
                                            <p className="text-[10px] text-gray-500 font-medium italic">Two-Factor Authentication</p>
                                        </div>
                                    </div>
                                    <button 
                                        className={`h-7 w-12 rounded-full transition-all relative border-2 ${user.is_2fa_enabled ? 'bg-accent border-accent' : 'bg-transparent border-white/20'}`}
                                        disabled
                                    >
                                        <span className={`absolute top-1 left-1 h-3.5 w-3.5 rounded-full bg-white transition-transform ${user.is_2fa_enabled ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em] animate-pulse">Encryption Phase: Imprint-Active</p>
                                    <p className="text-[9px] text-gray-500 mt-2 font-medium italic">Vault configuration is restricted by the crown.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Credential Verification */}
                    <div className="lg:col-span-2 space-y-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[3.5rem] border border-accent/10 shadow-3xl overflow-hidden shadow-gold-glow/5"
                        >
                            <KYCUpload 
                                currentStatus={user.kyc_status} 
                                onSuccess={fetchUser} 
                            />
                        </motion.div>
                        
                        {/* Status Ledger */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-12 border border-dashed border-accent/20 text-center"
                        >
                            <div className="mx-auto h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-8 border border-white">
                                <Settings className="h-10 w-10 animate-[spin_10s_linear_infinite]" />
                            </div>
                             <h4 className="text-2xl font-serif text-primary mb-4">Imperial Ledger Update</h4>
                            <p className="max-w-md mx-auto text-gray-400 font-medium italic leading-relaxed">
                                "The artisans are currently refining the detailed statistics and property overview for your {user.role} profile. Further insights will manifest in the next era."
                            </p>
                            <div className="mt-10 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '65%' }}
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mt-4">Module Preparation: 65% Complete</p>
                        </motion.div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

