// hooks/useAuth.js
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '@/lib/api/auth';

const USER_KEY = 'user';
const TOKEN_KEY = 'token';
const SESSION_EXPIRY_KEY = 'elora_session_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionTimerRef = useRef(null);

  const clearSession = () => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      localStorage.removeItem('elora_user');
      localStorage.removeItem('elora_guest_cart');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
    setUser(null);
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
  };

  const setupSessionTimer = (expiryTime) => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    const timeLeft = expiryTime - Date.now();
    if (timeLeft <= 0) {
      clearSession();
      return;
    }
    sessionTimerRef.current = setTimeout(() => {
      clearSession();
      window.location.href = '/login?reason=session_expired';
    }, timeLeft);
  };

  useEffect(() => {
    let mounted = true;
    const init = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);

        if (!token || !storedUser) {
          clearSession();
          if (mounted) setLoading(false);
          return;
        }

        const expiry = expiryStr ? parseInt(expiryStr) : null;
        if (expiry && Date.now() > expiry) {
          clearSession();
          if (mounted) setLoading(false);
          return;
        }

        const parsed = JSON.parse(storedUser);
        if (mounted) {
          setUser(parsed);
          if (expiry) setupSessionTimer(expiry);
        }
      } catch (e) {
        console.warn('AuthProvider: failed to load stored user', e);
        clearSession();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUser = (u) => {
    try {
      const expiry = Date.now() + SESSION_DURATION;
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      localStorage.setItem(SESSION_EXPIRY_KEY, String(expiry));
      setupSessionTimer(expiry);
    } catch (e) {
      console.warn('AuthProvider: failed to persist user', e);
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
    clearSession();
    // Redirect to home page after logout (not login)
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
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