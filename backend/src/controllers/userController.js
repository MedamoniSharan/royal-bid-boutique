import User from '../models/User.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';

// Get all users (admin only)
export const getUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  });
});

// Get user by ID
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: { user }
  });
});

// Update user
export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// Delete user
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get user auctions
export const getUserAuctions = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // This would require the Auction model
  res.json({
    success: true,
    message: 'User auctions endpoint - requires Auction model',
    data: { auctions: [], pagination: {} }
  });
});

// Get user bids
export const getUserBids = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // This would require the Bid model
  res.json({
    success: true,
    message: 'User bids endpoint - requires Bid model',
    data: { bids: [], pagination: {} }
  });
});

// Get user payments
export const getUserPayments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // This would require the Payment model
  res.json({
    success: true,
    message: 'User payments endpoint - requires Payment model',
    data: { payments: [], pagination: {} }
  });
});

// Get user stats
export const getUserStats = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: {
      stats: user.stats,
      wallet: user.wallet
    }
  });
});

// Get user reviews
export const getUserReviews = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'User reviews endpoint - requires Review model',
    data: { reviews: [] }
  });
});

// Add user review
export const addUserReview = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Add user review endpoint - requires Review model'
  });
});

// Update user preferences
export const updateUserPreferences = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { preferences: req.body },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: { user }
  });
});

// Get user notifications
export const getUserNotifications = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'User notifications endpoint - requires Notification model',
    data: { notifications: [] }
  });
});

// Mark notification as read
export const markNotificationAsRead = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Mark notification as read endpoint - requires Notification model'
  });
});

// Mark all notifications as read
export const markAllNotificationsAsRead = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Mark all notifications as read endpoint - requires Notification model'
  });
});

// Get user watchlist
export const getUserWatchlist = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'User watchlist endpoint - requires Watchlist model',
    data: { watchlist: [] }
  });
});

// Add to watchlist
export const addToWatchlist = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Add to watchlist endpoint - requires Watchlist model'
  });
});

// Remove from watchlist
export const removeFromWatchlist = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Remove from watchlist endpoint - requires Watchlist model'
  });
});

// Get user wallet
export const getUserWallet = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: { wallet: user.wallet }
  });
});

// Add wallet funds
export const addWalletFunds = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Add wallet funds endpoint - requires Payment integration'
  });
});

// Withdraw wallet funds
export const withdrawWalletFunds = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Withdraw wallet funds endpoint - requires Payment integration'
  });
});

// Get user transactions
export const getUserTransactions = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'User transactions endpoint - requires Transaction model',
    data: { transactions: [] }
  });
});
