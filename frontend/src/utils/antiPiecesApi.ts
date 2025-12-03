/**
 * Anti-Pieces API Client
 * Provides methods to interact with the anti-pieces API endpoints
 */

import { apiClient } from './api';

export interface AntiPiecesProduct {
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
  age?: string;
  auctionStatus?: string;
  id?: string;
}

export interface AntiPiecesProductsResponse {
  products: AntiPiecesProduct[];
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

export interface AntiPiecesProductResponse {
  success: boolean;
  message: string;
  data: {
    product: AntiPiecesProduct;
    relatedProducts: AntiPiecesProduct[];
  };
}

export interface AntiPiecesDashboardStats {
  success: boolean;
  message: string;
  data: {
    overview: {
      totalAntiPiecesProducts: number;
      userAntiPiecesProducts: number;
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
    recentProducts: AntiPiecesProduct[];
    vintageItems: AntiPiecesProduct[];
  };
}

export interface AntiPiecesProductsFilters {
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

class AntiPiecesApiClient {
  private baseUrl = '/anti-pieces';

  /**
   * Get anti-pieces products with filtering and pagination
   */
  async getProducts(filters: AntiPiecesProductsFilters = {}): Promise<AntiPiecesProductsResponse> {
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
   * Get featured anti-pieces products
   */
  async getFeaturedProducts(limit: number = 8): Promise<AntiPiecesProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/featured?limit=${limit}`);
  }

  /**
   * Get popular anti-pieces products
   */
  async getPopularProducts(limit: number = 8): Promise<AntiPiecesProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/popular?limit=${limit}`);
  }

  /**
   * Get anti-pieces products by category
   */
  async getProductsByCategory(category: string, page: number = 1, limit: number = 12): Promise<AntiPiecesProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/category/${category}?page=${page}&limit=${limit}`);
  }

  /**
   * Search anti-pieces products
   */
  async searchProducts(query: string, page: number = 1, limit: number = 12): Promise<AntiPiecesProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  /**
   * Get anti-pieces product details
   */
  async getProduct(productId: string): Promise<AntiPiecesProductResponse> {
    return apiClient.get(`${this.baseUrl}/products/${productId}`);
  }

  /**
   * Get anti-pieces dashboard statistics (requires authentication)
   */
  async getDashboardStats(): Promise<AntiPiecesDashboardStats> {
    return apiClient.get(`${this.baseUrl}/dashboard/stats`);
  }

  /**
   * Update an anti-pieces product (requires authentication and ownership)
   */
  async updateProduct(productId: string, productData: Partial<AntiPiecesProduct>): Promise<AntiPiecesProductResponse> {
    return apiClient.put(`${this.baseUrl}/products/${productId}`, productData);
  }

  /**
   * Delete an anti-pieces product (requires authentication and ownership)
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.baseUrl}/products/${productId}`);
  }
}

// Create and export a singleton instance
export const antiPiecesApi = new AntiPiecesApiClient();
