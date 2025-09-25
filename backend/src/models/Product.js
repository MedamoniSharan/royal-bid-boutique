import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
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
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    required: [true, 'Product condition is required']
  },
  authenticity: {
    type: String,
    enum: ['authentic', 'replica', 'unknown'],
    default: 'unknown'
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'kg', 'lbs'],
      default: 'cm'
    }
  },
  materials: [String],
  colors: [String],
  sizes: [String],
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
  specifications: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: String
  }],
  features: [String],
  tags: [String],
  estimatedValue: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  provenance: {
    origin: String,
    history: String,
    documentation: [String],
    certificates: [String]
  },
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    duration: String,
    terms: String,
    provider: String
  },
  returnPolicy: {
    allowed: {
      type: Boolean,
      default: false
    },
    duration: String,
    conditions: String
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    fragile: {
      type: Boolean,
      default: false
    },
    requiresSpecialHandling: {
      type: Boolean,
      default: false
    },
    restrictions: [String]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'pending_review'],
    default: 'active'
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
    default: true
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

// Virtual for full dimensions string
productSchema.virtual('dimensionsString').get(function() {
  if (!this.dimensions.length || !this.dimensions.width || !this.dimensions.height) {
    return null;
  }
  return `${this.dimensions.length} × ${this.dimensions.width} × ${this.dimensions.height} ${this.dimensions.unit}`;
});

// Virtual for estimated value range
productSchema.virtual('estimatedValueRange').get(function() {
  if (!this.estimatedValue.min || !this.estimatedValue.max) {
    return null;
  }
  return `$${this.estimatedValue.min} - $${this.estimatedValue.max}`;
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ condition: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ createdAt: -1 });

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
  .select('name images estimatedValue condition');
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
        { name: { $regex: query, $options: 'i' } },
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

  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {};
    if (filters.minPrice) priceFilter['estimatedValue.min'] = { $gte: filters.minPrice };
    if (filters.maxPrice) priceFilter['estimatedValue.max'] = { $lte: filters.maxPrice };
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
  .populate('category', 'name')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get popular products
productSchema.statics.getPopularProducts = function(limit = 10) {
  return this.find({
    status: 'active',
    isActive: true
  })
  .populate('category', 'name')
  .sort({ viewCount: -1 })
  .limit(limit);
};

// Static method to get products by category
productSchema.statics.getByCategory = function(categoryId, limit = 20) {
  return this.find({
    category: categoryId,
    status: 'active',
    isActive: true
  })
  .populate('category', 'name')
  .sort({ createdAt: -1 })
  .limit(limit);
};

export default mongoose.model('Product', productSchema);
