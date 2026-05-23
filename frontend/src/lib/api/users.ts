import api from './http';
import { User } from '@/types/user';

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('auth/admin/users/');
    return response.data;
};

export const deleteUser = async (id: number | string): Promise<void> => {
    await api.delete(`auth/admin/users/${id}/`);
};

export const updateUserRole = async (id: number | string, role: string): Promise<User> => {
    const response = await api.patch(`auth/admin/users/${id}/`, { role });
    return response.data;
};

export interface CreateUserPayload {
    full_name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller' | 'admin';
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
    // Use admin viewset which allows all roles including admin
    const response = await api.post('auth/admin/users/', {
        username: payload.email,
        email: payload.email,
        full_name: payload.full_name,
        password: payload.password,
        role: payload.role,
        is_verified: true,
    });
    return response.data;
};
