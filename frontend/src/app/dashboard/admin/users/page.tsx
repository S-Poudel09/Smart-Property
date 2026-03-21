'use client';

import { useEffect, useState } from 'react';
import { getUsers, deleteUser, updateUserRole } from '@/lib/api/users';
import { User } from '@/types/user';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import Container from '@/components/layout/Container';
import { toast } from 'react-hot-toast';
import { Users, Trash2, Shield, UserCheck, Search, Filter, Crown, MoreHorizontal, Mail, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch {
            toast.error("Failed to load citizens of the realm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Banish this soul from the imperial records permanently?")) return;
        
        try {
            await deleteUser(id);
            toast.success("User has been successfully banished");
            loadUsers();
        } catch {
            toast.error("Failed to perform the banishment");
        }
    };

    const handleRoleChange = async (id: string | number, currentRole: string) => {
        const newRole = window.prompt("Bestow new title (buyer, seller, admin):", currentRole);
        if (!newRole || newRole === currentRole) return;
        
        try {
            await updateUserRole(id, newRole.toLowerCase());
            toast.success(`Title updated to ${newRole.toUpperCase()}`);
            loadUsers();
        } catch {
            toast.error("Crown refuses to update this title");
        }
    };

    if (loading) return <div className="p-12 flex justify-center bg-[#fffdf9] min-h-screen"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-12">
            <Container>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Fingerprint className="h-5 w-5 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Imperial Registry</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-serif text-primary">Citizen Management</h1>
                        <p className="text-gray-400 mt-2 font-medium italic">Overseeing the subjects and dignitaries of the platform</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
                            <input 
                                type="text" 
                                placeholder="Search registry..." 
                                className="pl-12 pr-6 py-4 bg-white/80 backdrop-blur-xl border border-accent/10 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-lg min-w-[300px] text-primary"
                            />
                        </div>
                        <Button variant="outline" className="rounded-full h-14 w-14 border-accent/20 bg-white/80 backdrop-blur-xl flex items-center justify-center shadow-lg hover:bg-accent/10">
                            <Filter className="h-5 w-5 text-accent" />
                        </Button>
                    </div>
                </motion.div>
                
                {users.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-20 border border-accent/10 shadow-xl text-center">
                        <EmptyState title="Vacant Registry" description="No subjects have registered for the imperial services yet." />
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-accent/5 border border-accent/10 overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-accent/10 uppercase tracking-[0.2em] text-[10px] font-black text-accent">
                                    <th className="p-8">Identity</th>
                                    <th className="p-8 text-center">Sovereign Title</th>
                                    <th className="p-8">Registry ID</th>
                                    <th className="p-8 text-right">Sanction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent/5">
                                {users.map((user, i) => (
                                    <motion.tr 
                                        key={user.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-accent/5 transition-all group"
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-lg group-hover:scale-110 transition-transform">
                                                        <UserCheck className="h-6 w-6" />
                                                    </div>
                                                    {user.role === 'admin' && (
                                                        <div className="absolute -top-2 -right-2 bg-accent text-primary p-1 rounded-full border-2 border-white shadow-sm">
                                                            <Crown className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-serif text-primary">{user.name || 'Anonymous Subject'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex justify-center">
                                                <button 
                                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        user.role === 'admin' ? 'bg-primary border-accent text-accent shadow-gold-glow' :
                                                        user.role === 'seller' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                        'bg-amber-50 border-amber-100 text-amber-700'
                                                    } hover:scale-105 active:scale-95`}
                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                >
                                                    {user.role}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 font-mono text-xs opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all">
                                                <Shield className="h-3 w-3" />
                                                #{user.id.toString().slice(0, 8)}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    className="h-10 w-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 shadow-sm transition-all" 
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-accent/20 text-accent hover:bg-accent/10">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
                
                <div className="mt-12 bg-primary p-10 rounded-[3rem] border border-accent/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                                <Crown className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-white">Imperial Security Protocol</h3>
                                <p className="text-gray-400 text-sm font-medium italic mt-1">Registry changes are audited and logged in the sovereign database.</p>
                            </div>
                        </div>
                        <Button className="rounded-full px-12 h-14 bg-accent text-primary font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl">Audit Registry</Button>
                    </div>
                </div>
            </Container>
        </div>
    );
}
