import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProductListingForm from '@/components/ProductListingForm';
import { apiClient } from '@/utils/api';

// Mock the API client
vi.mock('@/utils/api', () => ({
  apiClient: {
    createProduct: vi.fn(),
  },
  createProduct: vi.fn(),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ProductListingForm Integration', () => {
  const mockOnClose = vi.fn();
  const mockCreateProduct = vi.mocked(apiClient.createProduct);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with all required fields', () => {
    render(<ProductListingForm onClose={mockOnClose} />);
    
    expect(screen.getByLabelText(/product title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/listing type/i)).toBeInTheDocument();
  });

  it('should show auction fields when auction type is selected', async () => {
    render(<ProductListingForm onClose={mockOnClose} />);
    
    const auctionTypeSelect = screen.getByLabelText(/listing type/i);
    fireEvent.click(auctionTypeSelect);
    
    const auctionOption = screen.getByText('Auction');
    fireEvent.click(auctionOption);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/starting bid/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/auction end date/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(<ProductListingForm onClose={mockOnClose} />);
    
    const submitButton = screen.getByRole('button', { name: /list product/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
      expect(screen.getByText(/stocks is required/i)).toBeInTheDocument();
      expect(screen.getByText(/condition is required/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockProduct = {
      _id: '123',
      title: 'Test Product',
      description: 'Test Description',
      category: 'Electronics',
      price: 100,
      stocks: 5,
      discount: 0,
      condition: 'New',
      auctionType: 'Retail' as const,
      authenticity: 'unknown' as const,
      tags: [],
      images: [],
      seller: {
        _id: 'seller123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      status: 'pending_review' as const,
      isFeatured: false,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCreateProduct.mockResolvedValue(mockProduct);

    render(<ProductListingForm onClose={mockOnClose} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/product title/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/stocks/i), {
      target: { value: '5' },
    });

    // Select category
    fireEvent.click(screen.getByLabelText(/category/i));
    fireEvent.click(screen.getByText('Electronics'));

    // Select condition
    fireEvent.click(screen.getByLabelText(/condition/i));
    fireEvent.click(screen.getByText('New'));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /list product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        title: 'Test Product',
        description: 'Test Description',
        category: 'Electronics',
        price: 100,
        stocks: 5,
        discount: 0,
        condition: 'New',
        auctionType: 'Retail',
        brand: undefined,
        model: undefined,
        authenticity: 'unknown',
        tags: [],
        images: [],
      });
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to create product';
    mockCreateProduct.mockRejectedValue(new Error(errorMessage));

    render(<ProductListingForm onClose={mockOnClose} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/product title/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/stocks/i), {
      target: { value: '5' },
    });

    // Select category
    fireEvent.click(screen.getByLabelText(/category/i));
    fireEvent.click(screen.getByText('Electronics'));

    // Select condition
    fireEvent.click(screen.getByLabelText(/condition/i));
    fireEvent.click(screen.getByText('New'));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /list product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalled();
    });

    // The form should not close on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockCreateProduct.mockReturnValue(promise);

    render(<ProductListingForm onClose={mockOnClose} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/product title/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/stocks/i), {
      target: { value: '5' },
    });

    // Select category
    fireEvent.click(screen.getByLabelText(/category/i));
    fireEvent.click(screen.getByText('Electronics'));

    // Select condition
    fireEvent.click(screen.getByLabelText(/condition/i));
    fireEvent.click(screen.getByText('New'));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /list product/i });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/creating product/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise
    resolvePromise!({
      _id: '123',
      title: 'Test Product',
      description: 'Test Description',
      category: 'Electronics',
      price: 100,
      stocks: 5,
      discount: 0,
      condition: 'New',
      auctionType: 'Retail',
      authenticity: 'unknown',
      tags: [],
      images: [],
      seller: {
        _id: 'seller123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      status: 'pending_review',
      isFeatured: false,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
