import express from 'express';
import { body } from 'express-validator';
import {
  getBids,
  getBid,
  createBid,
  updateBid,
  deleteBid,
  getUserBids,
  getAuctionBids,
  getBidHistory,
  getHighestBid,
  cancelBid,
  getBidStats,
  getBidLeaderboard,
  processProxyBids,
  validateBid,
  getBidNotifications
} from '../controllers/bidController.js';
import { protect, authorize, canBid, checkWalletBalance, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { validateBidCreation, validatePagination, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/auction/:auctionId',
  validateObjectId('auctionId'),
  validatePagination,
  getAuctionBids
);

router.get('/auction/:auctionId/leaderboard',
  validateObjectId('auctionId'),
  getBidLeaderboard
);

router.get('/auction/:auctionId/highest',
  validateObjectId('auctionId'),
  getHighestBid
);

router.get('/auction/:auctionId/history',
  validateObjectId('auctionId'),
  validatePagination,
  getBidHistory
);

router.get('/auction/:auctionId/stats',
  validateObjectId('auctionId'),
  getBidStats
);

// Protected routes
router.get('/',
  protect,
  validatePagination,
  getBids
);

router.get('/user/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  validatePagination,
  getUserBids
);

router.get('/:id',
  protect,
  validateObjectId(),
  getBid
);

router.post('/',
  protect,
  canBid,
  checkWalletBalance,
  validateBidCreation,
  createBid
);

router.put('/:id',
  protect,
  validateObjectId(),
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Bid amount must be at least $0.01'),
    body('maxBid')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Maximum bid amount must be at least $0.01')
  ],
  updateBid
);

router.delete('/:id',
  protect,
  validateObjectId(),
  deleteBid
);

router.post('/:id/cancel',
  protect,
  validateObjectId(),
  cancelBid
);

router.post('/validate',
  protect,
  [
    body('auction')
      .isMongoId()
      .withMessage('Valid auction ID is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Bid amount must be at least $0.01')
  ],
  validateBid
);

router.post('/process-proxy',
  protect,
  authorize('admin'),
  processProxyBids
);

router.get('/notifications/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  validatePagination,
  getBidNotifications
);

export default router;
