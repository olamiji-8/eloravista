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
};