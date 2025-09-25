import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  path: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'category'
  },
  image: {
    url: String,
    alt: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'boolean', 'date'],
      default: 'text'
    },
    options: [String],
    required: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    }
  }],
  statistics: {
    productCount: {
      type: Number,
      default: 0
    },
    auctionCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for full path with names
categorySchema.virtual('fullPath').get(function() {
  return this.path.split('/').map(id => {
    // This would need to be populated to show actual names
    return id;
  });
});

// Indexes for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to generate slug and path
categorySchema.pre('save', async function(next) {
  try {
    // Generate slug from name
    if (this.isModified('name')) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Calculate level and path
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = `${parentCategory.path}/${this._id}`;
      } else {
        this.level = 0;
        this.path = this._id.toString();
      }
    } else {
      this.level = 0;
      this.path = this._id.toString();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update children paths
categorySchema.post('save', async function() {
  try {
    if (this.isModified('path')) {
      const children = await this.constructor.find({ parent: this._id });
      for (const child of children) {
        await child.save(); // This will trigger the pre-save middleware to update paths
      }
    }
  } catch (error) {
    console.error('Error updating children paths:', error);
  }
});

// Method to get all descendants
categorySchema.methods.getDescendants = function() {
  return this.constructor.find({
    path: { $regex: `^${this.path}/` }
  }).sort({ level: 1, sortOrder: 1 });
};

// Method to get all ancestors
categorySchema.methods.getAncestors = async function() {
  const pathIds = this.path.split('/').slice(0, -1); // Remove self
  return this.constructor.find({
    _id: { $in: pathIds }
  }).sort({ level: 1 });
};

// Method to check if category has children
categorySchema.methods.hasChildren = async function() {
  const count = await this.constructor.countDocuments({ parent: this._id });
  return count > 0;
};

// Method to update statistics
categorySchema.methods.updateStatistics = async function() {
  const Product = mongoose.model('Product');
  const Auction = mongoose.model('Auction');
  
  // Get all descendant category IDs
  const descendants = await this.getDescendants();
  const categoryIds = [this._id, ...descendants.map(cat => cat._id)];

  // Count products and auctions
  const productCount = await Product.countDocuments({
    category: { $in: categoryIds },
    status: 'active',
    isActive: true
  });

  const auctionCount = await Auction.countDocuments({
    category: { $in: categoryIds },
    status: 'active',
    isActive: true
  });

  this.statistics.productCount = productCount;
  this.statistics.auctionCount = auctionCount;
  
  return this.save();
};

// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({
    parent: null,
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {
  return this.find({
    isActive: true
  }).sort({ level: 1, sortOrder: 1, name: 1 });
};

// Static method to find by slug
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Static method to search categories
categorySchema.statics.searchCategories = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { slug: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ level: 1, sortOrder: 1 });
};

// Static method to get popular categories
categorySchema.statics.getPopularCategories = function(limit = 10) {
  return this.find({
    isActive: true,
    'statistics.productCount': { $gt: 0 }
  })
  .sort({ 'statistics.productCount': -1 })
  .limit(limit);
};

// Static method to create category hierarchy
categorySchema.statics.createHierarchy = async function(categories) {
  const createdCategories = [];
  
  for (const categoryData of categories) {
    const category = new this(categoryData);
    await category.save();
    createdCategories.push(category);
  }
  
  return createdCategories;
};

export default mongoose.model('Category', categorySchema);
