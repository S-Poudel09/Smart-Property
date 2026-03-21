export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}
