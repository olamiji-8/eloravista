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
import { protect, authorize } from '../middleware/auth.js';
import { orderValidation } from '../middleware/validation.js';

// Protected routes
router.post('/', protect, orderValidation, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/deliver', protect, authorize('admin'), updateOrderToDelivered);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;