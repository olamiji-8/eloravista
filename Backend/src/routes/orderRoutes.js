// src/routes/orderRoutes.js
import express from 'express';
const router = express.Router();
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { orderValidation } from '../middleware/validation.js';

// Create order - allow guests (optionalAuth attaches user if token present, but doesn't require it)
router.post('/', optionalAuth, createOrder);

// Protected routes (require login)
router.get('/myorders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

// Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/deliver', protect, authorize('admin'), updateOrderToDelivered);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;