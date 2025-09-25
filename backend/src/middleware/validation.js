import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters'),
  
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
  
  handleValidationErrors
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Auction validation rules
export const validateAuctionCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Auction title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Auction description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  
  body('product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  
  body('startingPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Starting price must be at least $0.01'),
  
  body('reservePrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Reserve price must be at least $0.01'),
  
  body('buyNowPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Buy now price must be at least $0.01'),
  
  body('minBidIncrement')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Minimum bid increment must be at least $0.01'),
  
  body('endTime')
    .isISO8601()
    .withMessage('Valid end time is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('End time must be in the future');
      }
      return true;
    }),
  
  body('terms.condition')
    .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
    .withMessage('Valid condition is required'),
  
  body('terms.authenticity')
    .optional()
    .isIn(['authentic', 'replica', 'unknown'])
    .withMessage('Valid authenticity status is required'),
  
  handleValidationErrors
];

export const validateAuctionUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('reservePrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Reserve price must be at least $0.01'),
  
  body('buyNowPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Buy now price must be at least $0.01'),
  
  handleValidationErrors
];

// Bid validation rules
export const validateBidCreation = [
  body('auction')
    .isMongoId()
    .withMessage('Valid auction ID is required'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Bid amount must be at least $0.01'),
  
  body('maxBid')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Maximum bid amount must be at least $0.01')
    .custom((value, { req }) => {
      if (value && value < req.body.amount) {
        throw new Error('Maximum bid must be greater than or equal to bid amount');
      }
      return true;
    }),
  
  body('isProxyBid')
    .optional()
    .isBoolean()
    .withMessage('Proxy bid flag must be a boolean'),
  
  handleValidationErrors
];

// Product validation rules
export const validateProductCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  
  body('condition')
    .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
    .withMessage('Valid condition is required'),
  
  body('authenticity')
    .optional()
    .isIn(['authentic', 'replica', 'unknown'])
    .withMessage('Valid authenticity status is required'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model cannot exceed 100 characters'),
  
  body('estimatedValue.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum estimated value must be non-negative'),
  
  body('estimatedValue.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum estimated value must be non-negative')
    .custom((value, { req }) => {
      if (value && req.body.estimatedValue?.min && value < req.body.estimatedValue.min) {
        throw new Error('Maximum estimated value must be greater than minimum');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Category validation rules
export const validateCategoryCreation = [
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
    .withMessage('Valid parent category ID is required'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  
  handleValidationErrors
];

// Payment validation rules
export const validatePaymentCreation = [
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
    .withMessage('Valid payment method is required'),
  
  body('gateway')
    .isIn(['stripe', 'paypal', 'square', 'internal'])
    .withMessage('Valid payment gateway is required'),
  
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Valid ${paramName} is required`),
  
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'price', '-price', 'title', '-title'])
    .withMessage('Invalid sort parameter'),
  
  handleValidationErrors
];

export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),
  
  query('condition')
    .optional()
    .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
    .withMessage('Valid condition is required'),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateAuctionCreation,
  validateAuctionUpdate,
  validateBidCreation,
  validateProductCreation,
  validateCategoryCreation,
  validatePaymentCreation,
  validateObjectId,
  validatePagination,
  validateSearch
};
