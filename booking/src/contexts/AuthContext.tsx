import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  tel?: string;
  address?: string;
  dob?: string;
  createAt: string;
  updateAt: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  active: boolean;
  emailVerified?: boolean;
  hostRequested?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.getMe();
      setUser(response.data.result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    fetchUserInfo();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, fetchUserInfo }}>
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
