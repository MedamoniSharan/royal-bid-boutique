const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stocks: number;
  discount: number;
  condition: string;
  auctionType: 'Auction' | 'Retail' | 'Anti-Piece';
  startingBid?: number;
  auctionEndDate?: string;
  brand?: string;
  model?: string;
  authenticity: 'authentic' | 'replica' | 'unknown';
  tags: string[];
  images: ProductImage[];
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'active' | 'inactive' | 'archived' | 'pending_review';
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  category: string;
  price: number;
  stocks: number;
  discount?: number;
  condition: string;
  auctionType: 'Auction' | 'Retail' | 'Anti-Piece';
  startingBid?: number;
  auctionEndDate?: string;
  brand?: string;
  model?: string;
  authenticity?: 'authentic' | 'replica' | 'unknown';
  tags?: string[];
  images?: ProductImage[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  auctionType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductSearchFilters extends ProductFilters {
  q?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    console.log('API Request:', { url, config }); // Debug log

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', { status: response.status, data }); // Debug log

      if (!response.ok) {
        // For validation errors, show the first validation error message
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors[0].message || data.message || 'Validation failed');
        }
        // For other errors, show the main error message
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error); // Debug log
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response.data!;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/me');
    return response.data!.user;
  }

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ token: string; refreshToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data) {
      this.setToken(response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data!;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.request(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  }

  async resendVerification(email: string): Promise<void> {
    await this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Product methods
  async createProduct(productData: CreateProductData): Promise<Product> {
    const response = await this.request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data!.product;
  }

  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data!;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.request<{ product: Product }>(`/products/${id}`);
    return response.data!.product;
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.request<{ products: Product[] }>(`/products/featured?limit=${limit}`);
    return response.data!.products;
  }

  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.request<{ products: Product[] }>(`/products/popular?limit=${limit}`);
    return response.data!.products;
  }

  async searchProducts(filters: ProductSearchFilters = {}): Promise<{ products: Product[]; query?: string; filters?: ProductSearchFilters }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/products/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ products: Product[]; query?: string; filters?: ProductSearchFilters }>(endpoint);
    return response.data!;
  }

  async getProductsByCategory(category: string, filters: Omit<ProductFilters, 'category'> = {}): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/products/category/${category}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data!;
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience (bound to the instance)
export const login = apiClient.login.bind(apiClient);
export const register = apiClient.register.bind(apiClient);
export const logout = apiClient.logout.bind(apiClient);
export const getMe = apiClient.getMe.bind(apiClient);
export const refreshToken = apiClient.refreshToken.bind(apiClient);
export const forgotPassword = apiClient.forgotPassword.bind(apiClient);
export const resetPassword = apiClient.resetPassword.bind(apiClient);
export const verifyEmail = apiClient.verifyEmail.bind(apiClient);
export const resendVerification = apiClient.resendVerification.bind(apiClient);
export const createProduct = apiClient.createProduct.bind(apiClient);
export const getProducts = apiClient.getProducts.bind(apiClient);
export const getProduct = apiClient.getProduct.bind(apiClient);
export const getFeaturedProducts = apiClient.getFeaturedProducts.bind(apiClient);
export const getPopularProducts = apiClient.getPopularProducts.bind(apiClient);
export const searchProducts = apiClient.searchProducts.bind(apiClient);
export const getProductsByCategory = apiClient.getProductsByCategory.bind(apiClient);
