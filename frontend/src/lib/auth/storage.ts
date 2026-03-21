import { User } from '@/types/user';

const TOKEN_KEY = 'smartproperty_token';
const USER_KEY = 'user';

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    userRole: string | null;
}

export const getAuthFromStorage = (): AuthState => {
    if (typeof window === 'undefined') return { accessToken: null, user: null, userRole: null };

    const accessToken = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    let user = null;

    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error('Failed to parse user from storage', e);
        }
    }

    const userRole = localStorage.getItem('userRole');

    return { accessToken, user, userRole };
};

export const saveAuthToStorage = (auth: AuthState): void => {
    if (typeof window === 'undefined') return;
    if (auth.accessToken) localStorage.setItem(TOKEN_KEY, auth.accessToken);
    if (auth.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
        localStorage.setItem('userRole', auth.user.role);
    }
    if (auth.userRole && !auth.user) {
        localStorage.setItem('userRole', auth.userRole);
    }
};

export const clearAuthFromStorage = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('userRole');
};
