/**
 * Retail API Client
 * Provides methods to interact with the retail API endpoints
 */

import { apiClient } from './api';

export interface RetailProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  stocks?: number;
  condition: string;
  category: string;
  brand?: string;
  model?: string;
  sku?: string;
  authenticity?: string;
  tags?: string[];
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
    _id?: string;
    id?: string;
  }>;
  primaryImage?: {
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
    _id?: string;
    id?: string;
  };
  viewCount: number;
  createdAt: string;
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    fullName?: string;
    isLocked?: boolean;
    id?: string;
    stats?: {
      rating: number;
      reviewCount: number;
    };
  };
  discountedPrice?: number;
  auctionStatus?: any;
  id?: string;
}

export interface RetailProductsResponse {
  products: RetailProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: {
    categories: string[];
    conditions: string[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface RetailProductResponse {
  success: boolean;
  message: string;
  data: {
    product: RetailProduct;
    relatedProducts: RetailProduct[];
  };
}

export interface RetailDashboardStats {
  success: boolean;
  message: string;
  data: {
    overview: {
      totalRetailProducts: number;
      userRetailProducts: number;
      totalValue: number;
      averagePrice: number;
      minPrice: number;
      maxPrice: number;
    };
    byCategory: Array<{
      _id: string;
      count: number;
      totalValue: number;
      averagePrice: number;
    }>;
    topCategories: Array<{
      _id: string;
      productCount: number;
      totalViews: number;
      averagePrice: number;
    }>;
    priceDistribution: Array<{
      _id: number;
      count: number;
      averagePrice: number;
    }>;
    recentProducts: RetailProduct[];
  };
}

export interface RetailAnalytics {
  success: boolean;
  message: string;
  data: {
    overview: {
      totalProducts: number;
      activeProducts: number;
      totalViews: number;
      averagePrice: number;
      totalValue: number;
      averageDiscount: number;
    };
    byStatus: Array<{
      _id: string;
      count: number;
    }>;
    byCategory: Array<{
      _id: string;
      count: number;
      totalViews: number;
      averagePrice: number;
    }>;
    monthlyTrend: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
    }>;
  };
}

export interface RetailProductsFilters {
  page?: number;
  limit?: number;
  category?: string;
  condition?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest' | 'oldest' | 'name_asc' | 'name_desc';
}

class RetailApiClient {
  private baseUrl = '/retail';

  /**
   * Get retail products with filtering and pagination
   */
  async getProducts(filters: RetailProductsFilters = {}): Promise<RetailProductsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}/products${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  /**
   * Get featured retail products
   */
  async getFeaturedProducts(limit: number = 8): Promise<RetailProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/featured?limit=${limit}`);
  }

  /**
   * Get popular retail products
   */
  async getPopularProducts(limit: number = 8): Promise<RetailProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/popular?limit=${limit}`);
  }

  /**
   * Get retail products on sale
   */
  async getProductsOnSale(page: number = 1, limit: number = 12): Promise<RetailProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/sale?page=${page}&limit=${limit}`);
  }

  /**
   * Get retail products by category
   */
  async getProductsByCategory(
    category: string, 
    page: number = 1, 
    limit: number = 12
  ): Promise<RetailProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`);
  }

  /**
   * Search retail products
   */
  async searchProducts(
    query: string, 
    page: number = 1, 
    limit: number = 12
  ): Promise<RetailProductsResponse> {
    const encodedQuery = encodeURIComponent(query);
    return apiClient.get(`${this.baseUrl}/products/search?q=${encodedQuery}&page=${page}&limit=${limit}`);
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(limit: number = 8): Promise<RetailProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/recommendations?limit=${limit}`);
  }

  /**
   * Get retail product details
   */
  async getProduct(productId: string): Promise<RetailProductResponse> {
    return apiClient.get(`${this.baseUrl}/products/${productId}`);
  }

  /**
   * Get retail dashboard statistics (requires authentication)
   */
  async getDashboardStats(): Promise<RetailDashboardStats> {
    return apiClient.get(`${this.baseUrl}/dashboard/stats`);
  }

  /**
   * Get retail analytics (requires authentication)
   */
  async getAnalytics(): Promise<RetailAnalytics> {
    return apiClient.get(`${this.baseUrl}/analytics`);
  }

  /**
   * Get admin dashboard statistics (requires admin authentication)
   */
  async getAdminDashboardStats(): Promise<RetailDashboardStats> {
    return apiClient.get(`${this.baseUrl}/admin/dashboard`);
  }
}

// Export singleton instance
export const retailApi = new RetailApiClient();

// Export individual methods for convenience
export const {
  getProducts,
  getFeaturedProducts,
  getPopularProducts,
  getProductsOnSale,
  getProductsByCategory,
  searchProducts,
  getRecommendations,
  getProduct,
  getDashboardStats,
  getAnalytics,
  getAdminDashboardStats
} = retailApi;
