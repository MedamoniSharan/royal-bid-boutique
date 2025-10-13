import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Watches', 'Collectibles', 'Art', 'Jewelry', 'Electronics', 'Fashion', 'Antiques', 'Books', 'Sports', 'Home & Garden']
  },
  
  // Pricing & Inventory
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be non-negative']
  },
  stocks: {
    type: Number,
    required: [true, 'Stocks is required'],
    min: [0, 'Stocks must be non-negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  
  // Product Details
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor']
  },
  
  // Listing Type
  auctionType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['Auction', 'Retail', 'Anti-Piece']
  },
  
  // Auction Specific Fields
  startingBid: {
    type: Number,
    min: [0, 'Starting bid must be non-negative']
  },
  auctionEndDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.auctionType === 'Auction' && !value) {
          return false;
        }
        return true;
      },
      message: 'Auction end date is required for auction listings'
    }
  },
  
  // Additional Product Information
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  authenticity: {
    type: String,
    enum: ['authentic', 'replica', 'unknown'],
    default: 'unknown'
  },
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Additional Information
  tags: [String],
  
  // Status & Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'pending_review', 'rejected'],
    default: 'pending_review'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false // Changed to false so products need admin approval
  },
  
  // Admin Approval Fields
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual for auction status
productSchema.virtual('auctionStatus').get(function() {
  if (this.auctionType === 'Auction' && this.auctionEndDate) {
    const now = new Date();
    if (now > this.auctionEndDate) {
      return 'ended';
    }
    return 'active';
  }
  return null;
});

// Indexes for better performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ condition: 1 });
productSchema.index({ auctionType: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ seller: 1 });
productSchema.index({ auctionEndDate: 1 });

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.sku = `PRD-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to get related products
productSchema.methods.getRelatedProducts = function(limit = 5) {
  return this.constructor.find({
    _id: { $ne: this._id },
    category: this.category,
    status: 'active',
    isActive: true
  })
  .limit(limit)
  .select('title images price condition auctionType');
};

// Method to check if product is available for auction
productSchema.methods.isAvailableForAuction = function() {
  return this.status === 'active' && this.isActive;
};

// Static method to search products
productSchema.statics.searchProducts = function(query, filters = {}) {
  const searchQuery = {
    $and: [
      { status: 'active', isActive: true }
    ]
  };

  // Text search
  if (query) {
    searchQuery.$and.push({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });
  }

  // Apply filters
  if (filters.category) {
    searchQuery.$and.push({ category: filters.category });
  }

  if (filters.brand) {
    searchQuery.$and.push({ brand: { $regex: filters.brand, $options: 'i' } });
  }

  if (filters.condition) {
    searchQuery.$and.push({ condition: filters.condition });
  }

  if (filters.auctionType) {
    searchQuery.$and.push({ auctionType: filters.auctionType });
  }

  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {};
    if (filters.minPrice) priceFilter.price = { $gte: filters.minPrice };
    if (filters.maxPrice) priceFilter.price = { $lte: filters.maxPrice };
    searchQuery.$and.push(priceFilter);
  }

  return this.find(searchQuery);
};

// Static method to get featured products
productSchema.statics.getFeaturedProducts = function(limit = 10) {
  return this.find({
    isFeatured: true,
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get popular products
productSchema.statics.getPopularProducts = function(limit = 10) {
  return this.find({
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ viewCount: -1 })
  .limit(limit);
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category, limit = 20) {
  return this.find({
    category: category,
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get products by auction type
productSchema.statics.getByAuctionType = function(auctionType, limit = 20) {
  return this.find({
    auctionType: auctionType,
    status: 'active',
    isActive: true
  })
  .populate('seller', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

export default mongoose.model('Product', productSchema);
