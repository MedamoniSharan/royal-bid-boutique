import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Gavel, TrendingUp } from "lucide-react";

const auctionItems = [
  {
    id: 1,
    title: "Vintage Rolex Submariner",
    description: "1960s Classic Diving Watch",
    currentBid: 15500,
    nextBid: 16000,
    bids: 23,
    timeLeft: "2h 45m",
    category: "Watches",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop",
    status: "live"
  },
  {
    id: 2,
    title: "Rare Pokémon Card Set",
    description: "1st Edition Base Set Charizard",
    currentBid: 8900,
    nextBid: 9500,
    bids: 45,
    timeLeft: "5h 12m",
    category: "Collectibles",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    status: "hot"
  },
  {
    id: 3,
    title: "Abstract Oil Painting",
    description: "Original Contemporary Art Piece",
    currentBid: 3200,
    nextBid: 3500,
    bids: 12,
    timeLeft: "1d 8h",
    category: "Art",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    status: "upcoming"
  }
];

export default function AuctionSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Live <span className="text-crimson">Auctions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bid on exclusive items from our curated collection of luxury goods, collectibles, and rare finds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctionItems.map((item, index) => (
            <Card key={item.id} className="group hover:shadow-premium transition-all duration-300 animate-fade-in-up border-border/50" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant={item.status === 'live' ? 'destructive' : item.status === 'hot' ? 'default' : 'secondary'}
                      className={`
                        ${item.status === 'live' ? 'bg-crimson text-white animate-pulse' : ''}
                        ${item.status === 'hot' ? 'bg-gold text-charcoal' : ''}
                        ${item.status === 'upcoming' ? 'bg-muted' : ''}
                      `}
                    >
                      {item.status === 'live' && <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />}
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="text-xl mb-2 text-foreground">{item.title}</CardTitle>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                
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

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Bid</span>
                    <span className="text-2xl font-bold text-foreground">${item.currentBid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Next Bid</span>
                    <span className="text-lg font-semibold text-gold">${item.nextBid.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 space-y-3">
                <Button className="w-full bg-gradient-urgent hover:scale-105 transition-transform shadow-gold">
                  <Gavel className="w-4 h-4 mr-2" />
                  Place Bid
                </Button>
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-charcoal">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4">
            View All Auctions
          </Button>
        </div>
      </div>
    </section>
  );
}