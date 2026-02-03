import express from 'express';
const router = express.Router();
import {
  createStripePayment,
  handleStripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

// Webhook route (MUST be before express.json() middleware in server.js)
// This route needs raw body for signature verification
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Protected payment routes
router.post('/stripe/create-payment-intent', protect, createStripePayment);

export default router;