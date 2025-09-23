import { ResizableNavbar } from "@/components/ResizableNavbar";
import ParallaxHero from "@/components/ParallaxHero";
import MagicBentoSection from "@/components/MagicBentoSection";
import AuctionSection from "@/components/AuctionSection";
import { ThreeDMarqueeDemo } from "@/components/ThreeDMarqueeDemo";
import RetailSection from "@/components/RetailSection";
import { HeroParallaxDemo } from "@/components/HeroParallaxDemo";
import AntiPiecesSection from "@/components/AntiPiecesSection";
import { GoogleGeminiEffectDemo } from "@/components/GoogleGeminiEffectDemo";
import { MarqueeDemo } from "@/components/magicui";
import { SparklesFooter } from "@/components/SparklesFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ResizableNavbar />
      <ParallaxHero />
      
      <section id="auctions">
        <AuctionSection />
      </section>
      <ThreeDMarqueeDemo />
      <section id="retail">
        <RetailSection />
      </section>
      <MagicBentoSection />
      <HeroParallaxDemo />
      <section id="anti-pieces">
        <AntiPiecesSection />
      </section>
      <GoogleGeminiEffectDemo />
      
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            What Our Clients Say
          </h2>
          <MarqueeDemo />
        </div>
      </section>
      
      <SparklesFooter />
    </div>
  );
};

export default Index;