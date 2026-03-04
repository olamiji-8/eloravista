// src/routes/productRoutes.js
import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  unfeatureProduct,
  unfeatureAllProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

// Public routes
router.get('/', getProducts);

// IMPORTANT: unfeature-all must come before /:id to avoid route collision
router.patch('/unfeature-all', protect, authorize('admin'), unfeatureAllProducts);

router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/unfeature', protect, authorize('admin'), unfeatureProduct);

export default router;