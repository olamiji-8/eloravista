// hooks/useCart.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '@/lib/api/cart';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.getCart();
      setCart(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
      console.error(err);
      // Set empty cart on error (user might not be logged in)
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.addToCart(productId, quantity);
      setCart(data.data);
      // Force refresh to ensure count updates
      await fetchCart();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.updateCartItem(productId, quantity);
      setCart(data.data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.removeFromCart(productId);
      setCart(data.data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await cartAPI.clearCart();
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate totals from cart items if API doesn't provide them
  const totalItems = cart?.totalItems || cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.totalPrice || cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};