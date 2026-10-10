import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
  sendTokenResponse,
} from '../middleware/authMiddleware.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      address: address || '',
      city: city || 'Lahore',
    });

    await sendTokenResponse(user, 201, res, 'Account registered successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get access and refresh tokens
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Renew Access Token using Refresh Token
// @route   POST /api/auth/refresh
// @access  Public (Requires valid Refresh Token)
export const refreshToken = async (req, res) => {
  try {
    // Look for refresh token in cookies, body, or header
    const token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.headers['x-refresh-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_key_123'
      );
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // Verify token matches active user token in database
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.refreshToken && user.refreshToken !== token) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has been revoked or replaced. Please log in again.',
      });
    }

    // Generate new Access Token and rotate Refresh Token
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save rotated refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // Send updated cookie
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    res.json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log out user & clear refresh token
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.headers['x-refresh-token'];

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_key_123'
        );
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch {
        // Token was invalid or expired anyway, ignore decode error
      }
    }

    // Clear HTTP-only cookie
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (Protected by Access Token)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Protected by Access Token)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
