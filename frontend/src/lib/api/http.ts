import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('smartproperty_token') : null;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('smartproperty_token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                localStorage.removeItem('smartproperty_user'); // Just in case
                
                if (!window.location.pathname.startsWith('/auth/')) {
                    window.location.href = '/auth/login?expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
