'use client';

import { useEffect, useState } from 'react';
import { getUsers, deleteUser, updateUserRole, createUser, CreateUserPayload } from '@/lib/api/users';
import { User } from '@/types/user';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import Container from '@/components/layout/Container';
import { toast } from 'react-hot-toast';
import { 
    Trash2, UserCheck, Search, ShieldCheck, Mail, 
    MoreVertical, UserPlus, X, Eye, EyeOff, 
    User as UserIcon, Lock, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Add User Modal ──────────────────────────────────────────────────────────

function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState<CreateUserPayload>({
        full_name: '',
        email: '',
        password: '',
        role: 'buyer',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof CreateUserPayload, string>>>({});

    const validate = () => {
        const e: Partial<Record<keyof CreateUserPayload, string>> = {};
        if (!form.full_name.trim()) e.full_name = 'Full name is required.';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'A valid email is required.';
        if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await createUser(form);
            toast.success(`User "${form.full_name}" created successfully!`);
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.email?.[0] 
                || err?.response?.data?.detail 
                || err?.response?.data?.error
                || 'Failed to create user. Please try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const set = (field: keyof CreateUserPayload, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const roleColors: Record<string, string> = {
        buyer: 'text-amber-600 bg-amber-50',
        seller: 'text-indigo-600 bg-indigo-50',
        admin: 'text-violet-700 bg-violet-50',
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Slide-in panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Create a platform account for a new user</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="e.g. Princess Poudel"
                                value={form.full_name}
                                onChange={e => set('full_name', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                                    ${errors.full_name 
                                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-white'
                                    }`}
                            />
                        </div>
                        {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                placeholder="user@example.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                                    ${errors.email 
                                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-white'
                                    }`}
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition-all
                                    ${errors.password 
                                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-white'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Role Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Account Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['buyer', 'seller', 'admin'] as const).map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => set('role', role)}
                                    className={`py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all ${
                                        form.role === role
                                            ? role === 'admin' 
                                                ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-md shadow-violet-100'
                                                : role === 'seller'
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                                                : 'border-amber-400 bg-amber-50 text-amber-700 shadow-md shadow-amber-100'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 italic">
                            {form.role === 'admin' && '⚠️ Admin accounts have full platform access.'}
                            {form.role === 'seller' && 'Sellers can list and manage property listings.'}
                            {form.role === 'buyer' && 'Buyers can browse and purchase properties.'}
                        </p>
                    </div>

                    {/* Info box */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-gray-600 font-medium">
                            <span className="font-bold text-primary">Note:</span> The user will be created as email-verified and can log in immediately with the credentials you set.
                        </p>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" /> Create User
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'seller' | 'buyer'>('all');

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

    useEffect(() => { loadUsers(); }, []);

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

    const filtered = users.filter(u => {
        const matchesSearch =
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleCounts = {
        total: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        seller: users.filter(u => u.role === 'seller').length,
        buyer: users.filter(u => u.role === 'buyer').length,
    };

    if (loading) return (
        <div className="p-12 flex justify-center bg-background min-h-screen items-center">
            <Loader size="lg" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            id="add-user-btn"
                            onClick={() => setShowAddModal(true)}
                            className="h-10 rounded-lg flex items-center gap-2 font-bold px-4 bg-primary hover:bg-primary/90 text-white text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                        >
                            <UserPlus className="h-4 w-4" /> Add User
                        </button>
                    </div>
                </div>

                {/* Stats Row — clickable role filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {([
                        { label: 'Total Users', value: roleCounts.total, key: 'all',    numColor: 'text-gray-800',   activeBg: 'bg-gray-800',    activeBorder: 'border-gray-800',   activeText: 'text-white',    inactiveBg: 'bg-white',      inactiveBorder: 'border-border' },
                        { label: 'Admins',      value: roleCounts.admin,  key: 'admin',  numColor: 'text-violet-700', activeBg: 'bg-violet-600',  activeBorder: 'border-violet-600', activeText: 'text-white',    inactiveBg: 'bg-violet-50',  inactiveBorder: 'border-violet-100' },
                        { label: 'Sellers',     value: roleCounts.seller, key: 'seller', numColor: 'text-indigo-700', activeBg: 'bg-indigo-600',  activeBorder: 'border-indigo-600', activeText: 'text-white',    inactiveBg: 'bg-indigo-50',  inactiveBorder: 'border-indigo-100' },
                        { label: 'Buyers',      value: roleCounts.buyer,  key: 'buyer',  numColor: 'text-amber-700',  activeBg: 'bg-amber-500',   activeBorder: 'border-amber-500',  activeText: 'text-white',    inactiveBg: 'bg-amber-50',   inactiveBorder: 'border-amber-100' },
                    ] as const).map(stat => {
                        const isActive = roleFilter === stat.key;
                        return (
                            <button
                                key={stat.key}
                                onClick={() => setRoleFilter(stat.key)}
                                className={`text-left p-4 rounded-xl border-2 transition-all active:scale-95 ${
                                    isActive
                                        ? `${stat.activeBg} ${stat.activeBorder} shadow-lg`
                                        : `${stat.inactiveBg} ${stat.inactiveBorder} hover:shadow-md hover:scale-[1.02]`
                                }`}
                            >
                                <div className={`text-2xl font-bold ${ isActive ? stat.activeText : stat.numColor }`}>
                                    {stat.value}
                                </div>
                                <div className={`text-xs font-semibold mt-0.5 ${ isActive ? 'text-white/80' : 'text-gray-500' }`}>
                                    {stat.label}
                                </div>
                                {isActive && (
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-1">
                                        ● Filtering active
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-16 border border-border shadow-sm text-center">
                        <EmptyState
                            title="No users found"
                            description="The user registry is currently empty or no results match your search."
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-border">
                                        <th className="p-4 font-semibold text-gray-700">User Details</th>
                                        <th className="p-4 font-semibold text-gray-700">Role</th>
                                        <th className="p-4 font-semibold text-gray-700">Status</th>
                                        <th className="p-4 font-semibold text-gray-700">User ID</th>
                                        <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <AnimatePresence>
                                        {filtered.map((user, i) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                                            {user.name?.[0]?.toUpperCase() || <UserCheck className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{user.name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <Mail className="h-3 w-3" /> {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        title="Click to change role"
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all hover:opacity-80 active:scale-95 ${
                                                            user.role === 'admin'   ? 'bg-violet-100 text-violet-700 border-violet-200' :
                                                            user.role === 'seller'  ? 'bg-indigo-50  text-indigo-700 border-indigo-100' :
                                                                                      'bg-amber-50   text-amber-700  border-amber-100'
                                                        }`}
                                                        onClick={() => handleRoleChange(user.id, user.role)}
                                                    >
                                                        {user.role}
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                        (user as any).is_verified
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-gray-50 text-gray-400 border-gray-100'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${(user as any).is_verified ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                        {(user as any).is_verified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-mono text-[11px] text-gray-400">
                                                        #{user.id.toString().slice(0, 10).toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        title="Delete user"
                                                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center ml-auto"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer audit bar */}
                <div className="mt-10 bg-primary/5 p-8 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-primary">Account Security Audit</h3>
                            <p className="text-xs text-gray-600 font-medium italic mt-0.5">All administrative actions are logged and associated with your admin ID.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/admin/logs">
                        <button className="h-11 px-8 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-all">
                            View Access Logs
                        </button>
                    </Link>
                </div>
            </Container>

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddUserModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={loadUsers}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
