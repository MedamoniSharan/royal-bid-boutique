# Retail API Documentation

This document provides comprehensive documentation for the Retail API endpoints in the Royal Bid Boutique platform.

## Base URL
```
http://localhost:5001/api/retail
```

## Authentication
Some endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Overview

### Public Endpoints (No Authentication Required)
- `GET /products` - Get all retail products with filtering and pagination
- `GET /products/featured` - Get featured retail products
- `GET /products/popular` - Get popular retail products (by view count)
- `GET /products/sale` - Get retail products on sale (with discount)
- `GET /products/category/:category` - Get retail products by category
- `GET /products/search` - Search retail products
- `GET /products/recommendations` - Get product recommendations
- `GET /products/:id` - Get specific retail product details

### Protected Endpoints (Authentication Required)
- `GET /dashboard/stats` - Get retail dashboard statistics
- `GET /analytics` - Get retail analytics for authenticated user

### Admin Endpoints (Admin Authorization Required)
- `GET /admin/dashboard` - Get admin retail dashboard statistics

---

## Detailed Endpoint Documentation

### 1. Get Retail Products
**Endpoint:** `GET /products`

**Description:** Retrieve all retail products with advanced filtering, sorting, and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `condition` (optional): Filter by condition
- `brand` (optional): Filter by brand (case-insensitive)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Search in title, description, brand, model, tags
- `sort` (optional): Sort option

**Sort Options:**
- `price_asc` - Price ascending
- `price_desc` - Price descending
- `popular` - By view count
- `newest` - By creation date (newest first)
- `oldest` - By creation date (oldest first)
- `name_asc` - By title (A-Z)
- `name_desc` - By title (Z-A)

**Example Request:**
```bash
GET /api/retail/products?category=Electronics&minPrice=100&maxPrice=500&sort=price_asc&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Retail products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "product_id",
        "title": "Product Title",
        "description": "Product description",
        "price": 299.99,
        "discount": 15,
        "condition": "New",
        "category": "Electronics",
        "brand": "BrandName",
        "model": "ModelName",
        "images": [...],
        "viewCount": 150,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "seller": {
          "_id": "seller_id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatar": "avatar_url"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    },
    "filters": {
      "categories": ["Electronics", "Watches"],
      "conditions": ["New", "Like New"],
      "brands": ["Brand1", "Brand2"],
      "priceRange": {
        "min": 50,
        "max": 1000
      }
    }
  }
}
```

### 2. Get Featured Retail Products
**Endpoint:** `GET /products/featured`

**Description:** Retrieve featured retail products.

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 8, max: 50)

**Example Request:**
```bash
GET /api/retail/products/featured?limit=5
```

### 3. Get Popular Retail Products
**Endpoint:** `GET /products/popular`

**Description:** Retrieve popular retail products sorted by view count.

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 8, max: 50)

### 4. Get Products on Sale
**Endpoint:** `GET /products/sale`

**Description:** Retrieve retail products that have discounts applied.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

### 5. Get Products by Category
**Endpoint:** `GET /products/category/:category`

**Description:** Retrieve retail products filtered by specific category.

**Path Parameters:**
- `category`: Category name (e.g., "Electronics", "Watches", "Art")

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Example Request:**
```bash
GET /api/retail/products/category/Electronics?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Retail products by category retrieved successfully",
  "data": {
    "products": [...],
    "category": "Electronics",
    "stats": {
      "totalProducts": 25,
      "averagePrice": 299.99,
      "minPrice": 50.00,
      "maxPrice": 999.99,
      "totalViews": 1500
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 6. Search Retail Products
**Endpoint:** `GET /products/search`

**Description:** Search retail products by query string.

**Query Parameters:**
- `q` (required): Search query (min: 2 characters, max: 100 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Example Request:**
```bash
GET /api/retail/products/search?q=smartphone&page=1&limit=10
```

### 7. Get Product Recommendations
**Endpoint:** `GET /products/recommendations`

**Description:** Get personalized product recommendations based on user preferences.

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 8, max: 50)

**Note:** If user is not authenticated, returns popular products.

### 8. Get Retail Product Details
**Endpoint:** `GET /products/:id`

**Description:** Get detailed information about a specific retail product.

**Path Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "success": true,
  "message": "Retail product retrieved successfully",
  "data": {
    "product": {
      "_id": "product_id",
      "title": "Product Title",
      "description": "Detailed product description",
      "price": 299.99,
      "discount": 15,
      "condition": "New",
      "category": "Electronics",
      "brand": "BrandName",
      "model": "ModelName",
      "sku": "PRD-ABC123",
      "authenticity": "authentic",
      "tags": ["tag1", "tag2"],
      "images": [...],
      "viewCount": 150,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "seller": {
        "_id": "seller_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "avatar": "avatar_url",
        "stats": {
          "rating": 4.5,
          "reviewCount": 25
        }
      }
    },
    "relatedProducts": [...]
  }
}
```

### 9. Get Retail Dashboard Statistics
**Endpoint:** `GET /dashboard/stats`

**Description:** Get comprehensive retail dashboard statistics (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Retail dashboard stats retrieved successfully",
  "data": {
    "overview": {
      "totalRetailProducts": 150,
      "userRetailProducts": 5,
      "totalValue": 45000.00,
      "averagePrice": 300.00,
      "minPrice": 25.00,
      "maxPrice": 2500.00
    },
    "byCategory": [
      {
        "_id": "Electronics",
        "count": 45,
        "totalValue": 15000.00,
        "averagePrice": 333.33
      }
    ],
    "topCategories": [
      {
        "_id": "Electronics",
        "productCount": 45,
        "totalViews": 1200,
        "averagePrice": 333.33
      }
    ],
    "priceDistribution": [
      {
        "_id": 0,
        "count": 25,
        "averagePrice": 35.50
      }
    ],
    "recentProducts": [...]
  }
}
```

### 10. Get Retail Analytics
**Endpoint:** `GET /analytics`

**Description:** Get detailed analytics for the authenticated user's retail products.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Retail analytics retrieved successfully",
  "data": {
    "overview": {
      "totalProducts": 10,
      "activeProducts": 8,
      "totalViews": 500,
      "averagePrice": 250.00,
      "totalValue": 2500.00,
      "averageDiscount": 12.5
    },
    "byStatus": [
      {
        "_id": "active",
        "count": 8
      },
      {
        "_id": "inactive",
        "count": 2
      }
    ],
    "byCategory": [
      {
        "_id": "Electronics",
        "count": 5,
        "totalViews": 300,
        "averagePrice": 300.00
      }
    ],
    "monthlyTrend": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "count": 3
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Models

### Product Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  price: Number,
  stocks: Number,
  discount: Number,
  condition: String,
  auctionType: "Retail",
  brand: String,
  model: String,
  sku: String,
  authenticity: String,
  tags: [String],
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean,
    order: Number
  }],
  status: String,
  isFeatured: Boolean,
  viewCount: Number,
  isActive: Boolean,
  seller: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Seller Model (Populated)
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  avatar: String,
  stats: {
    rating: Number,
    reviewCount: Number
  }
}
```

---

## Testing

Use the provided test script to verify API functionality:

```bash
cd backend
node test-retail-api.js
```

Make sure the server is running before executing tests:
```bash
npm run dev
```

---

## Rate Limiting

All endpoints are subject to rate limiting:
- 100 requests per 15 minutes per IP address
- Additional limits may apply to authenticated endpoints

---

## CORS

The API supports CORS for the following origins:
- `http://localhost:8080`
- `http://localhost:3000`
- `http://localhost:5173`

Additional origins can be configured via the `ALLOWED_ORIGINS` environment variable.
