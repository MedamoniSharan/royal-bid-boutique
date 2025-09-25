import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';
import { sendEmail } from '../utils/email.js';
import { generateVerificationToken, generatePasswordResetToken } from '../utils/helpers.js';

// Register user
export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Generate verification token
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    verificationToken,
    verificationTokenExpires
  });

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Send verification email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(email, 'emailVerification', {
      name: user.firstName,
      verificationUrl
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      token,
      refreshToken
    }
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists and get password
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(new AppError('Account is temporarily locked due to too many failed login attempts', 423));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    return next(new AppError('Invalid email or password', 401));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  await user.updateLastLogin();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      },
      token,
      refreshToken
    }
  });
});

// Logout user
export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Get current user
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.json({
    success: true,
    data: { user }
  });
});

// Update user profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, address } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, phone, address },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  const user = await User.findByEmail(email);
  if (!user) {
    return next(new AppError('No user found with this email address', 404));
  }
  
  // Generate reset token
  const resetToken = generatePasswordResetToken();
  const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = passwordResetExpires;
  await user.save();
  
  // Send reset email
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, 'passwordReset', {
      name: user.firstName,
      resetUrl
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new AppError('Failed to send password reset email', 500));
  }
  
  res.json({
    success: true,
    message: 'Password reset email sent successfully'
  });
});

// Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  
  // Find user by reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }
  
  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

// Verify email
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }
  
  // Update user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();
  
  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Resend verification email
export const resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  const user = await User.findByEmail(email);
  if (!user) {
    return next(new AppError('No user found with this email address', 404));
  }
  
  if (user.isVerified) {
    return next(new AppError('Email is already verified', 400));
  }
  
  // Generate new verification token
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();
  
  // Send verification email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(email, 'emailVerification', {
      name: user.firstName,
      verificationUrl
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return next(new AppError('Failed to send verification email', 500));
  }
  
  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
});

// Refresh token
export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return next(new AppError('Invalid refresh token', 401));
    }
    
    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();
    
    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});
