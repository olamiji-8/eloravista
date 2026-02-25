// lib/api/auth.js
import api from '../api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ELORA_USER_KEY = 'elora_user';
const GUEST_CART_KEY = 'elora_guest_cart';

// Helper to clear ALL auth-related storage
const clearAllAuthStorage = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ELORA_USER_KEY);
    // Also clear guest cart so no cross-contamination between users
    localStorage.removeItem(GUEST_CART_KEY);
    sessionStorage.clear();
  } catch (e) {
    console.warn('Failed to clear auth storage:', e);
  }
};

export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data?.token) {
      clearAllAuthStorage(); // Clear any previous session first
      localStorage.setItem(TOKEN_KEY, response.data.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data?.token) {
      clearAllAuthStorage(); // Clear any previous session first
      localStorage.setItem(TOKEN_KEY, response.data.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout - clears EVERYTHING
  logout: () => {
    clearAllAuthStorage();
    window.location.href = '/';
  },

  // Get stored user - only from USER_KEY, not elora_user (to avoid cross-site contamination)
  getStoredUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (!user) return null;
      const parsed = JSON.parse(user);
      // Validate token expiry if present
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        clearAllAuthStorage();
        return null;
      }
      return parsed;
    } catch (e) {
      clearAllAuthStorage();
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};