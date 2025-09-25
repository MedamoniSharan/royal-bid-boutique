// MongoDB initialization script
db = db.getSiblingDB('royal-bid-boutique');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        firstName: { bsonType: 'string', minLength: 2, maxLength: 50 },
        lastName: { bsonType: 'string', minLength: 2, maxLength: 50 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        password: { bsonType: 'string', minLength: 6 },
        role: { enum: ['user', 'seller', 'admin'] },
        isActive: { bsonType: 'bool' },
        isVerified: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('auctions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'seller', 'category', 'product', 'startingPrice', 'endTime'],
      properties: {
        title: { bsonType: 'string', minLength: 5, maxLength: 200 },
        description: { bsonType: 'string', minLength: 10, maxLength: 2000 },
        startingPrice: { bsonType: 'number', minimum: 0.01 },
        currentPrice: { bsonType: 'number', minimum: 0 },
        status: { enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled', 'sold'] },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('bids', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['auction', 'bidder', 'amount'],
      properties: {
        amount: { bsonType: 'number', minimum: 0.01 },
        status: { enum: ['active', 'outbid', 'winning', 'won', 'lost', 'cancelled'] },
        isProxyBid: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'description', 'category', 'condition'],
      properties: {
        name: { bsonType: 'string', minLength: 2, maxLength: 200 },
        description: { bsonType: 'string', minLength: 10, maxLength: 2000 },
        condition: { enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
        authenticity: { enum: ['authentic', 'replica', 'unknown'] },
        status: { enum: ['active', 'inactive', 'archived', 'pending_review'] },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { bsonType: 'string', minLength: 2, maxLength: 100 },
        slug: { bsonType: 'string', pattern: '^[a-z0-9-]+$' },
        level: { bsonType: 'number', minimum: 0, maximum: 3 },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('payments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user', 'auction', 'bid', 'amount', 'paymentMethod', 'gateway'],
      properties: {
        amount: { bsonType: 'number', minimum: 0.01 },
        currency: { bsonType: 'string', pattern: '^[A-Z]{3}$' },
        paymentMethod: { enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'wallet'] },
        gateway: { enum: ['stripe', 'paypal', 'square', 'internal'] },
        status: { enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'] }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.auctions.createIndex({ status: 1, endTime: 1 });
db.auctions.createIndex({ seller: 1 });
db.auctions.createIndex({ category: 1 });
db.auctions.createIndex({ startTime: 1, endTime: 1 });
db.auctions.createIndex({ featured: 1, promoted: 1 });
db.auctions.createIndex({ 'statistics.views': -1 });
db.auctions.createIndex({ currentPrice: -1 });
db.auctions.createIndex({ title: 'text', description: 'text', tags: 'text' });

db.bids.createIndex({ auction: 1, amount: -1 });
db.bids.createIndex({ bidder: 1 });
db.bids.createIndex({ bidTime: -1 });
db.bids.createIndex({ status: 1 });
db.bids.createIndex({ auction: 1, bidder: 1 });
db.bids.createIndex({ auction: 1, amount: -1, bidTime: 1 });

db.products.createIndex({ name: 'text', description: 'text', tags: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ condition: 1 });
db.products.createIndex({ status: 1, isActive: 1 });
db.products.createIndex({ isFeatured: 1 });
db.products.createIndex({ viewCount: -1 });
db.products.createIndex({ createdAt: -1 });

db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parent: 1 });
db.categories.createIndex({ level: 1 });
db.categories.createIndex({ isActive: 1 });
db.categories.createIndex({ sortOrder: 1 });
db.categories.createIndex({ name: 'text', description: 'text' });

db.payments.createIndex({ user: 1 });
db.payments.createIndex({ auction: 1 });
db.payments.createIndex({ bid: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
db.payments.createIndex({ externalTransactionId: 1 });
db.payments.createIndex({ gateway: 1 });
db.payments.createIndex({ createdAt: -1 });
db.payments.createIndex({ processedAt: -1 });

// Insert sample data
db.categories.insertMany([
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    level: 0,
    path: 'electronics',
    isActive: true,
    sortOrder: 1,
    statistics: { productCount: 0, auctionCount: 0 }
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing and accessories',
    level: 0,
    path: 'fashion',
    isActive: true,
    sortOrder: 2,
    statistics: { productCount: 0, auctionCount: 0 }
  },
  {
    name: 'Art & Collectibles',
    slug: 'art-collectibles',
    description: 'Artwork and collectible items',
    level: 0,
    path: 'art-collectibles',
    isActive: true,
    sortOrder: 3,
    statistics: { productCount: 0, auctionCount: 0 }
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Fine jewelry and watches',
    level: 0,
    path: 'jewelry',
    isActive: true,
    sortOrder: 4,
    statistics: { productCount: 0, auctionCount: 0 }
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home decor and garden items',
    level: 0,
    path: 'home-garden',
    isActive: true,
    sortOrder: 5,
    statistics: { productCount: 0, auctionCount: 0 }
  }
]);

// Create admin user
db.users.insertOne({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@royalbidboutique.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz.5K2', // password: admin123
  role: 'admin',
  isVerified: true,
  isActive: true,
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    bidAlerts: true,
    auctionEndAlerts: true
  },
  wallet: {
    balance: 0,
    currency: 'USD'
  },
  stats: {
    totalBids: 0,
    totalWins: 0,
    totalSpent: 0,
    rating: 0,
    reviewCount: 0
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialization completed successfully!');
