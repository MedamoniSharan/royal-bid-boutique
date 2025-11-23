import { AnimatedText } from "@/components/reactbits/AnimatedText";
import { Button } from "@/components/ui/button";
import Orb from "@/components/Orb";
import { useEffect, useState } from "react";

export default function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Orb Background */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <Orb
          hue={0}
          hoverIntensity={0.2}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>

      {/* Floating Particles */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.8}px)`,
        }}
      >
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-60 right-1/3 w-2 h-2 bg-pink-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <div 
            className="animate-fade-in-up pointer-events-none"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            <AnimatedText 
              text="Premium"
              variant="fade-in"
              className="text-6xl md:text-8xl font-bold mb-2 tracking-tight block"
              delay={200}
            />
            <AnimatedText
              text="Auctions"
              variant="shimmer"
              className="text-6xl md:text-8xl font-bold mb-6 tracking-tight block"
              delay={800}
            />
            
            <AnimatedText
              text="Discover rare collectibles, luxury items, and exclusive pieces in our premier auction house"
              variant="slide-up"
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 block"
              delay={1200}
            />
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            <Button 
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              Join Live Auction
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full hover:scale-105 transition-all duration-200"
            >
              Browse Collection
            </Button>
          </div>

        </div>
      </div>

    </section>
  );
}