import express from 'express';
import { body, query } from 'express-validator';
import {
  getRetailDashboardStats,
  getRetailProducts,
  getRetailProduct,
  getRetailProductsByCategory,
  getFeaturedRetailProducts,
  getPopularRetailProducts,
  getRetailProductsOnSale,
  getRetailAnalytics,
  searchRetailProducts,
  getRetailRecommendations
} from '../controllers/retailController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validatePagination, validateObjectId, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public routes - accessible to all users
router.get('/products',
  optionalAuth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('category')
      .optional()
      .isIn(['Watches', 'Collectibles', 'Art', 'Jewelry', 'Electronics', 'Fashion', 'Antiques', 'Books', 'Sports', 'Home & Garden'])
      .withMessage('Invalid category'),
    query('condition')
      .optional()
      .isIn(['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'])
      .withMessage('Invalid condition'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('sort')
      .optional()
      .isIn(['price_asc', 'price_desc', 'popular', 'newest', 'oldest', 'name_asc', 'name_desc'])
      .withMessage('Invalid sort option'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    handleValidationErrors
  ],
  getRetailProducts
);

router.get('/products/featured',
  optionalAuth,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  getFeaturedRetailProducts
);

router.get('/products/popular',
  optionalAuth,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  getPopularRetailProducts
);

router.get('/products/sale',
  optionalAuth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  getRetailProductsOnSale
);

router.get('/products/category/:category',
  optionalAuth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('category')
      .isIn(['Watches', 'Collectibles', 'Art', 'Jewelry', 'Electronics', 'Fashion', 'Antiques', 'Books', 'Sports', 'Home & Garden'])
      .withMessage('Invalid category'),
    handleValidationErrors
  ],
  getRetailProductsByCategory
);

router.get('/products/search',
  optionalAuth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('q')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    handleValidationErrors
  ],
  searchRetailProducts
);

router.get('/products/recommendations',
  optionalAuth,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  getRetailRecommendations
);

router.get('/products/:id',
  optionalAuth,
  validateObjectId(),
  getRetailProduct
);

// Protected routes - require authentication
router.get('/dashboard/stats',
  protect,
  getRetailDashboardStats
);

router.get('/analytics',
  protect,
  getRetailAnalytics
);

// Admin routes - require admin authorization
router.get('/admin/dashboard',
  protect,
  authorize('admin'),
  getRetailDashboardStats
);

export default router;
