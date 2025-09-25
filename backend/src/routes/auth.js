import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken
} from '../controllers/authController.js';
import { protect, authRateLimit } from '../middleware/auth.js';
import { validateUserRegistration, validateUserLogin, validateUserUpdate, validatePasswordChange } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', 
  authRateLimit,
  validateUserRegistration,
  register
);

router.post('/login', 
  authRateLimit,
  validateUserLogin,
  login
);

router.post('/logout', logout);

router.post('/forgot-password',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  forgotPassword
);

router.post('/reset-password',
  authRateLimit,
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],
  resetPassword
);

router.get('/verify-email/:token', verifyEmail);

router.post('/resend-verification',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  resendVerification
);

router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);

router.put('/profile', 
  protect,
  validateUserUpdate,
  updateProfile
);

router.put('/change-password',
  protect,
  validatePasswordChange,
  changePassword
);

export default router;
