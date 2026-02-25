// src/routes/paymentRoutes.js
import express from 'express';
const router = express.Router();
import {
  createStripePayment,
  handleStripeWebhook,
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

// Webhook route - no auth needed (Stripe calls this directly)
router.post('/stripe/webhook', handleStripeWebhook);

// Payment intent - optionalAuth so both guests and logged-in users can pay
router.post('/stripe/create-payment-intent', optionalAuth, createStripePayment);

export default router;