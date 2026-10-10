import express from 'express';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

// Protected routes (require valid Access Token)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

export default router;
