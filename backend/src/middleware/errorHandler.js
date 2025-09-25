import mongoose from 'mongoose';

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle different types of errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (errors) => {
  const formattedErrors = {};
  
  errors.forEach(error => {
    if (!formattedErrors[error.param]) {
      formattedErrors[error.param] = [];
    }
    formattedErrors[error.param].push(error.msg);
  });

  return new AppError('Validation failed', 400, formattedErrors);
};

// Database error handler
export const handleDatabaseError = (error) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return handleValidationErrorDB(error);
  }
  
  if (error.code === 11000) {
    return handleDuplicateFieldsDB(error);
  }
  
  if (error.name === 'CastError') {
    return handleCastErrorDB(error);
  }
  
  return new AppError('Database operation failed', 500);
};

// File upload error handler
export const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 400);
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 400);
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400);
  }
  
  return new AppError('File upload failed', 500);
};

// Rate limit error handler
export const handleRateLimitError = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: req.rateLimit?.resetTime
  });
};

// CORS error handler
export const handleCORSError = (req, res) => {
  res.status(403).json({
    success: false,
    message: 'CORS policy violation'
  });
};

// Not found error handler
export const handleNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404);
};

// Unauthorized error handler
export const handleUnauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(message, 401);
};

// Forbidden error handler
export const handleForbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403);
};

// Bad request error handler
export const handleBadRequestError = (message = 'Bad request') => {
  return new AppError(message, 400);
};

// Conflict error handler
export const handleConflictError = (message = 'Resource conflict') => {
  return new AppError(message, 409);
};

// Internal server error handler
export const handleInternalError = (message = 'Internal server error') => {
  return new AppError(message, 500);
};

export default errorHandler;
