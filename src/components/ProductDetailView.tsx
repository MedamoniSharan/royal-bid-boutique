import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

const mockProduct: ProductDetail = {
  id: 1,
  title: "Vintage Rolex Submariner 1960s",
  description: "Classic diving watch in excellent condition",
  longDescription: "This vintage Rolex Submariner from the 1960s is a true collector's piece. Featuring the iconic Oyster case, automatic movement, and the famous Mercedes hands, this timepiece represents the golden age of dive watches. The watch has been professionally serviced and comes with authentication papers.",
  category: "Watches",
  currentPrice: 15500,
  originalPrice: 16500,
  discount: 6,
  images: [
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1566479179817-c0d9d0f6d8b9?w=600&h=600&fit=crop"
  ],
  seller: {
    name: "Luxury Timepieces",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    totalSales: 1247
  },
  condition: "Excellent",
  tags: ["Vintage", "Luxury", "Collectible", "Authentic", "Serviced"],
  auctionType: "both",
  auctionDetails: {
    currentBid: 15500,
    startingBid: 12000,
    bidCount: 23,
    timeLeft: "2d 14h 32m",
    buyNowPrice: 18000
  },
  features: [
    "Original Rolex Oyster case",
    "Automatic movement",
    "Water resistant to 200m",
    "Professional authentication included",
    "Recently serviced by authorized dealer",
    "Original box and papers"
  ],
  specifications: {
    "Brand": "Rolex",
    "Model": "Submariner",
    "Year": "1960s",
    "Movement": "Automatic",
    "Case Material": "Stainless Steel",
    "Dial Color": "Black",
    "Water Resistance": "200m",
    "Case Diameter": "40mm"
  },
  shipping: {
    free: true,
    estimatedDelivery: "3-5 business days",
    returnPolicy: "30 days return policy"
  },
  reviews: {
    average: 4.8,
    total: 156,
    breakdown: {
      5: 120,
      4: 28,
      3: 6,
      2: 2,
      1: 0
    }
  },
  bidHistory: [
    {
      id: 1,
      bidder: {
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        isVerified: true
      },
      amount: 15500,
      timestamp: "2 hours ago",
      isWinningBid: true
    },
    {
      id: 2,
      bidder: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        isVerified: true
      },
      amount: 15200,
      timestamp: "3 hours ago",
      isWinningBid: false
    },
    {
      id: 3,
      bidder: {
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        isVerified: false
      },
      amount: 15000,
      timestamp: "4 hours ago",
      isWinningBid: false
    },
    {
      id: 4,
      bidder: {
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        isVerified: true
      },
      amount: 14800,
      timestamp: "5 hours ago",
      isWinningBid: false
    },
    {
      id: 5,
      bidder: {
        name: "David Brown",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        isVerified: true
      },
      amount: 14500,
      timestamp: "6 hours ago",
      isWinningBid: false
    }
  ]
};

export default function ProductDetailView({ productId, onBack, auctionType = "auction" }: { productId: string | number, onBack: () => void, auctionType?: "auction" | "fixed" | "both" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(
    auctionType === "auction" || auctionType === "both" ? "bidHistory" : "description"
  );

  // For demo purposes, using mock data
  const product = { ...mockProduct, auctionType };

  const handleAddToCart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const formatPrice = (price: number) => {
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

              <div className="space-y-2">
                {product.auctionType === "auction" || product.auctionType === "both" ? (
                  <>
                    <Button 
                      className="w-full bg-crimson hover:bg-crimson/90 h-12"
                      onClick={handleAddToCart}
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
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
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
                    {Object.entries(product.reviews.breakdown).reverse().map(([rating, count]) => (
                      <div key={rating} className="flex items-center gap-4">
                        <span className="text-sm w-12">{rating} star</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${(count / product.reviews.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{count}</span>
                      </div>
                    ))}
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
