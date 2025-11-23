/**
 * React hooks for Anti-Pieces API
 * Provides convenient hooks for using anti-pieces API endpoints with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  antiPiecesApi, 
  AntiPiecesProductsFilters, 
  AntiPiecesProduct, 
  AntiPiecesProductsResponse,
  AntiPiecesProductResponse,
  AntiPiecesDashboardStats
} from '@/utils/antiPiecesApi';

// Query keys for React Query
export const antiPiecesQueryKeys = {
  all: ['anti-pieces'] as const,
  products: (filters: AntiPiecesProductsFilters) => ['anti-pieces', 'products', filters] as const,
  product: (id: string) => ['anti-pieces', 'product', id] as const,
  featured: (limit: number) => ['anti-pieces', 'featured', limit] as const,
  popular: (limit: number) => ['anti-pieces', 'popular', limit] as const,
  category: (category: string, page: number, limit: number) => ['anti-pieces', 'category', category, page, limit] as const,
  search: (query: string, page: number, limit: number) => ['anti-pieces', 'search', query, page, limit] as const,
  dashboardStats: () => ['anti-pieces', 'dashboard', 'stats'] as const,
};

/**
 * Hook to get anti-pieces products with filtering and pagination
 */
export function useAntiPiecesProducts(filters: AntiPiecesProductsFilters = {}) {
  return useQuery({
    queryKey: antiPiecesQueryKeys.products(filters),
    queryFn: () => antiPiecesApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Enable by default since API uses optionalAuth
  });
}

/**
 * Hook to get featured anti-pieces products
 */
export function useFeaturedAntiPiecesProducts(limit: number = 8) {
  return useQuery({
    queryKey: antiPiecesQueryKeys.featured(limit),
    queryFn: () => antiPiecesApi.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get popular anti-pieces products
 */
export function usePopularAntiPiecesProducts(limit: number = 8) {
  return useQuery({
    queryKey: antiPiecesQueryKeys.popular(limit),
    queryFn: () => antiPiecesApi.getPopularProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get anti-pieces products by category
 */
export function useAntiPiecesProductsByCategory(
  category: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: antiPiecesQueryKeys.category(category, page, limit),
    queryFn: () => antiPiecesApi.getProductsByCategory(category, page, limit),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to search anti-pieces products
 */
export function useSearchAntiPiecesProducts(
  query: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: antiPiecesQueryKeys.search(query, page, limit),
    queryFn: () => antiPiecesApi.searchProducts(query, page, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get anti-pieces product details
 */
export function useAntiPiecesProduct(productId?: string) {
  return useQuery({
    queryKey: antiPiecesQueryKeys.product(productId || ''),
    queryFn: () => antiPiecesApi.getProduct(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get anti-pieces dashboard statistics
 */
export function useAntiPiecesDashboardStats() {
  return useQuery({
    queryKey: antiPiecesQueryKeys.dashboardStats(),
    queryFn: () => antiPiecesApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Disable by default - will be enabled by individual components when needed
  });
}
