import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

// Log directory
const logDir = path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file paths
const logFiles = {
  error: path.join(logDir, 'error.log'),
  warn: path.join(logDir, 'warn.log'),
  info: path.join(logDir, 'info.log'),
  debug: path.join(logDir, 'debug.log'),
  combined: path.join(logDir, 'combined.log')
};

// Format log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISO8601();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaString}`;
};

// Write to log file
const writeToLogFile = (level, message, meta = {}) => {
  const logMessage = formatLogMessage(level, message, meta);
  
  // Write to specific level file
  fs.appendFileSync(logFiles[level.toLowerCase()], logMessage + '\n');
  
  // Write to combined file
  fs.appendFileSync(logFiles.combined, logMessage + '\n');
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(logMessage);
  }
};

// Log functions
export const error = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    writeToLogFile('ERROR', message, meta);
  }
};

export const warn = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    writeToLogFile('WARN', message, meta);
  }
};

export const info = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    writeToLogFile('INFO', message, meta);
  }
};

export const debug = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    writeToLogFile('DEBUG', message, meta);
  }
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error logger middleware
export const errorLogger = (err, req, res, next) => {
  error('Request error', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    userId: req.user?.id
  });
  
  next(err);
};

// Database logger
export const dbLogger = {
  query: (query, params, duration) => {
    debug('Database query', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: `${duration}ms`
    });
  },
  
  error: (error, query) => {
    error('Database error', {
      error: error.message,
      query: query?.replace(/\s+/g, ' ').trim()
    });
  }
};

// Authentication logger
export const authLogger = {
  login: (userId, ip, success) => {
    const level = success ? 'info' : 'warn';
    const message = success ? 'User login successful' : 'User login failed';
    
    writeToLogFile(level.toUpperCase(), message, {
      userId,
      ip,
      success
    });
  },
  
  logout: (userId, ip) => {
    info('User logout', { userId, ip });
  },
  
  registration: (userId, email, ip) => {
    info('User registration', { userId, email, ip });
  },
  
  passwordReset: (userId, email, ip) => {
    info('Password reset requested', { userId, email, ip });
  },
  
  emailVerification: (userId, email, success) => {
    const level = success ? 'info' : 'warn';
    const message = success ? 'Email verification successful' : 'Email verification failed';
    
    writeToLogFile(level.toUpperCase(), message, {
      userId,
      email,
      success
    });
  }
};

// Payment logger
export const paymentLogger = {
  payment: (paymentId, userId, amount, status, gateway) => {
    const level = status === 'completed' ? 'info' : 'warn';
    
    writeToLogFile(level.toUpperCase(), 'Payment processed', {
      paymentId,
      userId,
      amount,
      status,
      gateway
    });
  },
  
  refund: (paymentId, userId, amount, reason) => {
    info('Payment refunded', {
      paymentId,
      userId,
      amount,
      reason
    });
  },
  
  failure: (paymentId, userId, amount, error, gateway) => {
    error('Payment failed', {
      paymentId,
      userId,
      amount,
      error: error.message,
      gateway
    });
  }
};

// Auction logger
export const auctionLogger = {
  created: (auctionId, userId, title) => {
    info('Auction created', {
      auctionId,
      userId,
      title
    });
  },
  
  ended: (auctionId, winnerId, finalPrice) => {
    info('Auction ended', {
      auctionId,
      winnerId,
      finalPrice
    });
  },
  
  bid: (auctionId, bidderId, amount) => {
    info('Bid placed', {
      auctionId,
      bidderId,
      amount
    });
  }
};

// Security logger
export const securityLogger = {
  suspiciousActivity: (userId, ip, activity, details) => {
    warn('Suspicious activity detected', {
      userId,
      ip,
      activity,
      details
    });
  },
  
  rateLimitExceeded: (ip, endpoint) => {
    warn('Rate limit exceeded', {
      ip,
      endpoint
    });
  },
  
  unauthorizedAccess: (ip, endpoint, userAgent) => {
    warn('Unauthorized access attempt', {
      ip,
      endpoint,
      userAgent
    });
  }
};

// Performance logger
export const performanceLogger = {
  slowQuery: (query, duration, threshold = 1000) => {
    if (duration > threshold) {
      warn('Slow database query', {
        query: query.replace(/\s+/g, ' ').trim(),
        duration: `${duration}ms`,
        threshold: `${threshold}ms`
      });
    }
  },
  
  slowRequest: (method, url, duration, threshold = 2000) => {
    if (duration > threshold) {
      warn('Slow request', {
        method,
        url,
        duration: `${duration}ms`,
        threshold: `${threshold}ms`
      });
    }
  }
};

// Clean up old log files
export const cleanupLogs = (daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  Object.values(logFiles).forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        info('Cleaned up old log file', { file: filePath });
      }
    }
  });
};

// Get log statistics
export const getLogStats = () => {
  const stats = {};
  
  Object.entries(logFiles).forEach(([level, filePath]) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      stats[level] = {
        fileSize: fs.statSync(filePath).size,
        lineCount: lines.length,
        lastModified: fs.statSync(filePath).mtime
      };
    }
  });
  
  return stats;
};

// Export all loggers
export default {
  error,
  warn,
  info,
  debug,
  requestLogger,
  errorLogger,
  dbLogger,
  authLogger,
  paymentLogger,
  auctionLogger,
  securityLogger,
  performanceLogger,
  cleanupLogs,
  getLogStats
};
