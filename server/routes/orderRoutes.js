import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(optionalAuth, createOrder)
  .get(protect, admin, getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(optionalAuth, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

export default router;
