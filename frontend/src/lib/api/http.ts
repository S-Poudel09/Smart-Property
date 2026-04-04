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

// Global Request Deduplication
// This catches duplicate GET requests (from StrictMode or multiple components mounting simultaneously)
// and shares the same Promise, guaranteeing only 1 network hit.
const originalGet = api.get;
const pendingGetRequests = new Map();

api.get = async function (...args) {
    const url = args[0];
    const config = args[1];
    
    const key = url + JSON.stringify(config?.params || {});
    
    if (pendingGetRequests.has(key)) {
        return pendingGetRequests.get(key);
    }
    
    // @ts-ignore
    const promise = originalGet.apply(api, args).finally(() => {
        // Clear from active cache after an adequate debounce buffer
        setTimeout(() => pendingGetRequests.delete(key), 500);
    });
    
    pendingGetRequests.set(key, promise);
    return promise;
};

export default api;
