import axios from 'axios';
import * as Storage from '../utils/storage';
import Constants from 'expo-constants';

// For physical devices, we should use the local IP instead of 127.0.0.1
// You can change this to your actual local IP (e.g. 192.168.x.x) for testing
const BASE_URL = 'http://10.0.2.2:8000/api/';

export const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http')) return path;
  // Ensure the path starts with /
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `http://10.0.2.2:8000${formattedPath}`;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token expiration/401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and handle logout logic if necessary
      await Storage.deleteItemAsync('userToken');
      // Potential redirect to login if implemented via navigation ref
    }
    return Promise.reject(error);
  }
);

export default api;
