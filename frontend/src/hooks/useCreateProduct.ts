import { useState } from 'react';
import { createProduct, CreateProductData, Product } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface UseCreateProductReturn {
  createProductMutation: (data: CreateProductData) => Promise<Product | null>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  reset: () => void;
}

export const useCreateProduct = (): UseCreateProductReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const createProductMutation = async (data: CreateProductData): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const product = await createProduct(data);
      setIsSuccess(true);
      
      toast({
        title: "Product Created Successfully!",
        description: "Your product has been submitted for review.",
        variant: "default",
      });

      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      
      toast({
        title: "Failed to Create Product",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
  };

  return {
    createProductMutation,
    isLoading,
    error,
    isSuccess,
    reset,
  };
};
