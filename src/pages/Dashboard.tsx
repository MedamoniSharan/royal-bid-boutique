import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
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
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductListingForm from "@/components/ProductListingForm";
import ProductDetailView from "@/components/ProductDetailView";

type SidebarSection = 'auction' | 'retail' | 'anti-pieces';
type UserMode = 'buy' | 'sell';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SidebarSection>('auction');
  const [userMode, setUserMode] = useState<UserMode>('buy');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

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

  const handleProductClick = (productId: number) => {
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

  const mockItems = {
    auction: [
      { id: 1, title: "Vintage Rolex Submariner", description: "1960s Classic Diving Watch", currentBid: 15500, nextBid: 16000, bids: 23, timeLeft: "2h 45m", category: "Watches", image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop", status: "live", auctionType: "auction" },
      { id: 2, title: "Rare Pokémon Card Set", description: "1st Edition Base Set Charizard", currentBid: 8900, nextBid: 9500, bids: 45, timeLeft: "5h 12m", category: "Collectibles", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", status: "hot", auctionType: "auction" },
      { id: 3, title: "Abstract Oil Painting", description: "Original Contemporary Art Piece", currentBid: 3200, nextBid: 3500, bids: 12, timeLeft: "1d 8h", category: "Art", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop", status: "upcoming", auctionType: "auction" }
    ],
    retail: [
      { id: 1, title: "Designer Handbag", description: "Luxury Leather Handbag", price: 1200, stock: 5, category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", status: "available", auctionType: "fixed" },
      { id: 2, title: "Smart Watch", description: "Latest Technology Smart Watch", price: 299, stock: 12, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", status: "available", auctionType: "fixed" },
      { id: 3, title: "Artisan Jewelry", description: "Handcrafted Premium Jewelry", price: 450, stock: 8, category: "Accessories", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop", status: "available", auctionType: "fixed" }
    ],
    'anti-pieces': [
      { id: 1, title: "Antique Vase", description: "18th Century Ceramic Vase", price: 800, age: "18th Century", category: "Ceramics", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", status: "antique", auctionType: "fixed" },
      { id: 2, title: "Vintage Book Collection", description: "Rare 19th Century Literature", price: 1200, age: "19th Century", category: "Books", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop", status: "antique", auctionType: "fixed" },
      { id: 3, title: "Classic Pocket Watch", description: "Vintage 1920s Timepiece", price: 650, age: "1920s", category: "Timepieces", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", status: "antique", auctionType: "fixed" }
    ]
  };

  const currentItems = mockItems[activeSection];

  // If a product is selected, show the detail view
  if (selectedProductId) {
    const selectedItem = currentItems.find(item => item.id === selectedProductId);
    return <ProductDetailView 
      productId={selectedProductId} 
      onBack={handleBackToDashboard}
      auctionType={selectedItem?.auctionType as "auction" | "fixed" | "both" || "auction"}
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
                        variant={item.status === 'live' ? 'destructive' : item.status === 'hot' ? 'default' : item.status === 'available' ? 'default' : 'secondary'}
                        className={`
                          ${item.status === 'live' ? 'bg-crimson text-white animate-pulse' : ''}
                          ${item.status === 'hot' ? 'bg-gold text-charcoal' : ''}
                          ${item.status === 'available' ? 'bg-blue-600 text-white' : ''}
                          ${item.status === 'antique' ? 'bg-purple-600 text-white' : ''}
                          ${item.status === 'upcoming' ? 'bg-muted' : ''}
                        `}
                      >
                        {item.status === 'live' && <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />}
                        {item.status === 'available' ? 'IN STOCK' : item.status === 'antique' ? 'ANTIQUE' : item.status.toUpperCase()}
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="text-2xl font-bold text-foreground">${item.price?.toLocaleString()}</span>
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
                            handleProductClick(item.id);
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
      </div>

      {/* Product Listing Form Modal */}
      {showProductForm && (
        <ProductListingForm onClose={() => setShowProductForm(false)} />
      )}
    </div>
  );
}
