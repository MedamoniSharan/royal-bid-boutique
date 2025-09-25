import express from 'express';
import { body } from 'express-validator';
import {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction,
  getAuctionBids,
  getAuctionLeaderboard,
  getAuctionHistory,
  getFeaturedAuctions,
  getEndingSoonAuctions,
  getAuctionStats,
  watchAuction,
  unwatchAuction,
  getAuctionWatchers,
  extendAuctionTime,
  endAuction,
  promoteAuction,
  reportAuction,
  getAuctionReports,
  resolveAuctionReport
} from '../controllers/auctionController.js';
import { protect, authorize, canCreateAuction, optionalAuth } from '../middleware/auth.js';
import { validateAuctionCreation, validateAuctionUpdate, validatePagination, validateSearch, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/',
  optionalAuth,
  validatePagination,
  validateSearch,
  getAuctions
);

router.get('/featured',
  optionalAuth,
  getFeaturedAuctions
);

router.get('/ending-soon',
  optionalAuth,
  getEndingSoonAuctions
);

router.get('/:id',
  optionalAuth,
  validateObjectId(),
  getAuction
);

router.get('/:id/bids',
  optionalAuth,
  validateObjectId(),
  validatePagination,
  getAuctionBids
);

router.get('/:id/leaderboard',
  optionalAuth,
  validateObjectId(),
  getAuctionLeaderboard
);

router.get('/:id/history',
  optionalAuth,
  validateObjectId(),
  validatePagination,
  getAuctionHistory
);

router.get('/:id/stats',
  optionalAuth,
  validateObjectId(),
  getAuctionStats
);

router.get('/:id/watchers',
  protect,
  authorize('admin'),
  validateObjectId(),
  getAuctionWatchers
);

// Protected routes
router.post('/',
  protect,
  canCreateAuction,
  validateAuctionCreation,
  createAuction
);

router.put('/:id',
  protect,
  validateObjectId(),
  validateAuctionUpdate,
  updateAuction
);

router.delete('/:id',
  protect,
  validateObjectId(),
  deleteAuction
);

router.post('/:id/watch',
  protect,
  validateObjectId(),
  watchAuction
);

router.delete('/:id/watch',
  protect,
  validateObjectId(),
  unwatchAuction
);

router.post('/:id/extend',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('minutes')
      .isInt({ min: 1, max: 60 })
      .withMessage('Extension time must be between 1 and 60 minutes')
  ],
  extendAuctionTime
);

router.post('/:id/end',
  protect,
  authorize('admin'),
  validateObjectId(),
  endAuction
);

router.post('/:id/promote',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('duration')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Promotion duration must be between 1 and 30 days')
  ],
  promoteAuction
);

router.post('/:id/report',
  protect,
  validateObjectId(),
  [
    body('reason')
      .isIn(['fraud', 'inappropriate', 'misleading', 'spam', 'other'])
      .withMessage('Valid report reason is required'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ],
  reportAuction
);

router.get('/reports',
  protect,
  authorize('admin'),
  validatePagination,
  getAuctionReports
);

router.put('/reports/:reportId/resolve',
  protect,
  authorize('admin'),
  validateObjectId('reportId'),
  [
    body('action')
      .isIn(['dismiss', 'warn', 'suspend', 'ban'])
      .withMessage('Valid resolution action is required'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  resolveAuctionReport
);

export default router;
