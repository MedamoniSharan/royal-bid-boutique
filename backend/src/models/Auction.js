import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Auction title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Auction description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price cannot be negative']
  },
  reservePrice: {
    type: Number,
    min: [0, 'Reserve price cannot be negative']
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.startingPrice;
    },
    min: [0, 'Current price cannot be negative']
  },
  buyNowPrice: {
    type: Number,
    min: [0, 'Buy now price cannot be negative']
  },
  minBidIncrement: {
    type: Number,
    default: 1,
    min: [0.01, 'Minimum bid increment must be at least 0.01']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled', 'sold'],
    default: 'draft'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  location: {
    city: String,
    state: String,
    country: String,
    isLocalPickup: {
      type: Boolean,
      default: false
    }
  },
  shipping: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedDays: {
      type: Number,
      min: 1
    },
    restrictions: [String]
  },
  payment: {
    acceptedMethods: [{
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto']
    }],
    requiredDeposit: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  terms: {
    returnPolicy: String,
    warranty: String,
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      required: true
    },
    authenticity: {
      type: String,
      enum: ['authentic', 'replica', 'unknown'],
      default: 'unknown'
    }
  },
  statistics: {
    totalBids: {
      type: Number,
      default: 0
    },
    uniqueBidders: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    watchers: {
      type: Number,
      default: 0
    }
  },
  autoExtend: {
    enabled: {
      type: Boolean,
      default: true
    },
    timeInSeconds: {
      type: Number,
      default: 300 // 5 minutes
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  promoted: {
    type: Boolean,
    default: false
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time remaining
auctionSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const remaining = this.endTime - now;
  return remaining > 0 ? remaining : 0;
});

// Virtual for is ending soon (last 5 minutes)
auctionSchema.virtual('isEndingSoon').get(function() {
  return this.timeRemaining > 0 && this.timeRemaining <= 300000; // 5 minutes
});

// Virtual for has ended
auctionSchema.virtual('hasEnded').get(function() {
  return new Date() > this.endTime;
});

// Virtual for highest bidder
auctionSchema.virtual('highestBidder', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'auction',
  justOne: true,
  options: { sort: { amount: -1 } }
});

// Indexes for better performance
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ startTime: 1, endTime: 1 });
auctionSchema.index({ featured: 1, promoted: 1 });
auctionSchema.index({ 'statistics.views': -1 });
auctionSchema.index({ currentPrice: -1 });

// Text search index
auctionSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Pre-save middleware to update current price
auctionSchema.pre('save', function(next) {
  if (this.isModified('startingPrice') && !this.isModified('currentPrice')) {
    this.currentPrice = this.startingPrice;
  }
  next();
});

// Method to check if auction is active
auctionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startTime && now <= this.endTime;
};

// Method to check if auction can receive bids
auctionSchema.methods.canReceiveBids = function() {
  return this.isActive() && this.status === 'active';
};

// Method to update statistics
auctionSchema.methods.updateStats = async function() {
  const Bid = mongoose.model('Bid');
  const stats = await Bid.aggregate([
    { $match: { auction: this._id } },
    {
      $group: {
        _id: null,
        totalBids: { $sum: 1 },
        uniqueBidders: { $addToSet: '$bidder' },
        highestBid: { $max: '$amount' }
      }
    }
  ]);

  if (stats.length > 0) {
    this.statistics.totalBids = stats[0].totalBids;
    this.statistics.uniqueBidders = stats[0].uniqueBidders.length;
    if (stats[0].highestBid) {
      this.currentPrice = stats[0].highestBid;
    }
  }

  return this.save();
};

// Method to extend auction time
auctionSchema.methods.extendTime = function(seconds = 300) {
  if (this.status === 'active' && this.autoExtend.enabled) {
    this.endTime = new Date(this.endTime.getTime() + (seconds * 1000));
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to end auction
auctionSchema.methods.endAuction = function() {
  this.status = 'ended';
  return this.save();
};

// Static method to find active auctions
auctionSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gt: now }
  });
};

// Static method to find ending soon auctions
auctionSchema.statics.findEndingSoon = function(minutes = 5) {
  const now = new Date();
  const endThreshold = new Date(now.getTime() + (minutes * 60 * 1000));
  
  return this.find({
    status: 'active',
    endTime: { $lte: endThreshold, $gt: now }
  });
};

// Static method to find featured auctions
auctionSchema.statics.findFeatured = function() {
  return this.find({
    featured: true,
    status: 'active',
    isActive: true
  }).sort({ createdAt: -1 });
};

export default mongoose.model('Auction', auctionSchema);
