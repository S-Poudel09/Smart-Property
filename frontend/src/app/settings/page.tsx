'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api/auth';
import { 
    User, 
    Mail, 
    Shield, 
    Bell, 
    Lock, 
    Settings as SettingsIcon,
    ChevronRight,
    Loader2,
    Crown,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications'>('profile');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };
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

    const tabs = [
        { id: 'profile', name: 'Identity Archive', icon: User },
        { id: 'account', name: 'Security Vault', icon: Shield },
        { id: 'notifications', name: 'Crier Settings', icon: Bell },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#fffdf9] pt-32 pb-24">
                <div className="max-w-6xl mx-auto px-6 lg:px-12">
                    {/* Page Header */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <SettingsIcon className="h-6 w-6 text-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">System Preferences</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-serif text-primary mb-6">Imperial <span className="italic text-accent">Registry.</span></h1>
                        <p className="text-xl text-gray-400 font-medium italic border-l-4 border-accent/30 pl-8 max-w-2xl">
                            "Refine your sovereign presence and manage the digital seals of your legacy."
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar Tabs */}
                        <aside className="lg:w-80 shrink-0">
                            <nav className="flex flex-col gap-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center justify-between p-6 rounded-3xl transition-all border ${
                                            activeTab === tab.id 
                                            ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' 
                                            : 'bg-white text-gray-400 border-accent/10 hover:border-accent/30 hover:bg-accent/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-accent' : 'text-gray-300'}`} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{tab.name}</span>
                                        </div>
                                        {activeTab === tab.id && <ChevronRight className="h-4 w-4 text-accent" />}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-[3rem] p-10 lg:p-16 border border-accent/10 shadow-3xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                                
                                {activeTab === 'profile' && (
                                    <div className="space-y-12 relative z-10">
                                        <div className="flex items-center gap-6 pb-12 border-b border-accent/10">
                                            <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center text-accent text-3xl font-serif shadow-gold-glow">
                                                {user?.name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-serif text-primary mb-2">{user?.name}</h2>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-accent">Sovereign {user?.role}</p>
                                            </div>
                                        </div>

                                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Input 
                                                label="Full Lineage Name"
                                                defaultValue={user?.name}
                                                className="h-16 rounded-2xl bg-gray-50 border-none shadow-inner"
                                            />
                                            <Input 
                                                label="Archive Email"
                                                defaultValue={user?.email}
                                                disabled
                                                className="h-16 rounded-2xl bg-gray-50 border-none shadow-inner opacity-60"
                                            />
                                            <div className="md:col-span-2 pt-6">
                                                <Button className="h-16 px-12 rounded-full bg-primary text-accent text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-accent hover:text-primary transition-all duration-500">
                                                    Update Identity
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'account' && (
                                    <div className="space-y-12 relative z-10">
                                        <div className="p-8 bg-accent/5 rounded-3xl border border-accent/10 flex items-start gap-6">
                                            <Shield className="h-8 w-8 text-accent shrink-0 mt-1" />
                                            <div>
                                                <h3 className="text-xl font-serif text-primary mb-2">Security Posture</h3>
                                                <p className="text-sm text-gray-500 font-medium italic leading-relaxed">
                                                    "Your identity is shielded by Imperial Grade encryption. All ledger entries are immutable once confirmed."
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-accent/10">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <Lock className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-primary">Change Security Key</p>
                                                        <p className="text-[10px] text-gray-400 font-medium italic mt-1 uppercase tracking-widest">Last updated: 3 moon-cycles ago</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-accent text-[10px] font-black uppercase tracking-widest">Ammend</Button>
                                            </div>

                                            <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-accent/10">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                        <CheckCircle2 className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-primary">Identity Verification (KYC)</p>
                                                        <p className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-widest">Status: {user?.kyc_status || 'SEALED'}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-gray-400 text-[10px] font-black uppercase tracking-widest">View Credentials</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="text-center py-16 relative z-10">
                                        <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mx-auto mb-10 border border-dashed border-accent/30">
                                            <AlertCircle className="h-12 w-12 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl font-serif text-primary mb-6 italic">The Crier is Busy...</h3>
                                        <p className="max-w-md mx-auto text-gray-400 font-medium italic leading-relaxed mb-12">
                                            "Our royal messengers are refining the dispatch frequencies for your reports. Expect full control over the town criers in the upcoming era."
                                        </p>
                                        <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                                            <div className="p-4 bg-gray-50 rounded-2xl opacity-50 select-none">
                                                <div className="h-4 w-full bg-gray-200 rounded-full mb-3" />
                                                <div className="h-2 w-1/2 bg-gray-200 rounded-full" />
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl opacity-50 select-none">
                                                <div className="h-4 w-full bg-gray-200 rounded-full mb-3" />
                                                <div className="h-2 w-1/2 bg-gray-200 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            <div className="mt-12 text-center">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                                    Registry Version: 2.1.0-Royal-Archive
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
