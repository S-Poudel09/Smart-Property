import axios from 'axios';

import { getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth/storage';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/?$/, '/'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Authorization Header
api.interceptors.request.use(
    (config) => {
        const { accessToken } = getAuthFromStorage();
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Token expired or invalid
            console.warn('Unauthorized access - potential token expiry. Clearing session.');
            clearAuthFromStorage();
            
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                window.location.href = '/auth/login?expired=true';
            }
        } else if (status === 403) {
            console.error('Forbidden access - user lacks sufficient permissions.');
        }

        return Promise.reject(error);
    }
);

export default api;
