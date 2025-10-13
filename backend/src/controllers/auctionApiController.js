import Product from '../models/Product.js';
import User from '../models/User.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Get auction dashboard overview statistics
export const getAuctionDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get total auction products count
  const totalAuctionProducts = await Product.countDocuments({
    auctionType: 'Auction',
    status: 'active',
    isActive: true
  });

  // Get user's auction products count
  const userAuctionProducts = await Product.countDocuments({
    seller: userId,
    auctionType: 'Auction',
    status: 'active',
    isActive: true
  });

  // Get total auction products value
  const auctionProductsValue = await Product.aggregate([
    {
      $match: {
        auctionType: 'Auction',
        status: 'active',
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$startingBid' },
        averageStartingBid: { $avg: '$startingBid' },
        minStartingBid: { $min: '$startingBid' },
        maxStartingBid: { $max: '$startingBid' }
      }
    }
  ]);

  // Get auction products by category
  const auctionByCategory = await Product.aggregate([
    {
      $match: {
        auctionType: 'Auction',
        status: 'active',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: '$startingBid' },
        averageStartingBid: { $avg: '$startingBid' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get recent auction products
  const recentAuctionProducts = await Product.find({
    auctionType: 'Auction',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(10)
  .select('title startingBid category condition images createdAt seller auctionEndDate');

  // Get live auctions (ending soon)
  const liveAuctions = await Product.find({
    auctionType: 'Auction',
    status: 'active',
    isActive: true,
    auctionEndDate: { $gt: new Date() }
  })
  .populate('seller', 'firstName lastName email')
  .sort({ auctionEndDate: 1 })
  .limit(5)
  .select('title startingBid category condition images seller auctionEndDate');

  const stats = {
    overview: {
      totalAuctionProducts,
      userAuctionProducts,
      totalValue: auctionProductsValue[0]?.totalValue || 0,
      averageStartingBid: auctionProductsValue[0]?.averageStartingBid || 0,
      minStartingBid: auctionProductsValue[0]?.minStartingBid || 0,
      maxStartingBid: auctionProductsValue[0]?.maxStartingBid || 0
    },
    byCategory: auctionByCategory,
    recentProducts: recentAuctionProducts,
    liveAuctions
  };

  res.status(200).json({
    success: true,
    message: 'Auction dashboard stats retrieved successfully',
    data: stats
  });
});

// Get auction products with advanced filtering and pagination
export const getAuctionProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const query = {
    auctionType: 'Auction',
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
    query.startingBid = {};
    if (req.query.minPrice) query.startingBid.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.startingBid.$lte = parseFloat(req.query.maxPrice);
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
        sort = { startingBid: 1 };
        break;
      case 'price_desc':
        sort = { startingBid: -1 };
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
      case 'ending_soon':
        sort = { auctionEndDate: 1 };
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
    .select('-__v');

  const total = await Product.countDocuments(query);

  // Transform products to include auction-specific data
  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.startingBid,
    auctionStatus: product.auctionEndDate > new Date() ? 'live' : 'ended',
    timeLeft: product.auctionEndDate > new Date() ? 
      Math.max(0, product.auctionEndDate - new Date()) : 0
  }));

  // Get available categories, conditions, and brands for filters
  const categories = await Product.distinct('category', { auctionType: 'Auction', status: 'active', isActive: true });
  const conditions = await Product.distinct('condition', { auctionType: 'Auction', status: 'active', isActive: true });
  const brands = await Product.distinct('brand', { auctionType: 'Auction', status: 'active', isActive: true });
  
  const priceRange = await Product.aggregate([
    { $match: { auctionType: 'Auction', status: 'active', isActive: true } },
    { $group: { _id: null, min: { $min: '$startingBid' }, max: { $max: '$startingBid' } } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Auction products retrieved successfully',
    data: {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        conditions,
        brands,
        priceRange: priceRange[0] || { min: 0, max: 0 }
      }
    }
  });
});

// Get featured auction products
export const getFeaturedAuctionProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    auctionType: 'Auction',
    status: 'active',
    isActive: true,
    isFeatured: true,
    auctionEndDate: { $gt: new Date() }
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('-__v');

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.startingBid,
    auctionStatus: 'live',
    timeLeft: Math.max(0, product.auctionEndDate - new Date())
  }));

  res.status(200).json({
    success: true,
    message: 'Featured auction products retrieved successfully',
    data: {
      products: transformedProducts
    }
  });
});

// Get popular auction products
export const getPopularAuctionProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    auctionType: 'Auction',
    status: 'active',
    isActive: true,
    auctionEndDate: { $gt: new Date() }
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ viewCount: -1 })
  .limit(limit)
  .select('-__v');

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.startingBid,
    auctionStatus: 'live',
    timeLeft: Math.max(0, product.auctionEndDate - new Date())
  }));

  res.status(200).json({
    success: true,
    message: 'Popular auction products retrieved successfully',
    data: {
      products: transformedProducts
    }
  });
});

// Get auction products by category
export const getAuctionProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const products = await Product.find({
    auctionType: 'Auction',
    category,
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('-__v');

  const total = await Product.countDocuments({
    auctionType: 'Auction',
    category,
    status: 'active',
    isActive: true
  });

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.startingBid,
    auctionStatus: product.auctionEndDate > new Date() ? 'live' : 'ended',
    timeLeft: product.auctionEndDate > new Date() ? 
      Math.max(0, product.auctionEndDate - new Date()) : 0
  }));

  res.status(200).json({
    success: true,
    message: `Auction products in ${category} category retrieved successfully`,
    data: {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Search auction products
export const searchAuctionProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const query = {
    auctionType: 'Auction',
    status: 'active',
    isActive: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ]
  };

  const products = await Product.find(query)
    .populate('seller', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await Product.countDocuments(query);

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.startingBid,
    auctionStatus: product.auctionEndDate > new Date() ? 'live' : 'ended',
    timeLeft: product.auctionEndDate > new Date() ? 
      Math.max(0, product.auctionEndDate - new Date()) : 0
  }));

  res.status(200).json({
    success: true,
    message: 'Auction products search completed successfully',
    data: {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      query: q
    }
  });
});

// Get auction product details
export const getAuctionProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid auction product ID', 400));
  }

  const product = await Product.findOne({
    _id: id,
    auctionType: 'Auction',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .select('-__v');

  if (!product) {
    return next(new AppError('Auction product not found', 404));
  }

  // Increment view count
  await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

  const transformedProduct = {
    ...product.toObject(),
    discountedPrice: product.startingBid,
    auctionStatus: product.auctionEndDate > new Date() ? 'live' : 'ended',
    timeLeft: product.auctionEndDate > new Date() ? 
      Math.max(0, product.auctionEndDate - new Date()) : 0
  };

  // Get related auction products
  const relatedProducts = await Product.find({
    auctionType: 'Auction',
    category: product.category,
    _id: { $ne: id },
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ createdAt: -1 })
  .limit(4)
  .select('-__v');

  const transformedRelatedProducts = relatedProducts.map(relatedProduct => ({
    ...relatedProduct.toObject(),
    discountedPrice: relatedProduct.startingBid,
    auctionStatus: relatedProduct.auctionEndDate > new Date() ? 'live' : 'ended',
    timeLeft: relatedProduct.auctionEndDate > new Date() ? 
      Math.max(0, relatedProduct.auctionEndDate - new Date()) : 0
  }));

  res.status(200).json({
    success: true,
    message: 'Auction product retrieved successfully',
    data: {
      product: transformedProduct,
      relatedProducts: transformedRelatedProducts
    }
  });
});