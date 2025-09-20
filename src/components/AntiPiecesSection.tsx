import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, Shield, Crown } from "lucide-react";
import antiPiecesImage from "@/assets/anti-pieces.jpg";

const antiPieces = [
  {
    id: 1,
    title: "The Midnight Manuscript",
    description: "14th Century Illuminated Religious Text",
    value: "PRICELESS",
    rarity: "1 of 1",
    category: "Ancient Artifacts",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=400&fit=crop",
    status: "Available"
  },
  {
    id: 2,
    title: "Emperor's Ruby Crown",
    description: "18th Century Royal Dynasty Regalia",
    value: "$2.8M",
    rarity: "Unique",
    category: "Royal Collections",
    image: "https://images.unsplash.com/photo-1595503143862-c4b7de2dd6b7?w=500&h=400&fit=crop",
    status: "Reserved"
  },
  {
    id: 3,
    title: "Tesla's Lost Prototype",
    description: "Original Wireless Power Transmission Device",
    value: "INQUIRY",
    rarity: "1 of 3",
    category: "Scientific Marvels",
    image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&h=400&fit=crop",
    status: "Under Review"
  }
];

export default function AntiPiecesSection() {
  return (
    <section className="py-20 bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-gold" />
            <h2 className="text-6xl font-bold">
              Anti-<span className="text-gold">Pieces</span>
            </h2>
            <Crown className="w-8 h-8 text-gold" />
          </div>
          <p className="text-xl text-white/80 max-w-4xl mx-auto mb-8">
            Exclusive collection of the world's rarest artifacts, one-of-a-kind treasures, and historically significant pieces
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gold">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Museum Quality</span>
            </div>
            <div className="w-1 h-1 bg-gold rounded-full"></div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Private Collection</span>
            </div>
            <div className="w-1 h-1 bg-gold rounded-full"></div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span>Authenticated</span>
            </div>
          </div>
        </div>

        {/* Hero Showcase */}
        <div 
          className="relative rounded-3xl overflow-hidden mb-16 h-96 bg-cover bg-center shadow-premium"
          style={{ backgroundImage: `url(${antiPiecesImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 to-transparent flex items-center">
            <div className="max-w-2xl p-12">
              <Badge className="bg-gold text-charcoal mb-4 text-sm px-3 py-1">
                EXCLUSIVE ACCESS REQUIRED
              </Badge>
              <h3 className="text-4xl font-bold mb-4">Curator's Choice</h3>
              <p className="text-lg text-white/90 mb-6">
                These pieces represent the pinnacle of human achievement, artistic mastery, and historical significance. 
                Each item undergoes rigorous authentication and provenance verification.
              </p>
              <Button className="bg-gold text-charcoal hover:bg-gold-light px-6 py-3">
                Request Access
              </Button>
            </div>
          </div>
        </div>

        {/* Anti-Pieces Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {antiPieces.map((piece, index) => (
            <Card key={piece.id} className="bg-charcoal-light border-gold/30 hover:border-gold/60 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={piece.image} 
                    alt={piece.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <Badge 
                      className={`
                        ${piece.status === 'Available' ? 'bg-gold text-charcoal' : ''}
                        ${piece.status === 'Reserved' ? 'bg-crimson text-white' : ''}
                        ${piece.status === 'Under Review' ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {piece.status}
                    </Badge>
                  </div>

                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-gold border-gold/50">
                      {piece.rarity}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-gold text-sm mb-1">{piece.category}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{piece.title}</h3>
                    <p className="text-white/80 text-sm mb-3">{piece.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-gold">{piece.value}</div>
                      <Button 
                        size="sm" 
                        className="bg-gold/20 text-gold border border-gold/50 hover:bg-gold hover:text-charcoal"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Inquire
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 border border-gold/30 rounded-2xl bg-gold/5">
          <Lock className="w-12 h-12 text-gold mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Exclusive Membership Required</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Access to Anti-Pieces requires verification of collecting credentials and financial capacity. 
            Join our exclusive collectors' circle to view the complete catalog.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gold text-charcoal hover:bg-gold-light px-8 py-3">
              Apply for Membership
            </Button>
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-charcoal px-8 py-3">
              Contact Curator
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}