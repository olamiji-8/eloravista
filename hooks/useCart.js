// hooks/useCart.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '@/lib/api/cart';
import { useAuth } from '@/hooks/useAuth';

const GUEST_CART_KEY = 'elora_guest_cart';
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load guest cart from localStorage
  const loadGuestCart = () => {
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        const parsed = JSON.parse(guestCart);
        setCart(parsed);
      }
    } catch (err) {
      console.error('Failed to load guest cart:', err);
    }
  };

  // Save guest cart to localStorage
  const saveGuestCart = (cartData) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    } catch (err) {
      console.error('Failed to save guest cart:', err);
    }
  };

  // Sync guest cart with server when user logs in
  const syncGuestCartWithServer = async () => {
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        const { items } = JSON.parse(guestCart);
        if (items && items.length > 0) {
          setLoading(true);
          for (const item of items) {
            try {
              await cartAPI.addToCart(item.product._id, item.quantity);
            } catch (err) {
              console.error('Failed to sync item:', item, err);
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
          await fetchServerCart();
        }
      }
    } catch (err) {
      console.error('Failed to sync guest cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart from server (authenticated users)
  const fetchServerCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.getCart();
      setCart(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Add to cart (guest or authenticated)
  const addToCart = async (productId, quantity = 1, productDetails = null) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const data = await cartAPI.addToCart(productId, quantity);
        setCart(data.data);
        await fetchServerCart();
        return data;
      } else {
        // Guest: use localStorage
        if (!productDetails) {
          throw new Error('Product details required for guest cart');
        }
        
        const currentCart = { ...cart };
        const existingItemIndex = currentCart.items.findIndex(
          item => item.product._id === productId
        );

        if (existingItemIndex > -1) {
          currentCart.items[existingItemIndex].quantity += quantity;
        } else {
          currentCart.items.push({
            product: productDetails,
            quantity,
            price: productDetails.price
          });
        }

        currentCart.totalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
        currentCart.totalPrice = currentCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        setCart(currentCart);
        saveGuestCart(currentCart);
        return { success: true, data: currentCart };
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const data = await cartAPI.updateCartItem(productId, quantity);
        setCart(data.data);
        return data;
      } else {
        const currentCart = { ...cart };
        const itemIndex = currentCart.items.findIndex(
          item => item.product._id === productId
        );

        if (itemIndex > -1) {
          currentCart.items[itemIndex].quantity = quantity;
          currentCart.totalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
          currentCart.totalPrice = currentCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          setCart(currentCart);
          saveGuestCart(currentCart);
        }
        return { success: true, data: currentCart };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const data = await cartAPI.removeFromCart(productId);
        setCart(data.data);
        return data;
      } else {
        const currentCart = { ...cart };
        currentCart.items = currentCart.items.filter(
          item => item.product._id !== productId
        );
        currentCart.totalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
        currentCart.totalPrice = currentCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCart(currentCart);
        saveGuestCart(currentCart);
        return { success: true, data: currentCart };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        await cartAPI.clearCart();
      } else {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      loadGuestCart();
    }
  }, [isAuthenticated]);

  // Sync guest cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      syncGuestCartWithServer();
    }
  }, [isAuthenticated, user]);

  // Calculate totals
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
    refreshCart: isAuthenticated ? fetchServerCart : loadGuestCart,
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