import Navbar from "@/components/Navbar";
import ParallaxHero from "@/components/ParallaxHero";
import MagicBentoSection from "@/components/MagicBentoSection";
import AuctionSection from "@/components/AuctionSection";
import RetailSection from "@/components/RetailSection";
import AntiPiecesSection from "@/components/AntiPiecesSection";
import { MarqueeDemo } from "@/components/magicui";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ParallaxHero />
      
      <AuctionSection />
      <RetailSection />
      <MagicBentoSection />
      <AntiPiecesSection />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            What Our Clients Say
          </h2>
          <MarqueeDemo />
        </div>
      </section>
    </div>
  );
};

export default Index;