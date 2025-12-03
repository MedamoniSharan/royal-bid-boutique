/**
 * Auction API Client
 * Provides methods to interact with the auction API endpoints
 */

import { apiClient } from './api';

export interface AuctionProduct {
  _id: string;
  title: string;
  description: string;
  startingBid: number;
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
  auctionEndDate: string;
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
  auctionStatus?: 'live' | 'ended';
  timeLeft?: number;
  id?: string;
  currentBid?: number;
  bidCount?: number;
  bidHistory?: Array<{
    id: string;
    bidder: {
      name: string;
      avatar?: string;
      isVerified: boolean;
    };
    amount: number;
    timestamp: string;
    isWinningBid: boolean;
  }>;
  // Bidding fields (optional, populated when viewing a single product)
  currentBid?: number;
  bidCount?: number;
  bidHistory?: Array<{
    id: string;
    bidder: {
      name: string;
      avatar?: string;
      isVerified: boolean;
    };
    amount: number;
    timestamp: string;
    isWinningBid: boolean;
  }>;
}

export interface AuctionProductsResponse {
  products: AuctionProduct[];
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

export interface AuctionProductResponse {
  success: boolean;
  message: string;
  data: {
    product: AuctionProduct;
    relatedProducts: AuctionProduct[];
  };
}

export interface AuctionDashboardStats {
  success: boolean;
  message: string;
  data: {
    overview: {
      totalAuctionProducts: number;
      userAuctionProducts: number;
      totalValue: number;
      averageStartingBid: number;
      minStartingBid: number;
      maxStartingBid: number;
    };
    byCategory: Array<{
      _id: string;
      count: number;
      totalValue: number;
      averageStartingBid: number;
    }>;
    recentProducts: AuctionProduct[];
    liveAuctions: AuctionProduct[];
  };
}

export interface AuctionProductsFilters {
  page?: number;
  limit?: number;
  category?: string;
  condition?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest' | 'oldest' | 'ending_soon' | 'name_asc' | 'name_desc';
}

class AuctionApiClient {
  private baseUrl = '/auction';

  /**
   * Get auction products with filtering and pagination
   */
  async getProducts(filters: AuctionProductsFilters = {}): Promise<AuctionProductsResponse> {
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
   * Get featured auction products
   */
  async getFeaturedProducts(limit: number = 8): Promise<AuctionProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/featured?limit=${limit}`);
  }

  /**
   * Get popular auction products
   */
  async getPopularProducts(limit: number = 8): Promise<AuctionProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/popular?limit=${limit}`);
  }

  /**
   * Get auction products by category
   */
  async getProductsByCategory(category: string, page: number = 1, limit: number = 12): Promise<AuctionProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/category/${category}?page=${page}&limit=${limit}`);
  }

  /**
   * Search auction products
   */
  async searchProducts(query: string, page: number = 1, limit: number = 12): Promise<AuctionProductsResponse> {
    return apiClient.get(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  /**
   * Get auction product details
   */
  async getProduct(productId: string): Promise<AuctionProductResponse> {
    return apiClient.get(`${this.baseUrl}/products/${productId}`);
  }

  async placeBid(productId: string, amount: number) {
    return apiClient.post(`${this.baseUrl}/products/${productId}/bids`, { amount });
  }

  /**
   * Place a bid on an auction product
   */
  async placeBid(productId: string, amount: number) {
    return apiClient.post(`${this.baseUrl}/products/${productId}/bids`, { amount });
  }

  /**
   * Get auction dashboard statistics (requires authentication)
   */
  async getDashboardStats(): Promise<AuctionDashboardStats> {
    return apiClient.get(`${this.baseUrl}/dashboard/stats`);
  }

  /**
   * Update an auction product (requires authentication and ownership)
   */
  async updateProduct(productId: string, productData: Partial<AuctionProduct>): Promise<AuctionProductResponse> {
    return apiClient.put(`${this.baseUrl}/products/${productId}`, productData);
  }

  /**
   * Delete an auction product (requires authentication and ownership)
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.baseUrl}/products/${productId}`);
  }
}

// Create and export a singleton instance
export const auctionApi = new AuctionApiClient();
