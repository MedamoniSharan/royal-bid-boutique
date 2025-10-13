import Product from '../models/Product.js';
import User from '../models/User.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Get retail dashboard overview statistics
export const getRetailDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get total retail products count
  const totalRetailProducts = await Product.countDocuments({
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  });

  // Get user's retail products count
  const userRetailProducts = await Product.countDocuments({
    seller: userId,
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  });

  // Get total retail products value
  const retailProductsValue = await Product.aggregate([
    {
      $match: {
        auctionType: 'Retail',
        status: 'active',
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$price' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  // Get retail products by category
  const retailByCategory = await Product.aggregate([
    {
      $match: {
        auctionType: 'Retail',
        status: 'active',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: '$price' },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get recent retail products
  const recentRetailProducts = await Product.find({
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(10)
  .select('title price category condition images createdAt seller');

  // Get top selling categories
  const topCategories = await Product.aggregate([
    {
      $match: {
        auctionType: 'Retail',
        status: 'active',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { productCount: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Get price distribution
  const priceDistribution = await Product.aggregate([
    {
      $match: {
        auctionType: 'Retail',
        status: 'active',
        isActive: true
      }
    },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 50, 100, 250, 500, 1000, 2500, 5000, 10000, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      }
    }
  ]);

  const stats = {
    overview: {
      totalRetailProducts,
      userRetailProducts,
      totalValue: retailProductsValue[0]?.totalValue || 0,
      averagePrice: retailProductsValue[0]?.averagePrice || 0,
      minPrice: retailProductsValue[0]?.minPrice || 0,
      maxPrice: retailProductsValue[0]?.maxPrice || 0
    },
    byCategory: retailByCategory,
    topCategories,
    priceDistribution,
    recentProducts: recentRetailProducts
  };

  res.json({
    success: true,
    message: 'Retail dashboard stats retrieved successfully',
    data: stats
  });
});

// Get retail products with advanced filtering and pagination
export const getRetailProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const query = {
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  };
  
  // Add filters
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  if (req.query.condition) {
    query.condition = req.query.condition;
  }
  
  if (req.query.brand) {
    query.brand = { $regex: req.query.brand, $options: 'i' };
  }
  
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { brand: { $regex: req.query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.search, 'i')] } }
    ];
  }

  // Sorting options
  let sort = { createdAt: -1 };
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'popular':
        sort = { viewCount: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'name_asc':
        sort = { title: 1 };
        break;
      case 'name_desc':
        sort = { title: -1 };
        break;
    }
  }

  const products = await Product.find(query)
    .populate('seller', 'firstName lastName email avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('title description price discount condition category brand model images viewCount createdAt seller');

  const total = await Product.countDocuments(query);

  // Get filter options for the current query
  const filterOptions = await Product.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        categories: { $addToSet: '$category' },
        conditions: { $addToSet: '$condition' },
        brands: { $addToSet: '$brand' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  res.json({
    success: true,
    message: 'Retail products retrieved successfully',
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories: filterOptions[0]?.categories || [],
        conditions: filterOptions[0]?.conditions || [],
        brands: filterOptions[0]?.brands.filter(Boolean) || [],
        priceRange: {
          min: filterOptions[0]?.minPrice || 0,
          max: filterOptions[0]?.maxPrice || 0
        }
      }
    }
  });
});

// Get retail product details
export const getRetailProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar stats');

  if (!product) {
    return next(new AppError('Retail product not found', 404));
  }

  // Increment view count
  await product.incrementViewCount();

  // Get related products
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .limit(6)
  .select('title price condition images viewCount seller');

  res.json({
    success: true,
    message: 'Retail product retrieved successfully',
    data: {
      product,
      relatedProducts
    }
  });
});

// Get retail products by category
export const getRetailProductsByCategory = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const products = await Product.find({
    category: req.params.category,
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('title description price discount condition brand model images viewCount createdAt seller');

  const total = await Product.countDocuments({
    category: req.params.category,
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  });

  // Get category statistics
  const categoryStats = await Product.aggregate([
    {
      $match: {
        category: req.params.category,
        auctionType: 'Retail',
        status: 'active',
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalViews: { $sum: '$viewCount' }
      }
    }
  ]);

  res.json({
    success: true,
    message: 'Retail products by category retrieved successfully',
    data: {
      products,
      category: req.params.category,
      stats: categoryStats[0] || {
        totalProducts: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalViews: 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get featured retail products
export const getFeaturedRetailProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;
  
  const products = await Product.find({
    auctionType: 'Retail',
    status: 'active',
    isActive: true,
    isFeatured: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('title description price discount condition category brand model images viewCount createdAt seller');

  res.json({
    success: true,
    message: 'Featured retail products retrieved successfully',
    data: {
      products
    }
  });
});

// Get popular retail products (by view count)
export const getPopularRetailProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;
  
  const products = await Product.find({
    auctionType: 'Retail',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ viewCount: -1, createdAt: -1 })
  .limit(limit)
  .select('title description price discount condition category brand model images viewCount createdAt seller');

  res.json({
    success: true,
    message: 'Popular retail products retrieved successfully',
    data: {
      products
    }
  });
});

// Get retail products on sale (with discount)
export const getRetailProductsOnSale = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const products = await Product.find({
    auctionType: 'Retail',
    status: 'active',
    isActive: true,
    discount: { $gt: 0 }
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ discount: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('title description price discount condition category brand model images viewCount createdAt seller');

  const total = await Product.countDocuments({
    auctionType: 'Retail',
    status: 'active',
    isActive: true,
    discount: { $gt: 0 }
  });

  res.json({
    success: true,
    message: 'Retail products on sale retrieved successfully',
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get retail analytics for sellers
export const getRetailAnalytics = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get user's retail products
  const userProducts = await Product.find({
    seller: userId,
    auctionType: 'Retail'
  });

  // Calculate analytics
  const analytics = await Product.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(userId),
        auctionType: 'Retail'
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$status', 'active'] }, { $eq: ['$isActive', true] }] },
              1,
              0
            ]
          }
        },
        totalViews: { $sum: '$viewCount' },
        averagePrice: { $avg: '$price' },
        totalValue: { $sum: '$price' },
        averageDiscount: { $avg: '$discount' }
      }
    }
  ]);

  // Get products by status
  const productsByStatus = await Product.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(userId),
        auctionType: 'Retail'
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get products by category
  const productsByCategory = await Product.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(userId),
        auctionType: 'Retail'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get monthly product creation trend
  const monthlyTrend = await Product.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(userId),
        auctionType: 'Retail',
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const result = {
    overview: analytics[0] || {
      totalProducts: 0,
      activeProducts: 0,
      totalViews: 0,
      averagePrice: 0,
      totalValue: 0,
      averageDiscount: 0
    },
    byStatus: productsByStatus,
    byCategory: productsByCategory,
    monthlyTrend
  };

  res.json({
    success: true,
    message: 'Retail analytics retrieved successfully',
    data: result
  });
});

// Search retail products
export const searchRetailProducts = catchAsync(async (req, res, next) => {
  const query = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  if (!query || query.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }

  const searchQuery = {
    auctionType: 'Retail',
    status: 'active',
    isActive: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { model: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  const products = await Product.find(searchQuery)
    .populate('seller', 'firstName lastName email avatar')
    .sort({ viewCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title description price discount condition category brand model images viewCount createdAt seller');

  const total = await Product.countDocuments(searchQuery);

  res.json({
    success: true,
    message: 'Retail products search completed successfully',
    data: {
      products,
      query,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get retail product recommendations
export const getRetailRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit) || 8;

  let recommendations = [];

  if (userId) {
    // Get user's viewing history or preferences
    const userProducts = await Product.find({
      seller: userId,
      auctionType: 'Retail'
    }).select('category brand');

    if (userProducts.length > 0) {
      // Get products from similar categories
      const userCategories = [...new Set(userProducts.map(p => p.category))];
      const userBrands = [...new Set(userProducts.map(p => p.brand).filter(Boolean))];

      recommendations = await Product.find({
        auctionType: 'Retail',
        status: 'active',
        isActive: true,
        seller: { $ne: userId },
        $or: [
          { category: { $in: userCategories } },
          { brand: { $in: userBrands } }
        ]
      })
      .populate('seller', 'firstName lastName email avatar')
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(limit)
      .select('title description price discount condition category brand model images viewCount createdAt seller');
    }
  }

  // If no user-specific recommendations, get popular products
  if (recommendations.length === 0) {
    recommendations = await Product.find({
      auctionType: 'Retail',
      status: 'active',
      isActive: true
    })
    .populate('seller', 'firstName lastName email avatar')
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit)
    .select('title description price discount condition category brand model images viewCount createdAt seller');
  }

  res.json({
    success: true,
    message: 'Retail product recommendations retrieved successfully',
    data: {
      products: recommendations
    }
  });
});
