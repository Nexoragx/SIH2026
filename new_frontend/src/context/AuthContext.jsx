import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service.js';
import { storage } from '../utils/storage.js';
import { useAuth } from './useAuth.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    async function loadUser() {
      if (storage.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          if (profile) {
            setUser(profile);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    loadUser();

    // Listen to 401 unauthorized session expiry
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth };
