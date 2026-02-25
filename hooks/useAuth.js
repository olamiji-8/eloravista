// hooks/useAuth.js
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '@/lib/api/auth';

// Use a site-specific key so other sites' data never bleeds in
const USER_KEY = 'user'; // matches auth.js
const TOKEN_KEY = 'token';
const SESSION_EXPIRY_KEY = 'elora_session_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionTimerRef = useRef(null);

  // Clear everything and reset state
  const clearSession = () => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      localStorage.removeItem('elora_user'); // legacy key
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

  // Set up auto-logout timer
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

  // On mount: load stored user and validate session
  useEffect(() => {
    let mounted = true;
    const init = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);

        if (!token || !storedUser) {
          // No session - clear any stale data
          clearSession();
          if (mounted) setLoading(false);
          return;
        }

        // Check session expiry
        const expiry = expiryStr ? parseInt(expiryStr) : null;
        if (expiry && Date.now() > expiry) {
          clearSession();
          if (mounted) setLoading(false);
          return;
        }

        const parsed = JSON.parse(storedUser);
        if (mounted) {
          setUser(parsed);
          // Set up timer for remaining session time
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
    // Redirect to login page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
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