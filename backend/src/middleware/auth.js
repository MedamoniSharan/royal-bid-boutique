import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check if user is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user owns resource or is admin
export const authorizeOwnerOrAdmin = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Check if user is verified
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required. Please verify your email address.'
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth token invalid:', error.message);
      }
    }

    next();
  } catch (error) {
    // Don't fail the request for optional auth
    next();
  }
};

// Rate limiting for authentication attempts
export const authRateLimit = (req, res, next) => {
  // Initialize session if it doesn't exist
  if (!req.session) {
    req.session = {};
  }
  
  const key = `auth_attempts_${req.ip}`;
  const attempts = req.session.authAttempts || 0;
  const lastAttempt = req.session.lastAuthAttempt || 0;
  const now = Date.now();
  
  // Reset attempts after 15 minutes
  if (now - lastAttempt > 15 * 60 * 1000) {
    req.session.authAttempts = 0;
  }
  
  // Allow up to 5 attempts per 15 minutes
  if (attempts >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.'
    });
  }
  
  next();
};

// Check if user can bid on auction
export const canBid = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to place bids'
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account verification required to place bids'
      });
    }

    const auctionId = req.params.auctionId || req.body.auction;
    
    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: 'Auction ID is required'
      });
    }

    const Auction = mongoose.model('Auction');
    const auction = await Auction.findById(auctionId);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if user is the seller
    if (auction.seller.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot bid on your own auction'
      });
    }

    // Check if auction is active
    if (!auction.canReceiveBids()) {
      return res.status(403).json({
        success: false,
        message: 'This auction is not accepting bids'
      });
    }

    req.auction = auction;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking bid permissions'
    });
  }
};

// Check if user can create auction
export const canCreateAuction = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to create auctions'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to create auctions'
    });
  }

  if (!['seller', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Seller account required to create auctions'
    });
  }

  next();
};

// Check wallet balance for bidding
export const checkWalletBalance = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const bidAmount = req.body.amount || req.body.maxBid;
    
    if (!bidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Bid amount is required'
      });
    }

    // Check if user has sufficient wallet balance for proxy bidding
    if (req.body.isProxyBid && req.user.wallet.balance < bidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance for proxy bidding'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking wallet balance'
    });
  }
};

export default {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  requireVerification,
  optionalAuth,
  authRateLimit,
  canBid,
  canCreateAuction,
  checkWalletBalance
};
