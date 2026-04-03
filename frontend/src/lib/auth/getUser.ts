import { clearAuthFromStorage } from './storage';

export interface DecodedUser {
    user_id: string;
    id: string;
    email: string;
    role?: string;
    name?: string;
}

export const getUser = (): DecodedUser | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('smartproperty_token');
    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;

        // JWT is Base64URL
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        
        const userId = payload.user_id || payload.sub;
        return {
            user_id: userId,
            id: userId,
            email: payload.email,
            role: payload.role,
            name: payload.name || payload.full_name || (payload.email ? payload.email.split('@')[0] : 'User'),
        };
    } catch {
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    return !!getUser();
};

export const logout = (): void => {
    if (typeof window !== 'undefined') {
        clearAuthFromStorage();
        window.location.href = '/auth/login';
    }
};
