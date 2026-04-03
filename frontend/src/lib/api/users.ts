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
