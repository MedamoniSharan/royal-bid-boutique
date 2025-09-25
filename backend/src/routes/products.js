import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getPopularProducts,
  getRelatedProducts,
  getProductReviews,
  addProductReview,
  updateProductViewCount,
  getProductStats,
  getProductAuctions,
  reportProduct,
  getProductReports,
  resolveProductReport
} from '../controllers/productController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateProductCreation, validatePagination, validateSearch, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/',
  optionalAuth,
  validatePagination,
  validateSearch,
  getProducts
);

router.get('/featured',
  optionalAuth,
  getFeaturedProducts
);

router.get('/popular',
  optionalAuth,
  getPopularProducts
);

router.get('/search',
  optionalAuth,
  validateSearch,
  searchProducts
);

router.get('/category/:categoryId',
  optionalAuth,
  validateObjectId('categoryId'),
  validatePagination,
  getProductsByCategory
);

router.get('/:id',
  optionalAuth,
  validateObjectId(),
  getProduct
);

router.get('/:id/related',
  optionalAuth,
  validateObjectId(),
  getRelatedProducts
);

router.get('/:id/reviews',
  optionalAuth,
  validateObjectId(),
  validatePagination,
  getProductReviews
);

router.get('/:id/auctions',
  optionalAuth,
  validateObjectId(),
  validatePagination,
  getProductAuctions
);

router.get('/:id/stats',
  optionalAuth,
  validateObjectId(),
  getProductStats
);

router.post('/:id/view',
  validateObjectId(),
  updateProductViewCount
);

// Protected routes
router.post('/',
  protect,
  authorize('seller', 'admin'),
  validateProductCreation,
  createProduct
);

router.put('/:id',
  protect,
  validateObjectId(),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Product name must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('condition')
      .optional()
      .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
      .withMessage('Valid condition is required'),
    body('authenticity')
      .optional()
      .isIn(['authentic', 'replica', 'unknown'])
      .withMessage('Valid authenticity status is required')
  ],
  updateProduct
);

router.delete('/:id',
  protect,
  authorize('admin'),
  validateObjectId(),
  deleteProduct
);

router.post('/:id/reviews',
  protect,
  validateObjectId(),
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
  addProductReview
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
  reportProduct
);

router.get('/reports',
  protect,
  authorize('admin'),
  validatePagination,
  getProductReports
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
  resolveProductReport
);

export default router;
