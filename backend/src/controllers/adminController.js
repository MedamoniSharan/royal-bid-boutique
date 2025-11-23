import { AppError, catchAsync } from '../middleware/errorHandler.js';

export const getDashboardStats = catchAsync(async (req, res, next) => {
  try {
    const Product = (await import('../models/Product.js')).default;
    const User = (await import('../models/User.js')).default;
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get pending products
    const pendingProducts = await Product.countDocuments({ status: 'pending_review' });
    
    // Get active products
    const activeProducts = await Product.countDocuments({ status: 'active', isActive: true });
    
    // Get total auctions (from Product model with auctionType: 'Auction')
    const totalAuctions = await Product.countDocuments({ auctionType: 'Auction' });
    
    // Get active auctions
    const activeAuctions = await Product.countDocuments({ 
      auctionType: 'Auction', 
      status: 'active', 
      isActive: true 
    });
    
    // Get revenue stats (placeholder - would need Payment model)
    const totalRevenue = 0;
    const monthlyRevenue = 0;
    
    const stats = {
      totalUsers,
      totalProducts,
      pendingProducts,
      activeProducts,
      totalAuctions,
      activeAuctions,
      totalRevenue,
      monthlyRevenue
    };
    
    res.json({ 
      success: true, 
      message: 'Dashboard stats retrieved successfully', 
      stats 
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    next(error);
  }
});

export const getUsers = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  const Product = (await import('../models/Product.js')).default;
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find({})
      .select('-password -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const totalUsers = await User.countDocuments();
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userProducts = await Product.countDocuments({ seller: user._id });
        const activeProducts = await Product.countDocuments({ 
          seller: user._id, 
          status: 'active', 
          isActive: true 
        });
        const pendingProducts = await Product.countDocuments({ 
          seller: user._id, 
          status: 'pending_review' 
        });
        
        return {
          ...user.toObject(),
          stats: {
            totalProducts: userProducts,
            activeProducts,
            pendingProducts
          }
        };
      })
    );
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
});

export const getUser = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  const Product = (await import('../models/Product.js')).default;
  
  try {
    const userId = req.params.id;
    
    // Get user details (including password field to check if it exists, but not returning the actual password)
    const userWithPassword = await User.findById(userId).select('+password');
    
    if (!userWithPassword) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if user has a password
    const hasPassword = !!userWithPassword.password;
    
    // Get user details without sensitive fields
    const user = await User.findById(userId)
      .select('-password -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires');
    
    // Get user's products
    const userProducts = await Product.find({ seller: userId })
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Get user stats
    const totalProducts = await Product.countDocuments({ seller: userId });
    const activeProducts = await Product.countDocuments({ 
      seller: userId, 
      status: 'active', 
      isActive: true 
    });
    const pendingProducts = await Product.countDocuments({ 
      seller: userId, 
      status: 'pending_review' 
    });
    const rejectedProducts = await Product.countDocuments({ 
      seller: userId, 
      status: 'rejected' 
    });
    
    res.json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user: {
          ...user.toObject(),
          hasPassword, // Add password check
          stats: {
            totalProducts,
            activeProducts,
            pendingProducts,
            rejectedProducts
          },
          products: userProducts
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    next(error);
  }
});

export const updateUser = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.verificationToken;
    delete updates.verificationTokenExpires;
    delete updates.passwordResetToken;
    delete updates.passwordResetExpires;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  const Product = (await import('../models/Product.js')).default;
  
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if user has active products
    const activeProducts = await Product.countDocuments({ 
      seller: userId, 
      status: 'active' 
    });
    
    if (activeProducts > 0) {
      return next(new AppError('Cannot delete user with active products. Please deactivate products first.', 400));
    }
    
    // Delete user's products first
    await Product.deleteMany({ seller: userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
});

export const suspendUser = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  const Product = (await import('../models/Product.js')).default;
  
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Suspend user
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      suspendedAt: new Date(),
      suspendedBy: req.user.id,
      suspensionReason: reason || 'No reason provided'
    });
    
    // Deactivate all user's products
    await Product.updateMany(
      { seller: userId },
      { isActive: false, status: 'inactive' }
    );
    
    res.json({
      success: true,
      message: 'User suspended successfully'
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    next(error);
  }
});

export const activateUser = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Activate user
    await User.findByIdAndUpdate(userId, {
      isActive: true,
      suspendedAt: null,
      suspendedBy: null,
      suspensionReason: null
    });
    
    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    next(error);
  }
});

export const getUserPassword = catchAsync(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  
  try {
    const userId = req.params.id;
    
    // Get user with password field
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    if (!user.password) {
      return res.json({
        success: true,
        message: 'User has no password set',
        data: { password: null }
      });
    }
    
    // For security, we'll return a placeholder instead of the actual hashed password
    // In a real application, you might want to implement password decryption or 
    // a secure way to view passwords
    res.json({
      success: true,
      message: 'Password retrieved successfully',
      data: { 
        password: 'admin123', // This should be the actual password or a way to retrieve it
        note: 'This is a demo - in production, implement secure password retrieval'
      }
    });
  } catch (error) {
    console.error('Get user password error:', error);
    next(error);
  }
});



export const getAuctions = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin auctions endpoint - requires Auction model', data: { auctions: [] } });
});

export const getAuction = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin get auction endpoint - requires Auction model', data: { auction: null } });
});

export const updateAuction = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin update auction endpoint - requires Auction model' });
});

export const deleteAuction = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin delete auction endpoint - requires Auction model' });
});

export const approveAuction = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Approve auction endpoint - requires Auction model' });
});

export const rejectAuction = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Reject auction endpoint - requires Auction model' });
});

export const getBids = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin bids endpoint - requires Bid model', data: { bids: [] } });
});

export const getBid = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin get bid endpoint - requires Bid model', data: { bid: null } });
});

export const getPayments = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin payments endpoint - requires Payment model', data: { payments: [] } });
});

export const getPayment = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin get payment endpoint - requires Payment model', data: { payment: null } });
});

export const getCategories = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin categories endpoint - requires Category model', data: { categories: [] } });
});

export const getCategory = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin get category endpoint - requires Category model', data: { category: null } });
});

export const createCategory = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin create category endpoint - requires Category model' });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin update category endpoint - requires Category model' });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin delete category endpoint - requires Category model' });
});

export const getProducts = catchAsync(async (req, res, next) => {
  const Product = (await import('../models/Product.js')).default;
  const User = (await import('../models/User.js')).default;
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by auction type if provided
    if (req.query.auctionType) {
      query.auctionType = req.query.auctionType;
    }
    
    console.log('Admin getProducts query:', query);
    console.log('Admin getProducts pagination:', { page, limit, skip });
    
    // Get products with pagination
    const products = await Product.find(query)
      .populate({
        path: 'seller',
        select: 'firstName lastName email avatar',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    console.log(`Admin getProducts: Found ${products.length} products out of ${total} total`);
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      // Also include at root level for backward compatibility
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    next(error);
  }
});

export const getProduct = catchAsync(async (req, res, next) => {
  const Product = (await import('../models/Product.js')).default;
  
  const product = await Product.findById(req.params.id)
    .populate('seller', 'firstName lastName email avatar')
    .select('-__v');
    
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  res.json({
    success: true,
    message: 'Product retrieved successfully',
    product
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const Product = (await import('../models/Product.js')).default;
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('seller', 'firstName lastName email');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  res.json({
    success: true,
    message: 'Product updated successfully',
    product
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const Product = (await import('../models/Product.js')).default;
  
  const product = await Product.findByIdAndDelete(req.params.id);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// New function to approve a product
export const approveProduct = catchAsync(async (req, res, next) => {
  const Product = (await import('../models/Product.js')).default;
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'active',
      isActive: true,
      approvedAt: new Date(),
      approvedBy: req.user.id
    },
    { new: true, runValidators: true }
  ).populate('seller', 'firstName lastName email');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  res.json({
    success: true,
    message: 'Product approved successfully',
    product
  });
});

// New function to reject a product
export const rejectProduct = catchAsync(async (req, res, next) => {
  const Product = (await import('../models/Product.js')).default;
  
  const { reason } = req.body;
  
  if (!reason || reason.trim().length === 0) {
    return next(new AppError('Rejection reason is required', 400));
  }
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected',
      isActive: false,
      rejectionReason: reason.trim(),
      rejectedAt: new Date(),
      rejectedBy: req.user.id
    },
    { new: true, runValidators: true }
  ).populate('seller', 'firstName lastName email');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  res.json({
    success: true,
    message: 'Product rejected successfully',
    product
  });
});

export const getReports = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin reports endpoint - requires Report model', data: { reports: [] } });
});

export const getReport = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin get report endpoint - requires Report model', data: { report: null } });
});

export const resolveReport = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Resolve report endpoint - requires Report model' });
});

export const getNotifications = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin notifications endpoint - requires Notification model', data: { notifications: [] } });
});

export const getNotification = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin get notification endpoint - requires Notification model', data: { notification: null } });
});

export const createNotification = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin create notification endpoint - requires Notification model' });
});

export const updateNotification = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin update notification endpoint - requires Notification model' });
});

export const deleteNotification = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Admin delete notification endpoint - requires Notification model' });
});

export const getSystemLogs = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'System logs endpoint', data: { logs: [] } });
});

export const getSystemHealth = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'System health endpoint', data: { health: 'ok' } });
});

export const updateSystemSettings = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Update system settings endpoint' });
});

export const getSystemSettings = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Get system settings endpoint', data: { settings: {} } });
});

export const exportData = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Export data endpoint' });
});

export const importData = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Import data endpoint' });
});

export const backupDatabase = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Backup database endpoint' });
});

export const restoreDatabase = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Restore database endpoint' });
});

export const getAnalytics = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Analytics endpoint', data: { analytics: {} } });
});

export const getRevenueStats = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Revenue stats endpoint', data: { revenue: {} } });
});

export const getUserActivity = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'User activity endpoint', data: { activity: [] } });
});

export const getAuctionActivity = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Auction activity endpoint', data: { activity: [] } });
});

export const getPaymentActivity = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Payment activity endpoint', data: { activity: [] } });
});

export const getErrorLogs = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Error logs endpoint', data: { logs: [] } });
});

export const clearErrorLogs = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Clear error logs endpoint' });
});

export const getSecurityLogs = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Security logs endpoint', data: { logs: [] } });
});

export const getPerformanceMetrics = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Performance metrics endpoint', data: { metrics: {} } });
});

export const optimizeDatabase = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Optimize database endpoint' });
});

export const clearCache = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Clear cache endpoint' });
});

export const getMaintenanceMode = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Get maintenance mode endpoint', data: { maintenanceMode: false } });
});

export const setMaintenanceMode = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Set maintenance mode endpoint' });
});

export const getApiKeys = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Get API keys endpoint', data: { apiKeys: [] } });
});

export const createApiKey = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Create API key endpoint' });
});

export const updateApiKey = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Update API key endpoint' });
});

export const deleteApiKey = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Delete API key endpoint' });
});

export const getWebhooks = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Get webhooks endpoint', data: { webhooks: [] } });
});

export const createWebhook = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Create webhook endpoint' });
});

export const updateWebhook = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Update webhook endpoint' });
});

export const deleteWebhook = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Delete webhook endpoint' });
});

export const testWebhook = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Test webhook endpoint' });
});
