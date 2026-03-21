import { User, UserRole } from '@/types/user';
import { saveAuthToStorage, clearAuthFromStorage, getAuthFromStorage } from './storage';

export const loginMock = async (email: string, role: UserRole): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
        id: Math.random().toString(36).substring(7),
        name: email.split('@')[0],
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
    };

    saveAuthToStorage({
        accessToken: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
        userRole: role,
        user: mockUser,
    });

    return mockUser;
};

export const registerMock = async (data: Record<string, unknown>): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Registered user (mock):', data);
};

export const logout = (): void => {
    clearAuthFromStorage();
    window.location.href = '/';
};

export const getCurrentUser = (): User | null => {
    return getAuthFromStorage().user;
};

export const isAuthenticated = (): boolean => {
    return !!getAuthFromStorage().accessToken;
};
