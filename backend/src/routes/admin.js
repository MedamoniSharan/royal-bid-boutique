import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  unsuspendUser,
  getAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  approveAuction,
  rejectAuction,
  getBids,
  getBid,
  getPayments,
  getPayment,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  getReports,
  getReport,
  resolveReport,
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getSystemLogs,
  getSystemHealth,
  updateSystemSettings,
  getSystemSettings,
  exportData,
  importData,
  backupDatabase,
  restoreDatabase,
  getAnalytics,
  getRevenueStats,
  getUserActivity,
  getAuctionActivity,
  getPaymentActivity,
  getErrorLogs,
  clearErrorLogs,
  getSecurityLogs,
  getPerformanceMetrics,
  optimizeDatabase,
  clearCache,
  getMaintenanceMode,
  setMaintenanceMode,
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validatePagination, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard and Analytics
router.get('/dashboard',
  getDashboardStats
);

router.get('/analytics',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Valid start date is required'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Valid end date is required'),
    query('groupBy')
      .optional()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Valid group by option is required')
  ],
  getAnalytics
);

router.get('/revenue',
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
  getRevenueStats
);

// User Management
router.get('/users',
  validatePagination,
  getUsers
);

router.get('/users/:id',
  validateObjectId(),
  getUser
);

router.put('/users/:id',
  validateObjectId(),
  [
    body('role')
      .optional()
      .isIn(['user', 'seller', 'admin'])
      .withMessage('Valid role is required'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Active status must be a boolean'),
    body('isVerified')
      .optional()
      .isBoolean()
      .withMessage('Verification status must be a boolean')
  ],
  updateUser
);

router.delete('/users/:id',
  validateObjectId(),
  deleteUser
);

router.put('/users/:id/suspend',
  validateObjectId(),
  [
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Suspension reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer')
  ],
  suspendUser
);

router.put('/users/:id/unsuspend',
  validateObjectId(),
  unsuspendUser
);

// Auction Management
router.get('/auctions',
  validatePagination,
  getAuctions
);

router.get('/auctions/:id',
  validateObjectId(),
  getAuction
);

router.put('/auctions/:id',
  validateObjectId(),
  updateAuction
);

router.delete('/auctions/:id',
  validateObjectId(),
  deleteAuction
);

router.put('/auctions/:id/approve',
  validateObjectId(),
  approveAuction
);

router.put('/auctions/:id/reject',
  validateObjectId(),
  [
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters')
  ],
  rejectAuction
);

// Bid Management
router.get('/bids',
  validatePagination,
  getBids
);

router.get('/bids/:id',
  validateObjectId(),
  getBid
);

// Payment Management
router.get('/payments',
  validatePagination,
  getPayments
);

router.get('/payments/:id',
  validateObjectId(),
  getPayment
);

// Category Management
router.get('/categories',
  validatePagination,
  getCategories
);

router.get('/categories/:id',
  validateObjectId(),
  getCategory
);

router.post('/categories',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('parent')
      .optional()
      .isMongoId()
      .withMessage('Valid parent category ID is required')
  ],
  createCategory
);

router.put('/categories/:id',
  validateObjectId(),
  updateCategory
);

router.delete('/categories/:id',
  validateObjectId(),
  deleteCategory
);

// Product Management
router.get('/products',
  validatePagination,
  getProducts
);

router.get('/products/:id',
  validateObjectId(),
  getProduct
);

router.put('/products/:id',
  validateObjectId(),
  updateProduct
);

router.delete('/products/:id',
  validateObjectId(),
  deleteProduct
);

router.put('/products/:id/approve',
  validateObjectId(),
  approveProduct
);

router.put('/products/:id/reject',
  validateObjectId(),
  [
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters')
  ],
  rejectProduct
);

// Report Management
router.get('/reports',
  validatePagination,
  getReports
);

router.get('/reports/:id',
  validateObjectId(),
  getReport
);

router.put('/reports/:id/resolve',
  validateObjectId(),
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
  resolveReport
);

// Notification Management
router.get('/notifications',
  validatePagination,
  getNotifications
);

router.get('/notifications/:id',
  validateObjectId(),
  getNotification
);

router.post('/notifications',
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
      .withMessage('At least one recipient is required')
  ],
  createNotification
);

router.put('/notifications/:id',
  validateObjectId(),
  updateNotification
);

router.delete('/notifications/:id',
  validateObjectId(),
  deleteNotification
);

// System Management
router.get('/system/health',
  getSystemHealth
);

router.get('/system/logs',
  validatePagination,
  getSystemLogs
);

router.get('/system/error-logs',
  validatePagination,
  getErrorLogs
);

router.delete('/system/error-logs',
  clearErrorLogs
);

router.get('/system/security-logs',
  validatePagination,
  getSecurityLogs
);

router.get('/system/performance',
  getPerformanceMetrics
);

router.get('/system/settings',
  getSystemSettings
);

router.put('/system/settings',
  [
    body('siteName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Site name cannot exceed 100 characters'),
    body('siteDescription')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Site description cannot exceed 500 characters'),
    body('maintenanceMode')
      .optional()
      .isBoolean()
      .withMessage('Maintenance mode must be a boolean'),
    body('registrationEnabled')
      .optional()
      .isBoolean()
      .withMessage('Registration enabled must be a boolean'),
    body('emailVerificationRequired')
      .optional()
      .isBoolean()
      .withMessage('Email verification required must be a boolean')
  ],
  updateSystemSettings
);

router.get('/system/maintenance',
  getMaintenanceMode
);

router.put('/system/maintenance',
  [
    body('enabled')
      .isBoolean()
      .withMessage('Maintenance mode status must be a boolean'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Maintenance message cannot exceed 500 characters')
  ],
  setMaintenanceMode
);

// Database Management
router.post('/database/backup',
  backupDatabase
);

router.post('/database/restore',
  [
    body('backupFile')
      .notEmpty()
      .withMessage('Backup file is required')
  ],
  restoreDatabase
);

router.post('/database/optimize',
  optimizeDatabase
);

router.delete('/cache',
  clearCache
);

// Data Management
router.post('/export',
  [
    body('type')
      .isIn(['users', 'auctions', 'bids', 'payments', 'categories', 'products'])
      .withMessage('Valid export type is required'),
    body('format')
      .isIn(['csv', 'json', 'xlsx'])
      .withMessage('Valid export format is required'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Valid start date is required'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Valid end date is required')
  ],
  exportData
);

router.post('/import',
  [
    body('type')
      .isIn(['users', 'auctions', 'categories', 'products'])
      .withMessage('Valid import type is required'),
    body('file')
      .notEmpty()
      .withMessage('Import file is required')
  ],
  importData
);

// API Management
router.get('/api-keys',
  validatePagination,
  getApiKeys
);

router.post('/api-keys',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('API key name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('permissions')
      .isArray()
      .withMessage('Permissions must be an array'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('Valid expiration date is required')
  ],
  createApiKey
);

router.put('/api-keys/:id',
  validateObjectId(),
  updateApiKey
);

router.delete('/api-keys/:id',
  validateObjectId(),
  deleteApiKey
);

// Webhook Management
router.get('/webhooks',
  validatePagination,
  getWebhooks
);

router.post('/webhooks',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Webhook name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('url')
      .isURL()
      .withMessage('Valid webhook URL is required'),
    body('events')
      .isArray({ min: 1 })
      .withMessage('At least one event is required'),
    body('secret')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Secret must be at least 10 characters')
  ],
  createWebhook
);

router.put('/webhooks/:id',
  validateObjectId(),
  updateWebhook
);

router.delete('/webhooks/:id',
  validateObjectId(),
  deleteWebhook
);

router.post('/webhooks/:id/test',
  validateObjectId(),
  testWebhook
);

// Activity Monitoring
router.get('/activity/users',
  validatePagination,
  getUserActivity
);

router.get('/activity/auctions',
  validatePagination,
  getAuctionActivity
);

router.get('/activity/payments',
  validatePagination,
  getPaymentActivity
);

export default router;
