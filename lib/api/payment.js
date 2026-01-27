// lib/api/payment.js
import api from '../api';

export const paymentAPI = {
  // Create Stripe payment intent
  createStripePayment: async (amount, currency = 'gbp') => {
    const response = await api.post('/payment/stripe/create-payment-intent', {
      amount,
      currency,
    });
    return response.data;
  },

  // Initialize Paystack payment
  initializePaystackPayment: async (amount, email) => {
    const response = await api.post('/payment/paystack/initialize', {
      amount,
      email,
    });
    return response.data;
  },

  // Verify Paystack payment
  verifyPaystackPayment: async (reference) => {
    const response = await api.get(`/payment/paystack/verify/${reference}`);
    return response.data;
  },
};