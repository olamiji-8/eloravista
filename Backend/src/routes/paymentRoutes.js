import express from 'express';
const router = express.Router();
import {
  createStripePayment,
  initializePaystackPayment,
  verifyPaystackPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

// All payment routes are protected
router.use(protect);

// Stripe routes
router.post('/stripe/create-payment-intent', createStripePayment);

// Paystack routes
router.post('/paystack/initialize', initializePaystackPayment);
router.get('/paystack/verify/:reference', verifyPaystackPayment);

export default router;