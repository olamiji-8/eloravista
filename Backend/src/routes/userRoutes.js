// src/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

// User routes (protected)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getAllUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .delete(protect, authorize('admin'), deleteUser);

router.put('/:id/role', protect, authorize('admin'), updateUserRole);

export default router;