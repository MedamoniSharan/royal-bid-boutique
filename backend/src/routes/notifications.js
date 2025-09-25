import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  getUnreadCount,
  getNotificationSettings,
  updateNotificationSettings,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  sendNotification,
  getNotificationStats,
  deleteAllNotifications,
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate
} from '../controllers/notificationController.js';
import { protect, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { validatePagination, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.get('/',
  protect,
  validatePagination,
  getNotifications
);

router.get('/user/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  validatePagination,
  getUserNotifications
);

router.get('/unread-count/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  getUnreadCount
);

router.get('/settings/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  getNotificationSettings
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
  getNotificationStats
);

router.get('/templates',
  protect,
  authorize('admin'),
  validatePagination,
  getNotificationTemplates
);

router.get('/:id',
  protect,
  validateObjectId(),
  getNotification
);

router.post('/',
  protect,
  authorize('admin'),
  [
    body('type')
      .isIn(['bid', 'auction_end', 'payment', 'system', 'promotional'])
      .withMessage('Valid notification type is required'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Notification title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Notification message is required')
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('At least one recipient is required'),
    body('recipients.*')
      .isMongoId()
      .withMessage('Valid recipient ID is required'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object')
  ],
  createNotification
);

router.post('/send',
  protect,
  authorize('admin'),
  [
    body('templateId')
      .isMongoId()
      .withMessage('Valid template ID is required'),
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('At least one recipient is required'),
    body('recipients.*')
      .isMongoId()
      .withMessage('Valid recipient ID is required'),
    body('variables')
      .optional()
      .isObject()
      .withMessage('Variables must be an object')
  ],
  sendNotification
);

router.post('/templates',
  protect,
  authorize('admin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Template name is required')
      .isLength({ max: 100 })
      .withMessage('Template name cannot exceed 100 characters'),
    body('type')
      .isIn(['email', 'sms', 'push', 'in_app'])
      .withMessage('Valid template type is required'),
    body('subject')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Subject cannot exceed 200 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Template content is required')
      .isLength({ max: 2000 })
      .withMessage('Content cannot exceed 2000 characters'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variables must be an array')
  ],
  createNotificationTemplate
);

router.put('/:id',
  protect,
  validateObjectId(),
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
    body('isRead')
      .optional()
      .isBoolean()
      .withMessage('Read status must be a boolean')
  ],
  updateNotification
);

router.put('/:id/read',
  protect,
  validateObjectId(),
  markAsRead
);

router.put('/read-all/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  markAllAsRead
);

router.put('/settings/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  [
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be a boolean'),
    body('smsNotifications')
      .optional()
      .isBoolean()
      .withMessage('SMS notifications must be a boolean'),
    body('pushNotifications')
      .optional()
      .isBoolean()
      .withMessage('Push notifications must be a boolean'),
    body('bidAlerts')
      .optional()
      .isBoolean()
      .withMessage('Bid alerts must be a boolean'),
    body('auctionEndAlerts')
      .optional()
      .isBoolean()
      .withMessage('Auction end alerts must be a boolean'),
    body('paymentAlerts')
      .optional()
      .isBoolean()
      .withMessage('Payment alerts must be a boolean'),
    body('promotionalEmails')
      .optional()
      .isBoolean()
      .withMessage('Promotional emails must be a boolean')
  ],
  updateNotificationSettings
);

router.put('/templates/:id',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Template name cannot exceed 100 characters'),
    body('subject')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Subject cannot exceed 200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Content cannot exceed 2000 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Active status must be a boolean')
  ],
  updateNotificationTemplate
);

router.post('/subscribe',
  protect,
  [
    body('type')
      .isIn(['bid', 'auction_end', 'payment', 'system', 'promotional'])
      .withMessage('Valid notification type is required'),
    body('auctionId')
      .optional()
      .isMongoId()
      .withMessage('Valid auction ID is required')
  ],
  subscribeToNotifications
);

router.post('/unsubscribe',
  protect,
  [
    body('type')
      .isIn(['bid', 'auction_end', 'payment', 'system', 'promotional'])
      .withMessage('Valid notification type is required'),
    body('auctionId')
      .optional()
      .isMongoId()
      .withMessage('Valid auction ID is required')
  ],
  unsubscribeFromNotifications
);

router.delete('/:id',
  protect,
  validateObjectId(),
  deleteNotification
);

router.delete('/all/:userId',
  protect,
  authorizeOwnerOrAdmin(),
  validateObjectId('userId'),
  deleteAllNotifications
);

router.delete('/templates/:id',
  protect,
  authorize('admin'),
  validateObjectId(),
  deleteNotificationTemplate
);

export default router;
