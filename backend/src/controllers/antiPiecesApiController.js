import Product from '../models/Product.js';
import User from '../models/User.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Get anti-pieces dashboard overview statistics
export const getAntiPiecesDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get total anti-pieces products count
  const totalAntiPiecesProducts = await Product.countDocuments({
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true
  });

  // Get user's anti-pieces products count
  const userAntiPiecesProducts = await Product.countDocuments({
    seller: userId,
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true
  });

  // Get total anti-pieces products value
  const antiPiecesProductsValue = await Product.aggregate([
    {
      $match: {
        auctionType: 'Anti-Piece',
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

  // Get anti-pieces products by category
  const antiPiecesByCategory = await Product.aggregate([
    {
      $match: {
        auctionType: 'Anti-Piece',
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

  // Get recent anti-pieces products
  const recentAntiPiecesProducts = await Product.find({
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(10)
  .select('title price category condition images createdAt seller');

  // Get vintage/antique items (older than 50 years)
  const vintageItems = await Product.find({
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true,
    condition: { $in: ['Excellent', 'Good', 'Fair'] }
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(5)
  .select('title price category condition images seller createdAt');

  const stats = {
    overview: {
      totalAntiPiecesProducts,
      userAntiPiecesProducts,
      totalValue: antiPiecesProductsValue[0]?.totalValue || 0,
      averagePrice: antiPiecesProductsValue[0]?.averagePrice || 0,
      minPrice: antiPiecesProductsValue[0]?.minPrice || 0,
      maxPrice: antiPiecesProductsValue[0]?.maxPrice || 0
    },
    byCategory: antiPiecesByCategory,
    recentProducts: recentAntiPiecesProducts,
    vintageItems
  };

  res.status(200).json({
    success: true,
    message: 'Anti-pieces dashboard stats retrieved successfully',
    data: stats
  });
});

// Get anti-pieces products with advanced filtering and pagination
export const getAntiPiecesProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const query = {
    auctionType: 'Anti-Piece',
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
    .select('-__v');

  const total = await Product.countDocuments(query);

  // Transform products to include anti-pieces-specific data
  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    age: 'Vintage', // Could be calculated based on creation date or manually set
    auctionStatus: 'available'
  }));

  // Get available categories, conditions, and brands for filters
  const categories = await Product.distinct('category', { auctionType: 'Anti-Piece', status: 'active', isActive: true });
  const conditions = await Product.distinct('condition', { auctionType: 'Anti-Piece', status: 'active', isActive: true });
  const brands = await Product.distinct('brand', { auctionType: 'Anti-Piece', status: 'active', isActive: true });
  
  const priceRange = await Product.aggregate([
    { $match: { auctionType: 'Anti-Piece', status: 'active', isActive: true } },
    { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Anti-pieces products retrieved successfully',
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

// Get featured anti-pieces products
export const getFeaturedAntiPiecesProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true,
    isFeatured: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('-__v');

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    age: 'Vintage',
    auctionStatus: 'available'
  }));

  res.status(200).json({
    success: true,
    message: 'Featured anti-pieces products retrieved successfully',
    data: {
      products: transformedProducts
    }
  });
});

// Get popular anti-pieces products
export const getPopularAntiPiecesProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .sort({ viewCount: -1 })
  .limit(limit)
  .select('-__v');

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    age: 'Vintage',
    auctionStatus: 'available'
  }));

  res.status(200).json({
    success: true,
    message: 'Popular anti-pieces products retrieved successfully',
    data: {
      products: transformedProducts
    }
  });
});

// Get anti-pieces products by category
export const getAntiPiecesProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const products = await Product.find({
    auctionType: 'Anti-Piece',
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
    auctionType: 'Anti-Piece',
    category,
    status: 'active',
    isActive: true
  });

  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    discountedPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    age: 'Vintage',
    auctionStatus: 'available'
  }));

  res.status(200).json({
    success: true,
    message: `Anti-pieces products in ${category} category retrieved successfully`,
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

// Search anti-pieces products
export const searchAntiPiecesProducts = catchAsync(async (req, res, next) => {
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
    auctionType: 'Anti-Piece',
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
    discountedPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    age: 'Vintage',
    auctionStatus: 'available'
  }));

  res.status(200).json({
    success: true,
    message: 'Anti-pieces products search completed successfully',
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

// Get anti-pieces product details
export const getAntiPiecesProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid anti-pieces product ID', 400));
  }

  const product = await Product.findOne({
    _id: id,
    auctionType: 'Anti-Piece',
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email avatar')
  .select('-__v');

  if (!product) {
    return next(new AppError('Anti-pieces product not found', 404));
  }

  // Increment view count
  await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

  const transformedProduct = {
    ...product.toObject(),
    discountedPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    age: 'Vintage',
    auctionStatus: 'available'
  };

  // Get related anti-pieces products
  const relatedProducts = await Product.find({
    auctionType: 'Anti-Piece',
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
    discountedPrice: relatedProduct.discount > 0 ? relatedProduct.price * (1 - relatedProduct.discount / 100) : relatedProduct.price,
    age: 'Vintage',
    auctionStatus: 'available'
  }));

  res.status(200).json({
    success: true,
    message: 'Anti-pieces product retrieved successfully',
    data: {
      product: transformedProduct,
      relatedProducts: transformedRelatedProducts
    }
  });
});
