import express from 'express';
const router = express.Router();
import {
  createStripePayment,
  handleStripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

// Webhook route - NO express.raw here since it's in server.js
router.post('/stripe/webhook', handleStripeWebhook);

// Protected payment routes
router.post('/stripe/create-payment-intent', protect, createStripePayment);

export default router;