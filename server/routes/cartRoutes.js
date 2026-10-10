import express from 'express';
import { getCart, syncCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart persistence endpoints require authenticated session

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/sync', syncCart);

export default router;
