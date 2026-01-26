import Stripe from 'stripe';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper axios instance for Paystack
const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Create Stripe payment intent
export const createStripePayment = async (req, res) => {
  try {
    const { amount, currency = 'gbp' } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user?.id },
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Initialize Paystack payment
export const initializePaystackPayment = async (req, res) => {
  try {
    const { amount, email } = req.body;
    if (!amount || !email) {
      return res.status(400).json({ success: false, message: 'Amount and email required' });
    }

    // Paystack expects amount in smallest currency unit (e.g. kobo/pence)
    const payload = {
      amount: Math.round(amount * 100),
      email,
      metadata: { userId: req.user?.id },
    };

    const response = await paystackClient.post('/transaction/initialize', payload);

    res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    const msg = error.response?.data || error.message;
    res.status(500).json({ success: false, message: msg });
  }
};

// Verify Paystack payment
export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) return res.status(400).json({ success: false, message: 'Reference required' });

    const response = await paystackClient.get(`/transaction/verify/${encodeURIComponent(reference)}`);

    res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    const msg = error.response?.data || error.message;
    res.status(500).json({ success: false, message: msg });
  }
};