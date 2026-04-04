'use client';

import { useEffect, useState } from 'react';
import { getUsers, deleteUser, updateUserRole } from '@/lib/api/users';
import { User } from '@/types/user';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import Container from '@/components/layout/Container';
import { toast } from 'react-hot-toast';
import { Trash2, UserCheck, Search, ShieldCheck, Mail, MoreVertical, UserPlus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch {
            toast.error("Failed to load user registry");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Are you sure you want to remove this user? This action cannot be undone.")) return;
        
        try {
            await deleteUser(id);
            toast.success("User removed successfully");
            loadUsers();
        } catch {
            toast.error("Failed to remove user");
        }
    };

    const handleRoleChange = async (id: string | number, currentRole: string) => {
        const newRole = window.prompt("Change user role (buyer, seller, admin):", currentRole);
        if (!newRole || newRole === currentRole) return;
        
        try {
            await updateUserRole(id, newRole.toLowerCase());
            toast.success(`Role updated to ${newRole.toUpperCase()}`);
            loadUsers();
        } catch {
            toast.error("Failed to update user role");
        }
    };

    const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-12 flex justify-center bg-background min-h-screen items-center"><Loader size="lg" /></div>;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage platform participants and their access levels.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button className="h-10 rounded-lg flex items-center gap-2 font-bold px-4">
                            <UserPlus className="h-4 w-4" /> Add User
                        </Button>
                    </div>
                </div>
                
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                        <EmptyState title="No users found" description="The user registry is currently empty or no results match your search." />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-border">
                                        <th className="p-4 font-semibold text-gray-700">User Details</th>
                                        <th className="p-4 font-semibold text-gray-700">Role</th>
                                        <th className="p-4 font-semibold text-gray-700">User ID</th>
                                        <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                                                        {user.name?.[0] || <UserCheck className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{user.name || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail className="h-3 w-3" /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                                        user.role === 'admin' ? 'bg-primary text-white border-primary shadow-sm' :
                                                        user.role === 'seller' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    } hover:opacity-80 active:scale-95`}
                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                >
                                                    {user.role}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-[11px] text-gray-400">
                                                    ID: {user.id.toString().slice(0, 10).toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button 
                                                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center" 
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary transition-all flex items-center justify-center">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                <div className="mt-10 bg-primary/5 p-8 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-primary">Account Security Audit</h3>
                            <p className="text-xs text-gray-600 font-medium italic mt-0.5">All administrative actions are logged and associated with your admin ID.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-lg h-11 px-8 text-xs font-bold border-primary text-primary hover:bg-primary/5">View Access Logs</Button>
                </div>
            </Container>
        </div>
    );
}

