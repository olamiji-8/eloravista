// hooks/useAuth.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api/auth';

const STORAGE_KEY = 'elora_user';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load stored user once on mount
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const stored = authAPI?.getStoredUser?.() ?? JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (mounted && stored) {
          setUser(stored);
        }
      } catch (e) {
        console.warn('AuthProvider: failed to load stored user', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const persistUser = (u) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch (e) {
      console.warn('AuthProvider: failed to persist user', e);
    }
  };

  const clearStoredUser = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('AuthProvider: failed to clear stored user', e);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.login(credentials);
      const u = result?.data ?? result;
      setUser(u);
      persistUser(u);
      return result;
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.register(userData);
      const u = result?.data ?? result;
      setUser(u);
      persistUser(u);
      return result;
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authAPI?.logout?.();
    } catch (e) {
      console.warn('AuthProvider: authAPI.logout error', e);
    }
    setUser(null);
    clearStoredUser();
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};