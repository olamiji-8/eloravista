// src/routes/authRoutes.js
import express from 'express';
const router = express.Router();
import { register, verifyEmail, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

// Public routes
router.post('/register', registerValidation, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);

export default router;