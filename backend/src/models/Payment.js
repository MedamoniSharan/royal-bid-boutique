import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: [true, 'Auction is required']
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: [true, 'Bid is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be at least 0.01']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'wallet'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  externalTransactionId: String,
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'internal'],
    required: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  fees: {
    processing: {
      type: Number,
      default: 0
    },
    platform: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  breakdown: {
    itemAmount: Number,
    tax: Number,
    shipping: Number,
    insurance: Number,
    other: Number
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    cardExpMonth: Number,
    cardExpYear: Number,
    bankName: String,
    accountType: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  processedAt: Date,
  failedAt: Date,
  failureReason: String,
  refundedAt: Date,
  refundAmount: Number,
  refundReason: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount including fees
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.fees.total || 0);
});

// Virtual for is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Virtual for is pending
paymentSchema.virtual('isPending').get(function() {
  return ['pending', 'processing'].includes(this.status);
});

// Virtual for can be refunded
paymentSchema.virtual('canBeRefunded').get(function() {
  return this.status === 'completed' && !this.refundedAt;
});

// Indexes for better performance
paymentSchema.index({ user: 1 });
paymentSchema.index({ auction: 1 });
paymentSchema.index({ bid: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ externalTransactionId: 1 });
paymentSchema.index({ gateway: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ processedAt: -1 });

// Pre-save middleware to generate transaction ID
paymentSchema.pre('save', function(next) {
  if (!this.transactionId && this.isNew) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionId = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Method to process payment
paymentSchema.methods.processPayment = async function(paymentData) {
  try {
    this.status = 'processing';
    this.gatewayResponse = paymentData;
    
    // Simulate payment processing based on gateway
    switch (this.gateway) {
      case 'stripe':
        await this.processStripePayment(paymentData);
        break;
      case 'paypal':
        await this.processPayPalPayment(paymentData);
        break;
      case 'internal':
        await this.processInternalPayment(paymentData);
        break;
      default:
        throw new Error('Unsupported payment gateway');
    }
    
    this.processedAt = new Date();
    return this.save();
  } catch (error) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.failureReason = error.message;
    await this.save();
    throw error;
  }
};

// Method to process Stripe payment
paymentSchema.methods.processStripePayment = async function(paymentData) {
  // This would integrate with Stripe API
  // For now, simulate success
  this.status = 'completed';
  this.externalTransactionId = paymentData.id || `stripe_${Date.now()}`;
};

// Method to process PayPal payment
paymentSchema.methods.processPayPalPayment = async function(paymentData) {
  // This would integrate with PayPal API
  // For now, simulate success
  this.status = 'completed';
  this.externalTransactionId = paymentData.id || `paypal_${Date.now()}`;
};

// Method to process internal payment (wallet)
paymentSchema.methods.processInternalPayment = async function(paymentData) {
  const User = mongoose.model('User');
  const user = await User.findById(this.user);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.wallet.balance < this.totalAmount) {
    throw new Error('Insufficient wallet balance');
  }
  
  // Deduct from wallet
  user.wallet.balance -= this.totalAmount;
  await user.save();
  
  this.status = 'completed';
  this.externalTransactionId = `internal_${Date.now()}`;
};

// Method to refund payment
paymentSchema.methods.refundPayment = async function(amount, reason) {
  if (!this.canBeRefunded) {
    throw new Error('Payment cannot be refunded');
  }
  
  const refundAmount = amount || this.amount;
  
  if (refundAmount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  try {
    // Process refund based on gateway
    switch (this.gateway) {
      case 'stripe':
        await this.processStripeRefund(refundAmount);
        break;
      case 'paypal':
        await this.processPayPalRefund(refundAmount);
        break;
      case 'internal':
        await this.processInternalRefund(refundAmount);
        break;
      default:
        throw new Error('Unsupported payment gateway for refund');
    }
    
    this.status = 'refunded';
    this.refundedAt = new Date();
    this.refundAmount = refundAmount;
    this.refundReason = reason;
    
    return this.save();
  } catch (error) {
    throw new Error(`Refund failed: ${error.message}`);
  }
};

// Method to process Stripe refund
paymentSchema.methods.processStripeRefund = async function(amount) {
  // This would integrate with Stripe API
  // For now, simulate success
  console.log(`Processing Stripe refund of $${amount} for transaction ${this.externalTransactionId}`);
};

// Method to process PayPal refund
paymentSchema.methods.processPayPalRefund = async function(amount) {
  // This would integrate with PayPal API
  // For now, simulate success
  console.log(`Processing PayPal refund of $${amount} for transaction ${this.externalTransactionId}`);
};

// Method to process internal refund
paymentSchema.methods.processInternalRefund = async function(amount) {
  const User = mongoose.model('User');
  const user = await User.findById(this.user);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Add back to wallet
  user.wallet.balance += amount;
  await user.save();
};

// Static method to get user payments
paymentSchema.statics.getUserPayments = function(userId, limit = 20) {
  return this.find({ user: userId })
    .populate('auction', 'title currentPrice')
    .populate('bid', 'amount bidTime')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get auction payments
paymentSchema.statics.getAuctionPayments = function(auctionId) {
  return this.find({ auction: auctionId })
    .populate('user', 'firstName lastName email')
    .populate('bid', 'amount bidTime')
    .sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

export default mongoose.model('Payment', paymentSchema);
