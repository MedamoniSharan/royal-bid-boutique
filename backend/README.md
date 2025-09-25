# Royal Bid Boutique - Backend API

A comprehensive Node.js backend API for the Royal Bid Boutique auction platform built with Express.js, MongoDB, and modern web technologies.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Auction Management** - Create, manage, and monitor auctions with real-time updates
- **Bidding System** - Advanced bidding with proxy bidding and automatic extensions
- **Payment Processing** - Multiple payment gateways (Stripe, PayPal, etc.)
- **Real-time Notifications** - Socket.io integration for live updates
- **Image Upload** - Cloudinary integration for image management
- **Email System** - Automated email notifications and templates
- **Admin Dashboard** - Comprehensive admin panel with analytics
- **Security** - Rate limiting, input validation, and security middleware
- **API Documentation** - Well-documented RESTful API endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Redis (for caching and sessions)
- Cloudinary account (for image uploads)
- Email service (SMTP configuration)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd royal-bid-boutique/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   HOST=localhost
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/royal-bid-boutique
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── logs/                # Application logs
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md           # This file
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/auctions` - Get user's auctions
- `GET /api/users/:id/bids` - Get user's bids

### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get auction by ID
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction
- `GET /api/auctions/:id/bids` - Get auction bids
- `GET /api/auctions/featured` - Get featured auctions

### Bids
- `GET /api/bids` - Get all bids
- `GET /api/bids/:id` - Get bid by ID
- `POST /api/bids` - Create bid
- `PUT /api/bids/:id` - Update bid
- `DELETE /api/bids/:id` - Delete bid
- `GET /api/bids/auction/:auctionId` - Get auction bids

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment
- `POST /api/payments/:id/process` - Process payment
- `POST /api/payments/:id/refund` - Refund payment

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/auctions` - Get all auctions
- `GET /api/admin/reports` - Get all reports

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- Personal information (name, email, phone)
- Authentication data
- Preferences and settings
- Wallet and statistics

### Auction
- Auction details (title, description, images)
- Pricing (starting, reserve, buy-now)
- Timing (start, end, auto-extend)
- Status and statistics

### Bid
- Bid amount and timing
- Proxy bidding support
- Bidder information
- Status tracking

### Product
- Product information
- Images and specifications
- Category and condition
- Estimated value

### Category
- Hierarchical categories
- SEO metadata
- Statistics

### Payment
- Payment details
- Gateway integration
- Status tracking
- Refund support

## 🛡️ Security Features

- **Rate Limiting** - Prevent abuse with configurable limits
- **Input Validation** - Comprehensive validation using express-validator
- **SQL Injection Protection** - MongoDB sanitization
- **XSS Protection** - Input sanitization
- **CORS Configuration** - Controlled cross-origin requests
- **Helmet.js** - Security headers
- **JWT Security** - Secure token handling

## 📧 Email System

The system includes automated email notifications for:
- User registration and verification
- Password reset
- Bid notifications
- Auction ending alerts
- Payment confirmations
- Auction won notifications

## 🖼️ Image Upload

Images are uploaded to Cloudinary with:
- Automatic optimization
- Multiple size variants
- Secure URLs
- CDN delivery

## 🔄 Real-time Features

Socket.io integration provides real-time updates for:
- New bids
- Auction status changes
- Time remaining updates
- Winner notifications

## 📈 Monitoring & Logging

- Comprehensive logging system
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production

Ensure these environment variables are set in production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
REDIS_URL=redis://your-redis-instance
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
STRIPE_SECRET_KEY=sk_live_your-stripe-key
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
```

### Docker Deployment

```bash
# Build Docker image
docker build -t royal-bid-boutique-backend .

# Run container
docker run -p 5000:5000 --env-file .env royal-bid-boutique-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@royalbidboutique.com or create an issue in the repository.

## 🔗 Related Projects

- [Frontend Application](../frontend/) - React frontend application
- [Mobile App](../mobile/) - React Native mobile application
- [Admin Dashboard](../admin/) - Admin dashboard application
