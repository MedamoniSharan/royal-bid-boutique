import express from 'express';
import { body, query } from 'express-validator';
import {
  getPayments,
  getPayment,
  createPayment,
  processPayment,
  refundPayment,
  getUserPayments,
  getAuctionPayments,
  getPaymentStats,
  getPaymentMethods,
  validatePayment,
  getPaymentHistory,
  cancelPayment,
  retryPayment,
  getPaymentFees,
  updatePaymentStatus,
  getRefundHistory,
  processRefund
} from '../controllers/paymentController.js';
import { protect, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { validatePaymentCreation, validatePagination, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Public routes (limited)
router.get('/methods',
  getPaymentMethods
);

router.get('/fees',
  [
    query('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be at least $0.01'),
    query('method')
      .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'wallet'])
      .withMessage('Valid payment method is required')
  ],
  getPaymentFees
);

// Protected routes
router.get('/',
  protect,
  authorize('admin'),
  validatePagination,
  getPayments
);

router.get('/user/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  validatePagination,
  getUserPayments
);

router.get('/auction/:auctionId',
  protect,
  authorize('admin'),
  validateObjectId('auctionId'),
  getAuctionPayments
);

router.get('/stats',
  protect,
  authorize('admin'),
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Valid start date is required'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Valid end date is required')
  ],
  getPaymentStats
);

router.get('/history',
  protect,
  validatePagination,
  getPaymentHistory
);

router.get('/refunds',
  protect,
  authorize('admin'),
  validatePagination,
  getRefundHistory
);

router.get('/:id',
  protect,
  validateObjectId(),
  getPayment
);

router.post('/',
  protect,
  validatePaymentCreation,
  createPayment
);

router.post('/validate',
  protect,
  [
    body('auction')
      .isMongoId()
      .withMessage('Valid auction ID is required'),
    body('bid')
      .isMongoId()
      .withMessage('Valid bid ID is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Payment amount must be at least $0.01'),
    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'wallet'])
      .withMessage('Valid payment method is required')
  ],
  validatePayment
);

router.post('/:id/process',
  protect,
  validateObjectId(),
  [
    body('paymentData')
      .notEmpty()
      .withMessage('Payment data is required')
  ],
  processPayment
);

router.post('/:id/retry',
  protect,
  validateObjectId(),
  retryPayment
);

router.post('/:id/cancel',
  protect,
  validateObjectId(),
  cancelPayment
);

router.post('/:id/refund',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Refund amount must be at least $0.01'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters')
  ],
  refundPayment
);

router.post('/refund/:id/process',
  protect,
  authorize('admin'),
  validateObjectId(),
  processRefund
);

router.put('/:id/status',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('status')
      .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
      .withMessage('Valid payment status is required'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  updatePaymentStatus
);

// Webhook routes (for payment gateways)
router.post('/webhook/stripe',
  [
    body('type')
      .notEmpty()
      .withMessage('Webhook type is required'),
    body('data')
      .notEmpty()
      .withMessage('Webhook data is required')
  ],
  processPayment
);

router.post('/webhook/paypal',
  [
    body('event_type')
      .notEmpty()
      .withMessage('Event type is required'),
    body('resource')
      .notEmpty()
      .withMessage('Resource data is required')
  ],
  processPayment
);

export default router;
