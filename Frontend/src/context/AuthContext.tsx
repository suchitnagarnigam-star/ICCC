import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phoneNumber: string, pin: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mcl_iccc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error('Failed to validate session token', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (phoneNumber: string, pin: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, pin }),
    });
    if (res.success && res.token) {
      localStorage.setItem('mcl_iccc_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('mcl_iccc_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

