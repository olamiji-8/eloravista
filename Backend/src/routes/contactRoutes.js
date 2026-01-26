// src/routes/contactRoutes.js
import express from 'express';
const router = express.Router();
import {
  submitContact,
  getContacts,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';
import { contactValidation } from '../middleware/validation.js';

// Public route
router.post('/', contactValidation, submitContact);

// Admin route
router.get('/', protect, authorize('admin'), getContacts);

export default router;