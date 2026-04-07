'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, DecodedUser, logout as authLogout } from '@/lib/auth/getUser';
import { getAuthFromStorage, AuthState, saveAuthToStorage, clearAuthFromStorage } from '@/lib/auth/storage';

interface AuthContextType {
    user: DecodedUser | null;
    isAuth: boolean;
    isLoading: boolean;
    login: (token: string, user?: any) => void;
    logout: () => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<DecodedUser | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const loadUser = () => {
        const currentUser = getUser();
        const stored = getAuthFromStorage();
        
        if (currentUser && stored.accessToken) {
            setUser(currentUser);
            setIsAuth(true);
        } else {
            setUser(null);
            setIsAuth(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadUser();
        
        // Listen for storage changes (e.g. from other tabs)
        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, []);

    const login = (token: string, userData?: any) => {
        localStorage.setItem('smartproperty_token', token);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('userRole', userData.role);
        }
        loadUser();
    };

    const logout = () => {
        clearAuthFromStorage();
        setUser(null);
        setIsAuth(false);
        router.push('/');
    };

    const refreshUser = () => {
        loadUser();
    };

    return (
        <AuthContext.Provider value={{ user, isAuth, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
