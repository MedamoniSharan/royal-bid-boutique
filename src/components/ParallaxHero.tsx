import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Gavel, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-auction.jpg";

export default function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-hero">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              Premium
              <span className="block bg-gradient-premium bg-clip-text text-transparent animate-gold-shimmer">
                Auctions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Discover rare collectibles, luxury items, and exclusive pieces in our premier auction house
            </p>
          </div>

          {/* Live Auction Counter */}
          <Card className="inline-block p-8 mb-12 bg-black/20 backdrop-blur-md border-gold/30 animate-pulse-glow">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Clock className="w-6 h-6 text-gold" />
              <span className="text-gold font-semibold text-lg">NEXT AUCTION ENDS IN</span>
            </div>
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-gold text-sm">HOURS</div>
              </div>
              <div className="text-4xl font-bold text-gold">:</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-gold text-sm">MINUTES</div>
              </div>
              <div className="text-4xl font-bold text-gold">:</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-gold text-sm">SECONDS</div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="bg-gradient-urgent hover:scale-105 transition-transform shadow-premium px-8 py-4 text-lg">
              <Gavel className="w-6 h-6 mr-2" />
              Join Live Auction
            </Button>
            
            <Button variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-charcoal transition-all px-8 py-4 text-lg">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Shop Retail
            </Button>
            
            <Button variant="secondary" size="lg" className="bg-charcoal/80 text-gold hover:bg-charcoal transition-all px-8 py-4 text-lg">
              <Star className="w-6 h-6 mr-2" />
              View Anti-Pieces
            </Button>
          </div>

          {/* Floating Stats */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden md:flex gap-12 text-center">
            <div className="animate-parallax-float">
              <div className="text-3xl font-bold text-gold">2,500+</div>
              <div className="text-sm opacity-80">Active Bidders</div>
            </div>
            <div className="animate-parallax-float" style={{ animationDelay: "1s" }}>
              <div className="text-3xl font-bold text-gold">$2.8M</div>
              <div className="text-sm opacity-80">Items Sold</div>
            </div>
            <div className="animate-parallax-float" style={{ animationDelay: "2s" }}>
              <div className="text-3xl font-bold text-gold">98%</div>
              <div className="text-sm opacity-80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gold rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}