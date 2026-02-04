// src/routes/contactRoutes.js
import express from 'express';
const router = express.Router();
import {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  replyToContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';

// Public route - anyone can submit contact form
router.post('/', submitContact);

// Admin routes - protected
router.get('/', protect, authorize('admin'), getContacts);
router.get('/:id', protect, authorize('admin'), getContactById);
router.put('/:id/status', protect, authorize('admin'), updateContactStatus);
router.post('/:id/reply', protect, authorize('admin'), replyToContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

export default router;