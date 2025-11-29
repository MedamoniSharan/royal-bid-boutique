import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useRetailProduct } from "@/hooks/useRetailApi";
import { useAntiPiecesProduct } from "@/hooks/useAntiPiecesApi";
import { useAuctionProduct, usePlaceBid } from "@/hooks/useAuctionApi";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Clock, 
  Eye, 
  Gavel, 
  Star,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  CheckCircle,
  Trophy
} from "lucide-react";

interface BidHistory {
  id: number;
  bidder: {
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  amount: number;
  timestamp: string;
  isWinningBid: boolean;
}

interface ProductDetail {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  seller: {
    name: string;
    avatar?: string;
    rating: number;
    totalSales: number;
  };
  condition: string;
  tags: string[];
  auctionType: "fixed" | "auction" | "both";
  auctionDetails?: {
    currentBid: number;
    startingBid: number;
    bidCount: number;
    timeLeft: string;
    buyNowPrice?: number;
  };
  features: string[];
  specifications: Record<string, string>;
  shipping: {
    free: boolean;
    estimatedDelivery: string;
    returnPolicy: string;
  };
  reviews: {
    average: number;
    total: number;
    breakdown: Record<number, number>;
  };
  bidHistory?: BidHistory[];
}


export default function ProductDetailView({ productId, onBack, auctionType = "auction" }: { productId: string | number, onBack: () => void, auctionType?: "auction" | "retail" | "anti-pieces" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [bidAmount, setBidAmount] = useState<string>("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(
    auctionType === "auction" ? "bidHistory" : "description"
  );

  // Fetch product data based on auction type
  const { data: retailProduct, isLoading: retailLoading, error: retailError } = useRetailProduct(
    auctionType === "retail" ? productId.toString() : undefined
  );
  
  const { data: antiPiecesProduct, isLoading: antiPiecesLoading, error: antiPiecesError } = useAntiPiecesProduct(
    auctionType === "anti-pieces" ? productId.toString() : undefined
  );
  
  const { data: auctionProduct, isLoading: auctionLoading, error: auctionError } = useAuctionProduct(
    auctionType === "auction" ? productId.toString() : undefined
  );
  const placeBidMutation = usePlaceBid(
    auctionType === "auction" ? productId.toString() : undefined
  );

  // Debug logging
  console.log('ProductDetailView Debug:', {
    productId,
    auctionType,
    retailProduct,
    antiPiecesProduct,
    auctionProduct,
    retailError,
    antiPiecesError,
    auctionError
  });

  // Detailed structure debugging
  if (auctionProduct) {
    const auctionProductAny = auctionProduct as any;
    console.log('Auction Product Full Structure:', {
      'auctionProduct': auctionProductAny,
      'auctionProduct.data': auctionProductAny.data,
      'auctionProduct.data?.data': auctionProductAny.data?.data,
      'auctionProduct.data?.product': auctionProductAny.data?.product,
      'auctionProduct.data?.data?.product': auctionProductAny.data?.data?.product
    });
  }

  // Transform API product data to match the expected UI format
  const transformApiProductToUI = (apiProduct: any, type: string) => {
    // Get the first image URL
    const getImageUrl = (product: any) => {
      console.log('getImageUrl called with product:', {
        'product.images': product.images,
        'product.primaryImage': product.primaryImage,
        'product.images?.length': product.images?.length
      });
      
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
        console.log('Using first image from images array:', imageUrl);
        return imageUrl;
      }
      if (product.primaryImage) {
        const imageUrl = typeof product.primaryImage === 'string' ? product.primaryImage : product.primaryImage.url;
        console.log('Using primary image:', imageUrl);
        return imageUrl;
      }
      console.log('Using fallback image');
      return "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop";
    };

    // Get seller name
    const getSellerName = (seller: any) => {
      if (seller?.firstName && seller?.lastName) {
        return `${seller.firstName} ${seller.lastName}`;
      }
      if (seller?.name) {
        return seller.name;
      }
      return "Unknown Seller";
    };

    // Base product data
    const baseProduct = {
      id: apiProduct._id || apiProduct.id,
      title: apiProduct.title || "Untitled Product",
      description: apiProduct.description || "No description available",
      category: apiProduct.category || "Uncategorized",
      condition: apiProduct.condition || "Unknown",
      brand: apiProduct.brand || "",
      model: apiProduct.model || "",
      image: getImageUrl(apiProduct),
      images: apiProduct.images ? apiProduct.images.map((img: any) => typeof img === 'string' ? img : img.url) : [getImageUrl(apiProduct)],
      viewCount: apiProduct.viewCount || 0,
      seller: {
        name: getSellerName(apiProduct.seller),
        avatar: apiProduct.seller?.avatar || "",
        rating: apiProduct.seller?.rating || 4.5,
        totalSales: apiProduct.seller?.totalSales || 0,
        ...apiProduct.seller
      },
      auctionType: type
    };

    // Add type-specific properties
    if (type === "retail") {
      return {
        ...baseProduct,
        price: apiProduct.price || 0,
        currentPrice: apiProduct.discount > 0 ? apiProduct.price * (1 - apiProduct.discount / 100) : apiProduct.price,
        originalPrice: apiProduct.discount > 0 ? apiProduct.price : undefined,
        discount: apiProduct.discount || 0,
        stock: apiProduct.stocks || 0,
        status: (apiProduct.stocks || 0) > 0 ? "available" : "out_of_stock",
        age: "New",
        shipping: {
          cost: 0,
          estimatedDays: "3-5",
          free: true
        },
        tags: apiProduct.tags || ["New", "Fast Shipping"],
        features: apiProduct.features || [],
        specifications: apiProduct.specifications || {},
        longDescription: apiProduct.longDescription || apiProduct.description,
        reviews: [],
        bidHistory: []
      };
    }

    if (type === "anti-pieces") {
      return {
        ...baseProduct,
        price: apiProduct.discount > 0 ? apiProduct.price * (1 - apiProduct.discount / 100) : apiProduct.price,
        currentPrice: apiProduct.discount > 0 ? apiProduct.price * (1 - apiProduct.discount / 100) : apiProduct.price,
        originalPrice: apiProduct.discount > 0 ? apiProduct.price : undefined,
        discount: apiProduct.discount || 0,
        age: apiProduct.age || "Vintage",
        status: "antique",
        shipping: {
          cost: 15,
          estimatedDays: "5-7",
          free: false
        },
        tags: apiProduct.tags || ["Vintage", "Authentic", "Collectible"],
        features: apiProduct.features || [],
        specifications: apiProduct.specifications || {},
        longDescription: apiProduct.longDescription || apiProduct.description,
        reviews: [],
        bidHistory: []
      };
    }

    if (type === "auction") {
      const currentBid = apiProduct.currentBid ?? apiProduct.startingBid ?? 0;
      const bidHistory = apiProduct.bidHistory || [];
      return {
        ...baseProduct,
        currentBid,
        currentPrice: currentBid,
        nextBid: currentBid + 1,
        bids: apiProduct.bidCount || bidHistory.length,
        timeLeft: apiProduct.timeLeft ? `${Math.floor(apiProduct.timeLeft / (1000 * 60 * 60))}h ${Math.floor((apiProduct.timeLeft % (1000 * 60 * 60)) / (1000 * 60))}m` : "2h 45m",
        status: apiProduct.auctionStatus === 'live' ? "live" : "ended",
        auctionDetails: {
          endTime: apiProduct.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          currentBid,
          minBid: currentBid,
          bidIncrement: 1,
          reservePrice: apiProduct.reservePrice || 0,
          buyNowPrice: apiProduct.buyNowPrice || 0,
          bidCount: bidHistory.length || apiProduct.bidCount || 0
        },
        shipping: {
          cost: 25,
          estimatedDays: "7-10",
          free: false
        },
        tags: apiProduct.tags || ["Auction", "Live", "Bidding"],
        features: apiProduct.features || [],
        specifications: apiProduct.specifications || {},
        longDescription: apiProduct.longDescription || apiProduct.description,
        reviews: [],
        bidHistory
      };
    }

    return baseProduct;
  };

  // Helper function to extract product data from various possible response structures
  const extractProductData = (apiResponse: any) => {
    if (!apiResponse) return null;
    
    // Try different possible paths
    const paths = [
      apiResponse.data?.data?.product,
      apiResponse.data?.product,
      apiResponse.product,
      apiResponse
    ];
    
    for (const path of paths) {
      if (path && path.title) { // Check if it looks like a product object
        console.log('Found product data at path:', path);
        return path;
      }
    }
    
    console.log('No product data found in any path');
    return null;
  };

  // Determine which product data to use
  const getProductData = () => {
    console.log('getProductData called:', {
      auctionType,
      'retailProduct?.data?.product': retailProduct?.data?.product,
      'antiPiecesProduct?.data?.product': antiPiecesProduct?.data?.product,
      'auctionProduct?.data?.product': auctionProduct?.data?.product,
      'retailProduct?.data': retailProduct?.data,
      'antiPiecesProduct?.data': antiPiecesProduct?.data,
      'auctionProduct?.data': auctionProduct?.data
    });

    if (auctionType === "retail" && retailProduct) {
      const productData = extractProductData(retailProduct);
      if (productData) {
        const transformed = transformApiProductToUI(productData, "retail");
        console.log('Retail product transformed:', transformed);
        return transformed;
      }
    }
    if (auctionType === "anti-pieces" && antiPiecesProduct) {
      const productData = extractProductData(antiPiecesProduct);
      if (productData) {
        const transformed = transformApiProductToUI(productData, "anti-pieces");
        console.log('Anti-pieces product transformed:', transformed);
        return transformed;
      }
    }
    if (auctionType === "auction" && auctionProduct) {
      const productData = extractProductData(auctionProduct);
      if (productData) {
        const transformed = transformApiProductToUI(productData, "auction");
        console.log('Auction product transformed:', transformed);
        console.log('Transformed images array:', transformed.images);
        console.log('Transformed main image:', transformed.image);
        return transformed;
      }
    }
    
    console.log('No product data found, returning null');
    // Return null if no API data available - will show error state
    return null;
  };

  const product = getProductData() as any; // Type assertion to handle the dynamic product structure
  const isLoading = retailLoading || antiPiecesLoading || auctionLoading;

  // Show loading state while fetching product data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Show error state if no product data is available
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for could not be found or is no longer available.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      title: product.title,
      image: product.images?.[0],
      quantity,
      unitPrice:
        product.auctionDetails?.buyNowPrice ??
        product.currentPrice ??
        product.price ??
        0,
      totalPrice:
        quantity *
        (product.auctionDetails?.buyNowPrice ??
          product.currentPrice ??
          product.price ??
          0),
      auctionType: product.auctionType,
    };

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart", cartItem } });
      return;
    }

    navigate("/cart", { state: { cartItem } });
  };

  // Handle placing a bid without navigating to cart/orders
  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const currentBid =
      product.auctionDetails?.currentBid ??
      product.currentBid ??
      product.currentPrice ??
      product.price ??
      0;
    const minNextBid = currentBid + 1;

    const numericAmount = Number(bidAmount);
    if (!bidAmount || isNaN(numericAmount)) {
      alert(`Please enter a valid bid amount greater than ${currentBid}. Minimum next bid is ${minNextBid}.`);
      return;
    }

    if (numericAmount <= currentBid) {
      alert(`Your bid must be greater than the current highest bid of ${currentBid}.`);
      return;
    }

    try {
      await placeBidMutation.mutateAsync(numericAmount);
      setBidAmount("");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to place bid. Please try again.";
      alert(message);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '$0';
    }
    return `$${price.toLocaleString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{product.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-card rounded-lg overflow-hidden">
              <img
                src={product.images[currentImageIndex]}
                alt={product.title}
                className="w-full h-96 object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Auction Badge */}
              {product.auctionType !== "fixed" && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-crimson text-white animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    LIVE AUCTION
                  </Badge>
                </div>
              )}

              {/* Discount Badge */}
              {product.discount && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-purple-600 text-white">
                    {product.discount}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative overflow-hidden rounded-lg ${
                    currentImageIndex === index ? 'ring-2 ring-crimson' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="secondary">{product.condition}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Technology Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.currentPrice)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-purple-600 text-white">
                      {product.discount}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Auction Details */}
              {product.auctionDetails && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-crimson">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{product.auctionDetails.timeLeft} left</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Bid:</span>
                      <span className="font-semibold ml-2">{formatPrice(product.auctionDetails.currentBid)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bids:</span>
                      <span className="font-semibold ml-2">{product.auctionDetails.bidCount}</span>
                    </div>
                  </div>
                  {product.auctionDetails.buyNowPrice && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Buy Now Price:</span>
                      <span className="font-semibold ml-2 text-gold">{formatPrice(product.auctionDetails.buyNowPrice)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                    <AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{product.seller.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(product.seller.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.seller.rating}) • {product.seller.totalSales} sales
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Buy Button */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {(product.auctionType === "auction" || product.auctionType === "both") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Place your bid</span>
                    <span className="text-xs text-muted-foreground">
                      Current: {formatPrice(product.auctionDetails?.currentBid || product.currentPrice)} &nbsp;|&nbsp;
                      Min next bid:{" "}
                      {formatPrice(
                        (product.auctionDetails?.currentBid || product.currentPrice || 0) + 1
                      )}
                    </span>
                  </label>
                  <Input
                    type="number"
                    min={(product.auctionDetails?.currentBid || product.currentPrice || 0) + 1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Enter at least ${
                      (product.auctionDetails?.currentBid || product.currentPrice || 0) + 1
                    }`}
                  />
                </div>
              )}

              <div className="space-y-2">
                {product.auctionType === "auction" || product.auctionType === "both" ? (
                  <>
                    <Button 
                      className="w-full bg-crimson hover:bg-crimson/90 h-12"
                      onClick={handlePlaceBid}
                    >
                      <Gavel className="w-5 h-5 mr-2" />
                      Place Bid - {formatPrice(product.auctionDetails?.currentBid || product.currentPrice)}
                    </Button>
                    {product.auctionDetails?.buyNowPrice && (
                      <Button 
                        variant="outline" 
                        className="w-full h-12"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now - {formatPrice(product.auctionDetails.buyNowPrice)}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    className="w-full bg-crimson hover:bg-crimson/90 h-12"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now - {formatPrice(product.currentPrice * quantity)}
                  </Button>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="text-xs">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                <span className="text-xs">
                  {product.shipping.free ? 'Free' : 'Paid'} Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <RotateCcw className="w-6 h-6 text-purple-600" />
                <span className="text-xs">{product.shipping.returnPolicy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${product.auctionType === "auction" || product.auctionType === "both" ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              {product.auctionType === "auction" || product.auctionType === "both" ? (
                <TabsTrigger value="bidHistory">Bid History ({product.bidHistory?.length || 0})</TabsTrigger>
              ) : null}
              <TabsTrigger value="reviews">Reviews ({product.reviews.total})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.longDescription}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-crimson rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.specifications ? Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      )) : (
                        <div className="text-center text-muted-foreground py-4">
                          No specifications available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {(product.auctionType === "auction" || product.auctionType === "both") && (
              <TabsContent value="bidHistory" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-gold" />
                      Bid History
                    </CardTitle>
                    <CardDescription>
                      Track of all bids placed on this auction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.bidHistory?.map((bid, index) => (
                        <div 
                          key={bid.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            bid.isWinningBid 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                              : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                #{product.bidHistory!.length - index}
                              </span>
                              {bid.isWinningBid && (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Winning
                                </Badge>
                              )}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={bid.bidder.avatar} alt={bid.bidder.name} />
                              <AvatarFallback>{bid.bidder.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{bid.bidder.name}</span>
                                {bid.bidder.isVerified && (
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{bid.timestamp}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">
                              {formatPrice(bid.amount)}
                            </div>
                            {bid.isWinningBid && (
                              <div className="text-sm text-green-600 font-medium">Current Highest</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Customer Reviews</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {renderStars(product.reviews.average)}
                        </div>
                        <span className="font-semibold">{product.reviews.average}</span>
                        <span className="text-muted-foreground">
                          ({product.reviews.total} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.reviews?.breakdown ? Object.entries(product.reviews.breakdown).reverse().map(([rating, count]) => (
                      <div key={rating} className="flex items-center gap-4">
                        <span className="text-sm w-12">{rating} star</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${((count as number) / ((product.reviews.total as number) || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{String(count)}</span>
                      </div>
                    )) : (
                      <div className="text-center text-muted-foreground py-8">
                        No review breakdown available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
