import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate Short-lived Access Token
export const generateAccessToken = (userId, role = 'customer') => {
  return jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET || 'default_access_secret_key_123',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    }
  );
};

// Generate Long-lived Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_key_123',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d',
    }
  );
};

// Cookie options for secure storage
export const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
});

// Helper to send tokens and user response
export const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token in user document in database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Attach HTTP-only cookie for refresh token
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

  res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// Protect routes using Access Token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'default_access_secret_key_123'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or deleted' });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          isExpired: true,
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Access denied: No authorization token provided',
  });
};

// Admin only middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
};

// Optional auth - attaches req.user if token valid, continues otherwise
export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'default_access_secret_key_123'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};
