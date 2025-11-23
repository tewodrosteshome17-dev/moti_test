import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentSession, setCurrentSession } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getCurrentSession();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setCurrentSession(userData);
  };

  const logout = () => {
    setUser(null);
    setCurrentSession(null);
  };

  const refreshUser = () => {
      const storedUser = getCurrentSession();
      if(storedUser) setUser(storedUser);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};