# Authentication Setup Guide

This guide will help you set up the authentication system for the Royal Bid Boutique application.

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Backend Environment Variables
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/royal-bid-boutique

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRE=30d

# Bcrypt
BCRYPT_ROUNDS=12

# Frontend URL
FRONTEND_URL=http://localhost:8080

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start the Backend Server

```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

## Frontend Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Royal Bid Boutique
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Frontend Server

```bash
npm run dev
```

The frontend will be running on `http://localhost:8080`

## Features Implemented

### Authentication System
- ✅ User registration with email verification
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Token refresh mechanism
- ✅ Account lockout after failed attempts
- ✅ Password reset functionality
- ✅ Email verification system

### Frontend Integration
- ✅ Login page with form validation
- ✅ Signup page with form validation
- ✅ Authentication context and hooks
- ✅ Protected routes
- ✅ User dropdown in navbar
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

### Security Features
- ✅ Rate limiting for authentication attempts
- ✅ CORS configuration
- ✅ Input validation
- ✅ XSS protection
- ✅ SQL injection protection
- ✅ Secure password requirements

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user info
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /verify-email/:token` - Verify email
- `POST /resend-verification` - Resend verification email
- `POST /refresh-token` - Refresh JWT token

## Testing the Authentication

1. Start both backend and frontend servers
2. Navigate to `http://localhost:8080`
3. Click "Sign Up" to create a new account
4. Fill in the registration form
5. Check your email for verification (if email is configured)
6. Click "Sign In" to login
7. You should see your name in the navbar dropdown

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `ALLOWED_ORIGINS` includes your frontend URL
2. **Database Connection**: Ensure MongoDB is running and `MONGODB_URI` is correct
3. **JWT Errors**: Make sure `JWT_SECRET` is set and consistent
4. **Port Conflicts**: Check that ports 5000 and 8080 are available

### Database Setup

If you don't have MongoDB installed:

1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in your `.env` file
3. The application will create the database and collections automatically

## Next Steps

- Configure email service for verification emails
- Add social login (Google, Apple)
- Implement user profile management
- Add password strength requirements
- Set up automated testing
- Configure production environment variables
