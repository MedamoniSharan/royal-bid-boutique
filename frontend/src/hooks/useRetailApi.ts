/**
 * React hooks for Retail API
 * Provides convenient hooks for using retail API endpoints with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  retailApi, 
  RetailProductsFilters, 
  RetailProduct, 
  RetailProductsResponse,
  RetailProductResponse,
  RetailDashboardStats,
  RetailAnalytics
} from '@/utils/retailApi';

// Query keys for React Query
export const retailQueryKeys = {
  all: ['retail'] as const,
  products: (filters: RetailProductsFilters) => ['retail', 'products', filters] as const,
  product: (id: string) => ['retail', 'product', id] as const,
  featured: (limit: number) => ['retail', 'featured', limit] as const,
  popular: (limit: number) => ['retail', 'popular', limit] as const,
  sale: (page: number, limit: number) => ['retail', 'sale', page, limit] as const,
  category: (category: string, page: number, limit: number) => ['retail', 'category', category, page, limit] as const,
  search: (query: string, page: number, limit: number) => ['retail', 'search', query, page, limit] as const,
  recommendations: (limit: number) => ['retail', 'recommendations', limit] as const,
  dashboardStats: () => ['retail', 'dashboard', 'stats'] as const,
  analytics: () => ['retail', 'analytics'] as const,
  adminDashboard: () => ['retail', 'admin', 'dashboard'] as const,
};

/**
 * Hook to get retail products with filtering and pagination
 */
export function useRetailProducts(filters: RetailProductsFilters = {}) {
  return useQuery({
    queryKey: retailQueryKeys.products(filters),
    queryFn: () => retailApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get featured retail products
 */
export function useFeaturedRetailProducts(limit: number = 8) {
  return useQuery({
    queryKey: retailQueryKeys.featured(limit),
    queryFn: () => retailApi.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get popular retail products
 */
export function usePopularRetailProducts(limit: number = 8) {
  return useQuery({
    queryKey: retailQueryKeys.popular(limit),
    queryFn: () => retailApi.getPopularProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get retail products on sale
 */
export function useRetailProductsOnSale(page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: retailQueryKeys.sale(page, limit),
    queryFn: () => retailApi.getProductsOnSale(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get retail products by category
 */
export function useRetailProductsByCategory(
  category: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: retailQueryKeys.category(category, page, limit),
    queryFn: () => retailApi.getProductsByCategory(category, page, limit),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to search retail products
 */
export function useSearchRetailProducts(
  query: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: retailQueryKeys.search(query, page, limit),
    queryFn: () => retailApi.searchProducts(query, page, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get product recommendations
 */
export function useRetailRecommendations(limit: number = 8) {
  return useQuery({
    queryKey: retailQueryKeys.recommendations(limit),
    queryFn: () => retailApi.getRecommendations(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get retail product details
 */
export function useRetailProduct(productId?: string) {
  return useQuery({
    queryKey: retailQueryKeys.product(productId || ''),
    queryFn: () => retailApi.getProduct(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get retail dashboard statistics
 */
export function useRetailDashboardStats() {
  return useQuery({
    queryKey: retailQueryKeys.dashboardStats(),
    queryFn: () => retailApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Disable by default - will be enabled by individual components when needed
  });
}

/**
 * Hook to get retail analytics
 */
export function useRetailAnalytics() {
  return useQuery({
    queryKey: retailQueryKeys.analytics(),
    queryFn: () => retailApi.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get admin dashboard statistics
 */
export function useAdminRetailDashboard() {
  return useQuery({
    queryKey: retailQueryKeys.adminDashboard(),
    queryFn: () => retailApi.getAdminDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to invalidate retail queries
 */
export function useInvalidateRetailQueries() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: retailQueryKeys.all });
  };

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['retail', 'products'] });
  };

  const invalidateProduct = (productId: string) => {
    queryClient.invalidateQueries({ queryKey: retailQueryKeys.product(productId) });
  };

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['retail', 'dashboard'] });
  };

  const invalidateAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ['retail', 'analytics'] });
  };

  return {
    invalidateAll,
    invalidateProducts,
    invalidateProduct,
    invalidateDashboard,
    invalidateAnalytics,
  };
}

/**
 * Hook for prefetching retail data
 */
export function usePrefetchRetailData() {
  const queryClient = useQueryClient();

  const prefetchProduct = (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: retailQueryKeys.product(productId),
      queryFn: () => retailApi.getProduct(productId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchFeaturedProducts = (limit: number = 8) => {
    queryClient.prefetchQuery({
      queryKey: retailQueryKeys.featured(limit),
      queryFn: () => retailApi.getFeaturedProducts(limit),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchPopularProducts = (limit: number = 8) => {
    queryClient.prefetchQuery({
      queryKey: retailQueryKeys.popular(limit),
      queryFn: () => retailApi.getPopularProducts(limit),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchProduct,
    prefetchFeaturedProducts,
    prefetchPopularProducts,
  };
}

/**
 * Utility hook for retail product operations
 */
export function useRetailProductOperations() {
  const { invalidateProduct, invalidateProducts } = useInvalidateRetailQueries();

  // This would be used for mutations like updating product view count
  const updateViewCount = useMutation({
    mutationFn: async (productId: string) => {
      // This would be a separate endpoint for updating view count
      // For now, we'll just invalidate the product query
      invalidateProduct(productId);
    },
    onSuccess: (_, productId) => {
      invalidateProduct(productId);
    },
  });

  return {
    updateViewCount,
  };
}

/**
 * Hook to update a retail product
 */
export function useUpdateRetailProduct() {
  const queryClient = useQueryClient();
  const { invalidateProducts, invalidateProduct } = useInvalidateRetailQueries();

  return useMutation({
    mutationFn: ({ productId, productData }: { productId: string; productData: Partial<RetailProduct> }) => {
      return retailApi.updateProduct(productId, productData);
    },
    onSuccess: (_, { productId }) => {
      invalidateProduct(productId);
      invalidateProducts();
      queryClient.invalidateQueries({ queryKey: retailQueryKeys.dashboardStats() });
    },
  });
}

/**
 * Hook to delete a retail product
 */
export function useDeleteRetailProduct() {
  const queryClient = useQueryClient();
  const { invalidateProducts } = useInvalidateRetailQueries();

  return useMutation({
    mutationFn: (productId: string) => {
      return retailApi.deleteProduct(productId);
    },
    onSuccess: () => {
      invalidateProducts();
      queryClient.invalidateQueries({ queryKey: retailQueryKeys.dashboardStats() });
    },
  });
}
