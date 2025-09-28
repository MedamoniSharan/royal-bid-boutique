import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductListingForm from "@/components/ProductListingForm";
import ProductDetailView from "@/components/ProductDetailView";

type SidebarSection = 'auction' | 'retail' | 'anti-pieces';
type UserMode = 'buy' | 'sell';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SidebarSection>('auction');
  const [userMode, setUserMode] = useState<UserMode>('buy');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

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

  // If a product is selected, show the detail view
  if (selectedProductId) {
    return <ProductDetailView productId={selectedProductId} onBack={handleBackToDashboard} />;
  }

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
      { id: 1, title: "Vintage Rolex Submariner", currentBid: 15500, bids: 23, timeLeft: "2h 45m", category: "Watches" },
      { id: 2, title: "Rare Pokémon Card Set", currentBid: 8900, bids: 45, timeLeft: "5h 12m", category: "Collectibles" },
      { id: 3, title: "Abstract Oil Painting", currentBid: 3200, bids: 12, timeLeft: "1d 8h", category: "Art" }
    ],
    retail: [
      { id: 1, title: "Designer Handbag", price: 1200, stock: 5, category: "Fashion" },
      { id: 2, title: "Smart Watch", price: 299, stock: 12, category: "Electronics" },
      { id: 3, title: "Artisan Jewelry", price: 450, stock: 8, category: "Accessories" }
    ],
    'anti-pieces': [
      { id: 1, title: "Antique Vase", price: 800, age: "18th Century", category: "Ceramics" },
      { id: 2, title: "Vintage Book Collection", price: 1200, age: "19th Century", category: "Books" },
      { id: 3, title: "Classic Pocket Watch", price: 650, age: "1920s", category: "Timepieces" }
    ]
  };

  const currentItems = mockItems[activeSection];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
              <AvatarFallback className="bg-crimson text-white text-lg">
                {user ? getInitials(user.firstName, user.lastName) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1">
                <User className="w-3 h-3 mr-1" />
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-1 p-6 space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h3>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-12 ${
                  activeSection === item.id ? 'bg-crimson hover:bg-crimson/90' : ''
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((item) => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProductClick(item.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <CardDescription>
                    {activeSection === 'auction' && (
                      <div className="flex items-center text-crimson">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.timeLeft} left
                      </div>
                    )}
                    {activeSection === 'retail' && (
                      <div className="flex items-center text-blue-600">
                        <Package className="w-4 h-4 mr-1" />
                        {item.stock} in stock
                      </div>
                    )}
                    {activeSection === 'anti-pieces' && (
                      <div className="flex items-center text-purple-600">
                        <Heart className="w-4 h-4 mr-1" />
                        {item.age}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeSection === 'auction' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Bid</span>
                          <span className="font-semibold">${item.currentBid?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Bids</span>
                          <span className="font-semibold">{item.bids}</span>
                        </div>
                      </>
                    )}
                    {(activeSection === 'retail' || activeSection === 'anti-pieces') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="font-semibold text-lg">${item.price?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    {userMode === 'buy' ? (
                      <>
                        <Button 
                          className="flex-1 bg-crimson hover:bg-crimson/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle buy action
                          }}
                        >
                          {activeSection === 'auction' ? 'Place Bid' : 'Buy Now'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle favorite action
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
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
                </CardContent>
              </Card>
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
