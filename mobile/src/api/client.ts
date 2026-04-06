import axios from 'axios';
import * as Storage from '../utils/storage';
import Constants from 'expo-constants';

// For physical devices, we should use the local IP instead of 127.0.0.1
// You can change this to your actual local IP (e.g. 192.168.x.x) for testing
const BASE_URL = 'http://127.0.0.1:8000/api';

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
