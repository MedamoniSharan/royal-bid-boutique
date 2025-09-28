import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star } from "lucide-react";
import retailImage from "@/assets/retail-showcase.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const retailProducts = [
  {
    id: 1,
    name: "Luxury Leather Wallet",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 124,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Premium Silk Scarf",
    price: 180,
    rating: 4.9,
    reviews: 89,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop",
    badge: "New Arrival"
  },
  {
    id: 3,
    name: "Artisan Coffee Set",
    price: 145,
    originalPrice: 195,
    rating: 4.7,
    reviews: 203,
    category: "Home",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
    badge: "Limited Edition"
  },
  {
    id: 4,
    name: "Designer Sunglasses",
    price: 250,
    rating: 4.6,
    reviews: 156,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    badge: "Trending"
  }
];

export default function RetailSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (productId: number) => {
    if (isAuthenticated) {
      navigate('/dashboard', { state: { section: 'retail', productId } });
    } else {
      navigate('/login', { state: { returnTo: '/dashboard', section: 'retail', productId } });
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Banner */}
        <div 
          className="relative rounded-2xl overflow-hidden mb-16 h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${retailImage})` }}
        >
          <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl">
              <h2 className="text-5xl font-bold mb-4">Premium Retail</h2>
              <p className="text-xl opacity-90 mb-6">Curated luxury products available for immediate purchase</p>
              <Button size="lg" className="bg-gold text-charcoal hover:bg-gold-light px-8 py-4">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Explore Collection
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {retailProducts.map((product, index) => (
            <Card key={product.id} className="group hover:shadow-elegant transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge 
                      className={`
                        ${product.badge === 'Best Seller' ? 'bg-gold text-charcoal' : ''}
                        ${product.badge === 'New Arrival' ? 'bg-crimson text-white' : ''}
                        ${product.badge === 'Limited Edition' ? 'bg-charcoal text-white' : ''}
                        ${product.badge === 'Trending' ? 'bg-gold text-charcoal' : ''}
                      `}
                    >
                      {product.badge}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 text-foreground">{product.name}</h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                  {product.originalPrice && (
                    <Badge className="bg-crimson text-white text-xs">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full bg-charcoal hover:bg-charcoal/90 text-white"
                  onClick={() => handleAddToCart(product.id)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-charcoal px-8 py-4">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}