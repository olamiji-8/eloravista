// src/routes/productRoutes.js
import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { productValidation } from '../middleware/validation.js';

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;