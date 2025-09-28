import Product from '../models/Product.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';

export const getProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const query = { status: 'active', isActive: true };
  
  // Add filters
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  if (req.query.auctionType) {
    query.auctionType = req.query.auctionType;
  }
  
  if (req.query.condition) {
    query.condition = req.query.condition;
  }
  
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  const products = await Product.find(query)
    .populate('seller', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

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
    }
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'firstName lastName email');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Increment view count
  await product.incrementViewCount();

  res.json({
    success: true,
    message: 'Product retrieved successfully',
    data: {
      product
    }
  });
});

export const createProduct = catchAsync(async (req, res, next) => {
  console.log('Creating product with data:', {
    title: req.body.title,
    category: req.body.category,
    auctionType: req.body.auctionType,
    imagesCount: req.body.images?.length || 0
  });

  const {
    title,
    description,
    category,
    price,
    stocks,
    discount = 0,
    condition,
    auctionType,
    startingBid,
    auctionEndDate,
    brand,
    model,
    authenticity = 'unknown',
    tags = [],
    images = []
  } = req.body;

  // Validate auction-specific fields
  if (auctionType === 'Auction') {
    if (!startingBid) {
      return next(new AppError('Starting bid is required for auction listings', 400));
    }
    if (!auctionEndDate) {
      return next(new AppError('Auction end date is required for auction listings', 400));
    }
    if (new Date(auctionEndDate) <= new Date()) {
      return next(new AppError('Auction end date must be in the future', 400));
    }
  }

  // Validate images
  if (images && images.length > 0) {
    // Check if images are base64 strings
    const invalidImages = images.filter(img => 
      !img.url || 
      (!img.url.startsWith('data:image/') && !img.url.startsWith('http'))
    );
    
    if (invalidImages.length > 0) {
      return next(new AppError('Invalid image format. Please ensure all images are properly uploaded.', 400));
    }
  }

  // Create product data object
  const productData = {
    title,
    description,
    category,
    price: parseFloat(price),
    stocks: parseInt(stocks),
    discount: parseFloat(discount),
    condition,
    auctionType,
    brand,
    model,
    authenticity,
    tags,
    images,
    seller: req.user.id
  };

  // Add auction-specific fields if applicable
  if (auctionType === 'Auction') {
    productData.startingBid = parseFloat(startingBid);
    productData.auctionEndDate = new Date(auctionEndDate);
  }

  try {
    const product = await Product.create(productData);

    // Populate seller information
    await product.populate('seller', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
    }
    return next(new AppError('Failed to create product', 500));
  }
});

export const updateProduct = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Update product endpoint - requires Product model' });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Delete product endpoint - requires Product model' });
});

export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const products = await Product.getByCategory(req.params.categoryId, limit)
    .skip(skip);

  const total = await Product.countDocuments({
    category: req.params.categoryId,
    status: 'active',
    isActive: true
  });

  res.json({
    success: true,
    message: 'Products by category retrieved successfully',
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

export const searchProducts = catchAsync(async (req, res, next) => {
  const query = req.query.q;
  const filters = {
    category: req.query.category,
    auctionType: req.query.auctionType,
    condition: req.query.condition,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice
  };

  const products = await Product.searchProducts(query, filters)
    .populate('seller', 'firstName lastName email')
    .limit(20);

  res.json({
    success: true,
    message: 'Search completed successfully',
    data: {
      products,
      query,
      filters
    }
  });
});

export const getFeaturedProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await Product.getFeaturedProducts(limit);

  res.json({
    success: true,
    message: 'Featured products retrieved successfully',
    data: {
      products
    }
  });
});

export const getPopularProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await Product.getPopularProducts(limit);

  res.json({
    success: true,
    message: 'Popular products retrieved successfully',
    data: {
      products
    }
  });
});

export const getRelatedProducts = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Related products endpoint - requires Product model', data: { products: [] } });
});

export const getProductReviews = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Product reviews endpoint - requires Review model', data: { reviews: [] } });
});

export const addProductReview = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Add product review endpoint - requires Review model' });
});

export const updateProductViewCount = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Update product view count endpoint - requires Product model' });
});

export const getProductStats = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Product stats endpoint - requires Product model', data: { stats: {} } });
});

export const getProductAuctions = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Product auctions endpoint - requires Auction model', data: { auctions: [] } });
});

export const reportProduct = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Report product endpoint - requires Report model' });
});

export const getProductReports = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Product reports endpoint - requires Report model', data: { reports: [] } });
});

export const resolveProductReport = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Resolve product report endpoint - requires Report model' });
});
