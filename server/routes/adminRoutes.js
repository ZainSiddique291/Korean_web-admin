import express from 'express';
import { getAdminStats, getAdminCustomers } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);
router.get('/customers', protect, admin, getAdminCustomers);

export default router;
