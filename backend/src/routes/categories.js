import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getRootCategories,
  getCategoryChildren,
  getCategoryAncestors,
  getCategoryStats,
  searchCategories,
  getPopularCategories,
  createCategoryHierarchy,
  updateCategoryStatistics
} from '../controllers/categoryController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateCategoryCreation, validatePagination, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/',
  optionalAuth,
  validatePagination,
  getCategories
);

router.get('/tree',
  optionalAuth,
  getCategoryTree
);

router.get('/root',
  optionalAuth,
  getRootCategories
);

router.get('/popular',
  optionalAuth,
  getPopularCategories
);

router.get('/search',
  optionalAuth,
  [
    query('q')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
  ],
  searchCategories
);

router.get('/:id',
  optionalAuth,
  validateObjectId(),
  getCategory
);

router.get('/:id/children',
  optionalAuth,
  validateObjectId(),
  getCategoryChildren
);

router.get('/:id/ancestors',
  optionalAuth,
  validateObjectId(),
  getCategoryAncestors
);

router.get('/:id/stats',
  optionalAuth,
  validateObjectId(),
  getCategoryStats
);

router.get('/slug/:slug',
  optionalAuth,
  [
    param('slug')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Valid slug is required')
  ],
  getCategory
);

// Protected routes (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  validateCategoryCreation,
  createCategory
);

router.put('/:id',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('name')
      .optional()
      .trim()
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
      .withMessage('Valid parent category ID is required'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Icon name cannot exceed 50 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Active status must be a boolean'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Sort order must be a non-negative integer')
  ],
  updateCategory
);

router.delete('/:id',
  protect,
  authorize('admin'),
  validateObjectId(),
  deleteCategory
);

router.post('/hierarchy',
  protect,
  authorize('admin'),
  [
    body('categories')
      .isArray({ min: 1 })
      .withMessage('Categories array is required'),
    body('categories.*.name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required'),
    body('categories.*.description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('categories.*.parent')
      .optional()
      .isMongoId()
      .withMessage('Valid parent category ID is required')
  ],
  createCategoryHierarchy
);

router.put('/:id/statistics',
  protect,
  authorize('admin'),
  validateObjectId(),
  updateCategoryStatistics
);

export default router;
