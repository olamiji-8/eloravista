import express from 'express';
const router = express.Router();
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

// All wishlist routes are protected
router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.delete('/:productId', removeFromWishlist);

export default router;