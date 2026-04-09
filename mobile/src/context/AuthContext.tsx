import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Storage from '../utils/storage';
import api from '../api/client';

interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await Storage.getItemAsync('userToken');
      const storedUser = await Storage.getItemAsync('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token by getting fresh profile
        try {
          const response = await api.get('/auth/me/');
          setUser(response.data);
          await Storage.setItemAsync('userData', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to refresh profile:', error);
          if ((error as any).response?.status === 401) {
            await logout();
          }
        }
      }
    } catch (e) {
      console.error('Failed to load auth data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await Storage.setItemAsync('userToken', newToken);
    await Storage.setItemAsync('userData', JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await Storage.deleteItemAsync('userToken');
    await Storage.deleteItemAsync('userData');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    Storage.setItemAsync('userData', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
