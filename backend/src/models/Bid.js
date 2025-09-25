import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: [true, 'Auction is required']
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bidder is required']
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0.01, 'Bid amount must be at least 0.01']
  },
  maxBid: {
    type: Number,
    min: [0.01, 'Max bid amount must be at least 0.01']
  },
  isProxyBid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'outbid', 'winning', 'won', 'lost', 'cancelled'],
    default: 'active'
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  isAutomatic: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time since bid
bidSchema.virtual('timeSinceBid').get(function() {
  return Date.now() - this.bidTime.getTime();
});

// Virtual for is recent bid (within last 5 minutes)
bidSchema.virtual('isRecent').get(function() {
  return this.timeSinceBid < 300000; // 5 minutes
});

// Indexes for better performance
bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ bidTime: -1 });
bidSchema.index({ status: 1 });
bidSchema.index({ auction: 1, bidder: 1 });

// Compound index for auction leaderboard
bidSchema.index({ auction: 1, amount: -1, bidTime: 1 });

// Pre-save middleware to validate bid amount
bidSchema.pre('save', async function(next) {
  try {
    // Get auction details
    const Auction = mongoose.model('Auction');
    const auction = await Auction.findById(this.auction);
    
    if (!auction) {
      return next(new Error('Auction not found'));
    }

    // Check if auction is active
    if (!auction.canReceiveBids()) {
      return next(new Error('Auction is not accepting bids'));
    }

    // Check minimum bid increment
    const minBidAmount = auction.currentPrice + auction.minBidIncrement;
    if (this.amount < minBidAmount) {
      return next(new Error(`Bid must be at least $${minBidAmount}`));
    }

    // Check if bidder is not the seller
    if (this.bidder.toString() === auction.seller.toString()) {
      return next(new Error('Seller cannot bid on their own auction'));
    }

    // Check reserve price if set
    if (auction.reservePrice && this.amount < auction.reservePrice) {
      return next(new Error(`Bid must meet or exceed reserve price of $${auction.reservePrice}`));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update auction and handle proxy bidding
bidSchema.post('save', async function() {
  try {
    const Auction = mongoose.model('Auction');
    const auction = await Auction.findById(this.auction);
    
    if (!auction) return;

    // Update auction current price
    if (this.amount > auction.currentPrice) {
      auction.currentPrice = this.amount;
      await auction.save();
    }

    // Handle proxy bidding logic
    if (this.isProxyBid && this.maxBid) {
      await this.handleProxyBidding();
    }

    // Update auction statistics
    await auction.updateStats();

    // Emit real-time update via Socket.IO
    if (global.io) {
      global.io.to(`auction-${this.auction}`).emit('bid-update', {
        auctionId: this.auction,
        bidId: this._id,
        amount: this.amount,
        bidder: this.bidder,
        bidTime: this.bidTime,
        isProxyBid: this.isProxyBid
      });
    }
  } catch (error) {
    console.error('Error in bid post-save middleware:', error);
  }
});

// Method to handle proxy bidding
bidSchema.methods.handleProxyBidding = async function() {
  try {
    const Bid = mongoose.model('Bid');
    const Auction = mongoose.model('Auction');
    
    // Find all other proxy bids for this auction
    const otherProxyBids = await Bid.find({
      auction: this.auction,
      bidder: { $ne: this.bidder },
      isProxyBid: true,
      status: 'active',
      maxBid: { $gt: this.amount }
    }).sort({ maxBid: -1 });

    // If there are higher proxy bids, automatically bid for them
    for (const proxyBid of otherProxyBids) {
      const nextBidAmount = Math.min(
        proxyBid.maxBid,
        this.amount + (await Auction.findById(this.auction)).minBidIncrement
      );

      if (nextBidAmount > this.amount) {
        // Create automatic bid
        const autoBid = new Bid({
          auction: this.auction,
          bidder: proxyBid.bidder,
          amount: nextBidAmount,
          maxBid: proxyBid.maxBid,
          isProxyBid: true,
          isAutomatic: true,
          status: 'active'
        });

        await autoBid.save();
        break; // Only one automatic bid per trigger
      }
    }
  } catch (error) {
    console.error('Error handling proxy bidding:', error);
  }
};

// Method to check if bid is winning
bidSchema.methods.isWinning = async function() {
  const Bid = mongoose.model('Bid');
  const highestBid = await Bid.findOne({
    auction: this.auction,
    status: 'active'
  }).sort({ amount: -1 });

  return highestBid && highestBid._id.toString() === this._id.toString();
};

// Method to cancel bid
bidSchema.methods.cancelBid = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to get auction leaderboard
bidSchema.statics.getLeaderboard = function(auctionId, limit = 10) {
  return this.find({
    auction: auctionId,
    status: 'active'
  })
  .populate('bidder', 'firstName lastName avatar')
  .sort({ amount: -1, bidTime: 1 })
  .limit(limit);
};

// Static method to get user's bids for an auction
bidSchema.statics.getUserBids = function(auctionId, userId) {
  return this.find({
    auction: auctionId,
    bidder: userId
  }).sort({ bidTime: -1 });
};

// Static method to get highest bid for auction
bidSchema.statics.getHighestBid = function(auctionId) {
  return this.findOne({
    auction: auctionId,
    status: 'active'
  }).sort({ amount: -1 });
};

// Static method to get bid history for auction
bidSchema.statics.getBidHistory = function(auctionId, limit = 50) {
  return this.find({
    auction: auctionId
  })
  .populate('bidder', 'firstName lastName avatar')
  .sort({ bidTime: -1 })
  .limit(limit);
};

export default mongoose.model('Bid', bidSchema);
