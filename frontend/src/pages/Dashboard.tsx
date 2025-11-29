import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShimmerCard } from "@/components/reactbits/ShimmerCard";
import { GlowButton } from "@/components/reactbits/GlowButton";
import { 
  Gavel, 
  ShoppingBag, 
  Clock, 
  User, 
  LogOut,
  TrendingUp,
  DollarSign,
  Package,
  Heart,
  Plus,
  Eye,
  Home,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductListingForm from "@/components/ProductListingForm";
import ProductDetailView from "@/components/ProductDetailView";
import { useRetailProducts, useRetailDashboardStats } from "@/hooks/useRetailApi";
import { useAuctionProducts, useAuctionDashboardStats } from "@/hooks/useAuctionApi";
import { useAntiPiecesProducts, useAntiPiecesDashboardStats } from "@/hooks/useAntiPiecesApi";
import { RetailProduct } from "@/utils/retailApi";
import { AuctionProduct } from "@/utils/auctionApi";
import { AntiPiecesProduct } from "@/utils/antiPiecesApi";

type SidebarSection = 'auction' | 'retail' | 'anti-pieces';
type UserMode = 'buy' | 'sell';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SidebarSection>('auction');
  const [userMode, setUserMode] = useState<UserMode>('buy');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch retail products from API
  const { 
    data: retailData, 
    isLoading: retailLoading, 
    error: retailError,
    refetch: refetchRetailProducts
  } = useRetailProducts({
    page: 1,
    limit: 12,
    sort: 'newest'
  });


  // Fetch retail dashboard stats
  const { 
    data: retailStats, 
    isLoading: retailStatsLoading 
  } = useRetailDashboardStats();

  // Fetch auction products from API
  const { 
    data: auctionData, 
    isLoading: auctionLoading, 
    error: auctionError,
    refetch: refetchAuctionProducts
  } = useAuctionProducts({
    page: 1,
    limit: 12,
    sort: 'newest'
  });

  // Fetch auction dashboard stats
  const { 
    data: auctionStats, 
    isLoading: auctionStatsLoading 
  } = useAuctionDashboardStats();

  // Fetch anti-pieces products from API
  const { 
    data: antiPiecesData, 
    isLoading: antiPiecesLoading, 
    error: antiPiecesError,
    refetch: refetchAntiPiecesProducts
  } = useAntiPiecesProducts({
    page: 1,
    limit: 12,
    sort: 'newest'
  });

  // Fetch anti-pieces dashboard stats
  const { 
    data: antiPiecesStats, 
    isLoading: antiPiecesStatsLoading 
  } = useAntiPiecesDashboardStats();

  // Handle navigation state from various sections
  useEffect(() => {
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleBackToDashboard = () => {
    setSelectedProductId(null);
  };

  const sidebarItems = [
    {
      id: 'auction' as SidebarSection,
      label: 'Auctions',
      icon: Gavel,
      color: 'text-crimson'
    },
    {
      id: 'retail' as SidebarSection,
      label: 'Retail',
      icon: ShoppingBag,
      color: 'text-blue-600'
    },
    {
      id: 'anti-pieces' as SidebarSection,
      label: 'Anti Pieces',
      icon: Clock,
      color: 'text-purple-600'
    }
  ];

  // Transform retail product data to match the expected format
  const transformRetailProduct = (product: RetailProduct) => ({
    id: product._id,
    title: product.title,
    description: product.description,
    price: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    originalPrice: product.discount > 0 ? product.price : undefined,
    stock: product.stocks || 0,
    category: product.category,
    image: product.images?.[0]?.url || product.primaryImage?.url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    status: product.stocks > 0 ? "available" : "out_of_stock",
    auctionType: "retail" as const,
    discount: product.discount,
    condition: product.condition,
    brand: product.brand,
    model: product.model,
    viewCount: product.viewCount,
    seller: product.seller
  });

  // Transform auction product data to match the expected format
  const transformAuctionProduct = (product: AuctionProduct) => ({
    id: product._id,
    title: product.title,
    description: product.description,
    currentBid: product.startingBid,
    nextBid: product.startingBid + 100, // Mock next bid
    bids: Math.floor(Math.random() * 50) + 1, // Mock bid count
    timeLeft: product.timeLeft ? `${Math.floor(product.timeLeft / (1000 * 60 * 60))}h ${Math.floor((product.timeLeft % (1000 * 60 * 60)) / (1000 * 60))}m` : "2h 45m",
    category: product.category,
    image: product.images?.[0]?.url || product.primaryImage?.url || "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop",
    status: product.auctionStatus === 'live' ? "live" : "ended",
    auctionType: "auction" as const,
    condition: product.condition,
    brand: product.brand,
    model: product.model,
    viewCount: product.viewCount,
    seller: product.seller
  });

  // Transform anti-pieces product data to match the expected format
  const transformAntiPiecesProduct = (product: AntiPiecesProduct) => ({
    id: product._id,
    title: product.title,
    description: product.description,
    price: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
    originalPrice: product.discount > 0 ? product.price : undefined,
    age: product.age || "Vintage",
    category: product.category,
    image: product.images?.[0]?.url || product.primaryImage?.url || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    status: "antique",
    auctionType: "anti-pieces" as const,
    discount: product.discount,
    condition: product.condition,
    brand: product.brand,
    model: product.model,
    viewCount: product.viewCount,
    seller: product.seller
  });


  // Dynamic data from APIs
  const apiItems = {
    auction: auctionData?.products?.map(transformAuctionProduct) || [],
    retail: retailData?.products?.map(transformRetailProduct) || [],
    'anti-pieces': antiPiecesData?.products?.map(transformAntiPiecesProduct) || []
  };

  const currentItems = apiItems[activeSection];

  // If a product is selected, show the detail view
  if (selectedProductId) {
    const selectedItem = currentItems.find(item => item.id.toString() === selectedProductId);
    console.log('Dashboard Debug - Product Selected:', {
      selectedProductId,
      selectedItem,
      auctionType: selectedItem?.auctionType,
      activeSection,
      currentItemsLength: currentItems.length
    });
    return <ProductDetailView 
      productId={selectedProductId as string} 
      onBack={handleBackToDashboard}
      auctionType={selectedItem?.auctionType as "auction" | "retail" | "anti-pieces" || "auction"}
    />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Dark Sidebar */}
      <div className="w-80 bg-[#1A1A1D] flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
              <AvatarFallback className="bg-crimson text-white text-lg">
                {user ? getInitials(user.firstName, user.lastName) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
              <Badge variant="outline" className="mt-1 bg-transparent border-gray-600 text-gray-300">
                <User className="w-3 h-3 mr-1" />
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-1 p-6 space-y-2">
          {/* Home Button */}
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-gray-300 hover:text-white hover:bg-gray-800 mb-4"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5 mr-3 text-gray-400" />
            Back to Home
          </Button>
          
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Categories
          </h3>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start h-12 text-gray-300 hover:text-white hover:bg-gray-800 ${
                  activeSection === item.id ? 'bg-gray-700 text-white' : ''
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className={`w-5 h-5 mr-3 ${activeSection === item.id ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground capitalize">
                {activeSection.replace('-', ' ')} Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your {activeSection.replace('-', ' ')} activities
              </p>
            </div>
            
            {/* Buy/Sell Toggle and Add Product Button */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground">Mode:</span>
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={userMode === 'buy' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserMode('buy')}
                  className={userMode === 'buy' ? 'bg-crimson hover:bg-crimson/90' : ''}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button
                  variant={userMode === 'sell' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserMode('sell')}
                  className={userMode === 'sell' ? 'bg-crimson hover:bg-crimson/90' : ''}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
              
              {/* View Orders - only in buy mode */}
              {userMode === 'buy' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/orders")}
                >
                  View Orders
                </Button>
              )}
              
              {/* Refresh Button */}
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeSection === 'retail') refetchRetailProducts();
                  else if (activeSection === 'auction') refetchAuctionProducts();
                  else if (activeSection === 'anti-pieces') refetchAntiPiecesProducts();
                }}
                disabled={retailLoading || auctionLoading || antiPiecesLoading}
              >
                <Eye className="w-4 h-4 mr-2" />
                {retailLoading || auctionLoading || antiPiecesLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              {/* Add Product Button - only show in sell mode */}
              {userMode === 'sell' && (
                <Button 
                  onClick={() => setShowProductForm(true)}
                  className="bg-crimson hover:bg-crimson/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">

          {/* Dashboard Stats - Show when in sell mode */}
          {userMode === 'sell' && (
            <>
              {/* Retail Dashboard Stats */}
              {activeSection === 'retail' && retailStats && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your Products</p>
                    <p className="text-2xl font-bold text-foreground">
                      {retailStats.data.overview.userRetailProducts}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${retailStats.data.overview.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${retailStats.data.overview.averagePrice.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">
                      {retailStats.data.overview.totalRetailProducts}
                    </p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-crimson" />
                </div>
              </div>
            </div>
          )}

              {/* Auction Dashboard Stats */}
              {activeSection === 'auction' && auctionStats && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Your Auctions</p>
                        <p className="text-2xl font-bold text-foreground">
                          {auctionStats.data.overview.userAuctionProducts}
                        </p>
                      </div>
                      <Gavel className="w-8 h-8 text-crimson" />
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${auctionStats.data.overview.totalValue.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Starting Bid</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${auctionStats.data.overview.averageStartingBid.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Auctions</p>
                        <p className="text-2xl font-bold text-foreground">
                          {auctionStats.data.overview.totalAuctionProducts}
                        </p>
                      </div>
                      <Gavel className="w-8 h-8 text-crimson" />
                    </div>
                  </div>
                </div>
              )}

              {/* Anti-Pieces Dashboard Stats */}
              {activeSection === 'anti-pieces' && antiPiecesStats && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Your Antiques</p>
                        <p className="text-2xl font-bold text-foreground">
                          {antiPiecesStats.data.overview.userAntiPiecesProducts}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${antiPiecesStats.data.overview.totalValue.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${antiPiecesStats.data.overview.averagePrice.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Antiques</p>
                        <p className="text-2xl font-bold text-foreground">
                          {antiPiecesStats.data.overview.totalAntiPiecesProducts}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading States */}
          {activeSection === 'retail' && retailLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-crimson" />
                <p className="text-muted-foreground">Loading retail products...</p>
              </div>
            </div>
          )}

          {activeSection === 'auction' && auctionLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-crimson" />
                <p className="text-muted-foreground">Loading auction products...</p>
              </div>
            </div>
          )}

          {activeSection === 'anti-pieces' && antiPiecesLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-muted-foreground">Loading anti-pieces products...</p>
              </div>
            </div>
          )}

          {/* Error States */}
          {activeSection === 'retail' && retailError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-500 mb-2">Failed to load retail products</p>
                <p className="text-muted-foreground text-sm mb-4">
                  {retailError instanceof Error ? retailError.message : 'An error occurred'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchRetailProducts()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'auction' && auctionError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-500 mb-2">Failed to load auction products</p>
                <p className="text-muted-foreground text-sm mb-4">
                  {auctionError instanceof Error ? auctionError.message : 'An error occurred'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchAuctionProducts()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'anti-pieces' && antiPiecesError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-500 mb-2">Failed to load anti-pieces products</p>
                <p className="text-muted-foreground text-sm mb-4">
                  {antiPiecesError instanceof Error ? antiPiecesError.message : 'An error occurred'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchAntiPiecesProducts()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Empty States */}
          {activeSection === 'retail' && !retailLoading && !retailError && currentItems.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No retail products found</h3>
                <p className="text-muted-foreground mb-4">
                  {userMode === 'sell' ? 'Start by listing your first product!' : 'No products are currently available.'}
                </p>
                {userMode === 'sell' && (
                  <Button 
                    onClick={() => setShowProductForm(true)}
                    className="bg-crimson hover:bg-crimson/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeSection === 'auction' && !auctionLoading && !auctionError && currentItems.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No auction products found</h3>
                <p className="text-muted-foreground mb-4">
                  {userMode === 'sell' ? 'Start by creating your first auction!' : 'No auctions are currently available.'}
                </p>
                {userMode === 'sell' && (
                  <Button 
                    onClick={() => setShowProductForm(true)}
                    className="bg-crimson hover:bg-crimson/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Auction
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeSection === 'anti-pieces' && !antiPiecesLoading && !antiPiecesError && currentItems.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No anti-pieces found</h3>
                <p className="text-muted-foreground mb-4">
                  {userMode === 'sell' ? 'Start by listing your first antique!' : 'No antiques are currently available.'}
                </p>
                {userMode === 'sell' && (
                  <Button 
                    onClick={() => setShowProductForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Antique
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {((activeSection === 'retail' && !retailLoading && !retailError && currentItems.length > 0) ||
            (activeSection === 'auction' && !auctionLoading && !auctionError && currentItems.length > 0) ||
            (activeSection === 'anti-pieces' && !antiPiecesLoading && !antiPiecesError && currentItems.length > 0)) ? (
            <div>
              {/* Product Count Headers */}
              {activeSection === 'retail' && retailData && (
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Retail Products
                    </h2>
                    <p className="text-muted-foreground">
                      Showing {retailData?.products?.length || 0} of {retailData?.pagination?.total || 0} products
                    </p>
                  </div>
                  {retailData?.pagination?.pages && retailData.pagination.pages > 1 && (
                    <div className="text-sm text-muted-foreground">
                      Page {retailData.pagination.page} of {retailData.pagination.pages}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'auction' && auctionData && (
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Auction Products
                    </h2>
                    <p className="text-muted-foreground">
                      Showing {auctionData?.products?.length || 0} of {auctionData?.pagination?.total || 0} auctions
                    </p>
                  </div>
                  {auctionData?.pagination?.pages && auctionData.pagination.pages > 1 && (
                    <div className="text-sm text-muted-foreground">
                      Page {auctionData.pagination.page} of {auctionData.pagination.pages}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'anti-pieces' && antiPiecesData && (
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Anti-Pieces
                    </h2>
                    <p className="text-muted-foreground">
                      Showing {antiPiecesData?.products?.length || 0} of {antiPiecesData?.pagination?.total || 0} antiques
                    </p>
                  </div>
                  {antiPiecesData?.pagination?.pages && antiPiecesData.pagination.pages > 1 && (
                    <div className="text-sm text-muted-foreground">
                      Page {antiPiecesData.pagination.page} of {antiPiecesData.pagination.pages}
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((item) => (
              <div key={item.id}>
                <ShimmerCard 
                  className="group border-border/50"
                  shimmerColor="gold"
                >
                <div className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge 
                        variant={item.status === 'live' ? 'destructive' : item.status === 'hot' ? 'default' : item.status === 'available' ? 'default' : item.status === 'out_of_stock' ? 'destructive' : 'secondary'}
                        className={`
                          ${item.status === 'live' ? 'bg-crimson text-white animate-pulse' : ''}
                          ${item.status === 'hot' ? 'bg-gold text-charcoal' : ''}
                          ${item.status === 'available' ? 'bg-green-600 text-white' : ''}
                          ${item.status === 'out_of_stock' ? 'bg-red-600 text-white' : ''}
                          ${item.status === 'antique' ? 'bg-purple-600 text-white' : ''}
                          ${item.status === 'upcoming' ? 'bg-muted' : ''}
                        `}
                      >
                        {item.status === 'live' && <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />}
                        {item.status === 'available' ? 'IN STOCK' : 
                         item.status === 'out_of_stock' ? 'OUT OF STOCK' :
                         item.status === 'antique' ? 'ANTIQUE' : 
                         item.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl mb-2 text-foreground font-bold">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  
                  {activeSection === 'auction' && (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{item.bids} bids</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-crimson">
                        <Clock className="w-4 h-4" />
                        <span>{item.timeLeft}</span>
                      </div>
                    </div>
                  )}

                  {(activeSection === 'retail' || activeSection === 'anti-pieces') && (
                    <div className="flex items-center gap-4 mb-4">
                      {activeSection === 'retail' && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Package className="w-4 h-4" />
                          <span>{item.stock} in stock</span>
                        </div>
                      )}
                      {activeSection === 'anti-pieces' && (
                        <div className="flex items-center gap-1 text-sm text-purple-600">
                          <Heart className="w-4 h-4" />
                          <span>{item.age}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {activeSection === 'auction' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current Bid</span>
                          <span className="text-2xl font-bold text-foreground">${item.currentBid?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Next Bid</span>
                          <span className="text-lg font-semibold text-gold">${item.nextBid?.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    {(activeSection === 'retail' || activeSection === 'anti-pieces') && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <div className="text-right">
                            {item.originalPrice && item.originalPrice > item.price ? (
                              <>
                                <span className="text-lg font-bold text-foreground">${item.price?.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground line-through ml-2">${item.originalPrice?.toLocaleString()}</span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-foreground">${item.price?.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        {item.discount && item.discount > 0 && (
                          <div className="flex justify-end">
                            <Badge variant="destructive" className="text-xs">
                              {item.discount}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  {userMode === 'buy' ? (
                    <>
                      <div className="flex space-x-2">
                        <GlowButton 
                          className="flex-1" 
                          glowColor="crimson"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(item.id.toString());
                          }}
                        >
                          <Gavel className="w-4 h-4 mr-2" />
                          {activeSection === 'auction' ? 'Place Bid' : 'Buy Now'}
                        </GlowButton>
                        <Button 
                          variant="outline"
                          className="px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle favorite action
                          }}
                        >
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProductForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      List Item
                    </Button>
                  )}
                </div>
                </ShimmerCard>
              </div>
            ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Product Listing Form Modal */}
      {showProductForm && (
        <ProductListingForm onClose={() => setShowProductForm(false)} />
      )}
    </div>
  );
}
