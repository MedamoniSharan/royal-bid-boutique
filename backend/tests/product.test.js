import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

describe('Product API', () => {
  let authToken;
  let testUser;
  let testProduct;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'seller'
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/products', () => {
    it('should create a retail product successfully', async () => {
      const productData = {
        title: 'Test Product',
        description: 'This is a test product description',
        category: 'Electronics',
        price: 299.99,
        stocks: 10,
        discount: 5,
        condition: 'New',
        auctionType: 'Retail',
        brand: 'TestBrand',
        model: 'TestModel',
        tags: ['test', 'electronics'],
        images: [
          {
            url: 'https://example.com/image1.jpg',
            alt: 'Product image 1',
            isPrimary: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toBeDefined();
      expect(response.body.data.product.title).toBe(productData.title);
      expect(response.body.data.product.auctionType).toBe('Retail');
      expect(response.body.data.product.seller).toBeDefined();

      testProduct = response.body.data.product;
    });

    it('should create an auction product successfully', async () => {
      const auctionData = {
        title: 'Auction Product',
        description: 'This is a test auction product',
        category: 'Art',
        price: 1000,
        stocks: 1,
        condition: 'Excellent',
        auctionType: 'Auction',
        startingBid: 500,
        auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        brand: 'ArtBrand',
        tags: ['art', 'auction'],
        images: [
          {
            url: 'https://example.com/art1.jpg',
            alt: 'Art piece',
            isPrimary: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(auctionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.auctionType).toBe('Auction');
      expect(response.body.data.product.startingBid).toBe(500);
      expect(response.body.data.product.auctionEndDate).toBeDefined();
    });

    it('should create an anti-piece product successfully', async () => {
      const antiPieceData = {
        title: 'Antique Vase',
        description: 'Beautiful antique vase from the 18th century',
        category: 'Antiques',
        price: 2500,
        stocks: 1,
        condition: 'Good',
        auctionType: 'Anti-Piece',
        authenticity: 'authentic',
        tags: ['antique', 'vase', '18th century'],
        images: [
          {
            url: 'https://example.com/vase1.jpg',
            alt: 'Antique vase',
            isPrimary: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(antiPieceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.auctionType).toBe('Anti-Piece');
      expect(response.body.data.product.authenticity).toBe('authentic');
    });

    it('should fail to create auction product without starting bid', async () => {
      const invalidAuctionData = {
        title: 'Invalid Auction',
        description: 'This auction is missing starting bid',
        category: 'Electronics',
        price: 100,
        stocks: 1,
        condition: 'New',
        auctionType: 'Auction',
        auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAuctionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Starting bid is required');
    });

    it('should fail to create auction product without end date', async () => {
      const invalidAuctionData = {
        title: 'Invalid Auction',
        description: 'This auction is missing end date',
        category: 'Electronics',
        price: 100,
        stocks: 1,
        condition: 'New',
        auctionType: 'Auction',
        startingBid: 50
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAuctionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Auction end date is required');
    });

    it('should fail to create auction product with past end date', async () => {
      const invalidAuctionData = {
        title: 'Invalid Auction',
        description: 'This auction has past end date',
        category: 'Electronics',
        price: 100,
        stocks: 1,
        condition: 'New',
        auctionType: 'Auction',
        startingBid: 50,
        auctionEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAuctionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Auction end date must be in the future');
    });

    it('should fail to create product without required fields', async () => {
      const invalidData = {
        title: 'Incomplete Product'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail to create product without authentication', async () => {
      const productData = {
        title: 'Unauthorized Product',
        description: 'This should fail',
        category: 'Electronics',
        price: 100,
        stocks: 1,
        condition: 'New',
        auctionType: 'Retail'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });

    it('should filter products by auction type', async () => {
      const response = await request(app)
        .get('/api/products?auctionType=Auction')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=1000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a specific product', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toBeDefined();
      expect(response.body.data.product._id).toBe(testProduct._id);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Product not found');
    });
  });

  describe('GET /api/products/featured', () => {
    it('should get featured products', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });
  });

  describe('GET /api/products/popular', () => {
    it('should get popular products', async () => {
      const response = await request(app)
        .get('/api/products/popular')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });
  });

  describe('GET /api/products/search', () => {
    it('should search products by query', async () => {
      const response = await request(app)
        .get('/api/products/search?q=test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(response.body.data.query).toBe('test');
    });

    it('should search products with filters', async () => {
      const response = await request(app)
        .get('/api/products/search?q=test&category=Electronics&auctionType=Retail')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(response.body.data.filters).toBeDefined();
    });
  });
});
