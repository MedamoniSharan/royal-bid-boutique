/**
 * React hooks for Auction API
 * Provides convenient hooks for using auction API endpoints with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  auctionApi, 
  AuctionProductsFilters, 
  AuctionProduct, 
  AuctionProductsResponse,
  AuctionProductResponse,
  AuctionDashboardStats
} from '@/utils/auctionApi';

// Query keys for React Query
export const auctionQueryKeys = {
  all: ['auction'] as const,
  products: (filters: AuctionProductsFilters) => ['auction', 'products', filters] as const,
  product: (id: string) => ['auction', 'product', id] as const,
  featured: (limit: number) => ['auction', 'featured', limit] as const,
  popular: (limit: number) => ['auction', 'popular', limit] as const,
  category: (category: string, page: number, limit: number) => ['auction', 'category', category, page, limit] as const,
  search: (query: string, page: number, limit: number) => ['auction', 'search', query, page, limit] as const,
  dashboardStats: () => ['auction', 'dashboard', 'stats'] as const,
  placeBid: (id: string) => ['auction', 'product', id, 'placeBid'] as const,
};

/**
 * Hook to get auction products with filtering and pagination
 */
export function useAuctionProducts(filters: AuctionProductsFilters = {}) {
  return useQuery({
    queryKey: auctionQueryKeys.products(filters),
    queryFn: () => auctionApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get featured auction products
 */
export function useFeaturedAuctionProducts(limit: number = 8) {
  return useQuery({
    queryKey: auctionQueryKeys.featured(limit),
    queryFn: () => auctionApi.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get popular auction products
 */
export function usePopularAuctionProducts(limit: number = 8) {
  return useQuery({
    queryKey: auctionQueryKeys.popular(limit),
    queryFn: () => auctionApi.getPopularProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get auction products by category
 */
export function useAuctionProductsByCategory(
  category: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: auctionQueryKeys.category(category, page, limit),
    queryFn: () => auctionApi.getProductsByCategory(category, page, limit),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to search auction products
 */
export function useSearchAuctionProducts(
  query: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: auctionQueryKeys.search(query, page, limit),
    queryFn: () => auctionApi.searchProducts(query, page, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get auction product details
 */
export function useAuctionProduct(productId?: string) {
  return useQuery({
    queryKey: auctionQueryKeys.product(productId || ''),
    queryFn: () => auctionApi.getProduct(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to place a bid on an auction product
 */
export function usePlaceBid(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: productId ? auctionQueryKeys.placeBid(productId) : undefined,
    mutationFn: (amount: number) => {
      if (!productId) {
        throw new Error('Product ID is required to place a bid');
      }
      return auctionApi.placeBid(productId, amount);
    },
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.product(productId) });
      }
    },
  });
}

/**
 * Hook to get auction dashboard statistics
 */
export function useAuctionDashboardStats() {
  return useQuery({
    queryKey: auctionQueryKeys.dashboardStats(),
    queryFn: () => auctionApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Disable by default - will be enabled by individual components when needed
  });
}

/**
 * Hook to update an auction product
 */
export function useUpdateAuctionProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productData }: { productId: string; productData: Partial<AuctionProduct> }) => {
      return auctionApi.updateProduct(productId, productData);
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: auctionQueryKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: auctionQueryKeys.products({}) });
      queryClient.invalidateQueries({ queryKey: auctionQueryKeys.dashboardStats() });
    },
  });
}

/**
 * Hook to delete an auction product
 */
export function useDeleteAuctionProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      return auctionApi.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionQueryKeys.products({}) });
      queryClient.invalidateQueries({ queryKey: auctionQueryKeys.dashboardStats() });
    },
  });
}
