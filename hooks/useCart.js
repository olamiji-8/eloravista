// hooks/useCart.js
'use client';

import { useState, useEffect } from 'react';
import { cartAPI } from '@/lib/api/cart';

export const useCart = () => {
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
      setCart(null);
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

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    totalItems: cart?.totalItems || 0,
    totalPrice: cart?.totalPrice || 0,
  };
};