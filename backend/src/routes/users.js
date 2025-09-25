import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserAuctions,
  getUserBids,
  getUserPayments,
  getUserStats,
  getUserReviews,
  addUserReview,
  updateUserPreferences,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserWallet,
  addWalletFunds,
  withdrawWalletFunds,
  getUserTransactions
} from '../controllers/userController.js';
import { protect, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { validateUserUpdate, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Admin routes
router.get('/', 
  protect, 
  authorize('admin'), 
  validatePagination,
  getUsers
);

router.get('/stats/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  getUserStats
);

// User profile routes
router.get('/profile/:userId',
  protect,
  getUser
);

router.put('/profile/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateUserUpdate,
  updateUser
);

router.delete('/profile/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  deleteUser
);

// User activity routes
router.get('/:userId/auctions',
  protect,
  validatePagination,
  getUserAuctions
);

router.get('/:userId/bids',
  protect,
  validatePagination,
  getUserBids
);

router.get('/:userId/payments',
  protect,
  authorizeOwnerOrAdmin(),
  validatePagination,
  getUserPayments
);

router.get('/:userId/transactions',
  protect,
  authorizeOwnerOrAdmin(),
  validatePagination,
  getUserTransactions
);

// User reviews routes
router.get('/:userId/reviews',
  protect,
  getUserReviews
);

router.post('/:userId/reviews',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters')
  ],
  addUserReview
);

// User preferences routes
router.put('/:userId/preferences',
  protect,
  authorizeOwnerOrAdmin(),
  [
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be a boolean'),
    body('smsNotifications')
      .optional()
      .isBoolean()
      .withMessage('SMS notifications must be a boolean'),
    body('bidAlerts')
      .optional()
      .isBoolean()
      .withMessage('Bid alerts must be a boolean'),
    body('auctionEndAlerts')
      .optional()
      .isBoolean()
      .withMessage('Auction end alerts must be a boolean')
  ],
  updateUserPreferences
);

// User notifications routes
router.get('/:userId/notifications',
  protect,
  authorizeOwnerOrAdmin(),
  validatePagination,
  getUserNotifications
);

router.put('/:userId/notifications/:notificationId/read',
  protect,
  authorizeOwnerOrAdmin(),
  markNotificationAsRead
);

router.put('/:userId/notifications/read-all',
  protect,
  authorizeOwnerOrAdmin(),
  markAllNotificationsAsRead
);

// User watchlist routes
router.get('/:userId/watchlist',
  protect,
  authorizeOwnerOrAdmin(),
  validatePagination,
  getUserWatchlist
);

router.post('/:userId/watchlist/:auctionId',
  protect,
  authorizeOwnerOrAdmin(),
  addToWatchlist
);

router.delete('/:userId/watchlist/:auctionId',
  protect,
  authorizeOwnerOrAdmin(),
  removeFromWatchlist
);

// User wallet routes
router.get('/:userId/wallet',
  protect,
  authorizeOwnerOrAdmin(),
  getUserWallet
);

router.post('/:userId/wallet/add-funds',
  protect,
  authorizeOwnerOrAdmin(),
  [
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be at least $1'),
    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
      .withMessage('Valid payment method is required')
  ],
  addWalletFunds
);

router.post('/:userId/wallet/withdraw',
  protect,
  authorizeOwnerOrAdmin(),
  [
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be at least $1'),
    body('bankAccount')
      .notEmpty()
      .withMessage('Bank account details are required')
  ],
  withdrawWalletFunds
);

export default router;
