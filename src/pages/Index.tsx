import Navbar from "@/components/Navbar";
import ParallaxHero from "@/components/ParallaxHero";
import AuctionSection from "@/components/AuctionSection";
import RetailSection from "@/components/RetailSection";
import AntiPiecesSection from "@/components/AntiPiecesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ParallaxHero />
      <AuctionSection />
      <RetailSection />
      <AntiPiecesSection />
    </div>
  );
};

export default Index;