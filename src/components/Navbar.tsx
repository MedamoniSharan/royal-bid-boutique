import { Button } from "@/components/ui/button";
import { Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-4 z-50 transition-all duration-300 ease-in-out ${
      isScrolled ? 'left-16 right-16' : 'left-4 right-4'
    }`}>
      {/* Outer container with dark gray background and rounded corners */}
      <div className={`bg-gray-800 rounded-3xl transition-all duration-300 ease-in-out ${
        isScrolled ? 'p-1 scale-90' : 'p-2 scale-100'
      }`}>
        {/* Inner navbar with darker background */}
        <div className={`bg-gray-900 rounded-2xl transition-all duration-300 ease-in-out ${
          isScrolled ? 'px-4 py-2' : 'px-6 py-3'
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3 hover:scale-105 transition-all duration-200 cursor-pointer">
              {/* Logo Icon - Blue geometric shape */}
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
              </div>
              {/* Logo Text */}
              <span className="text-white font-semibold text-lg">AuctionHouse</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-400 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                Auctions
              </a>
              <a href="#" className="text-gray-400 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105">
                Retail
              </a>
              <a href="#" className="text-gray-400 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105">
                Anti-Pieces
              </a>
              <a href="#" className="text-gray-400 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105">
                About
              </a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Join Auction button */}
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                Join Auction
              </Button>
              
              {/* Theme toggle */}
              <Button variant="outline" size="sm" className="w-10 h-10 rounded-full border-gray-600 hover:bg-gray-800 hover:scale-105 transition-all duration-200">
                <Moon className="w-4 h-4 text-white" />
              </Button>

              {/* Mobile menu */}
              <Button variant="outline" size="sm" className="md:hidden w-10 h-10 rounded-full border-gray-600 hover:bg-gray-800 hover:scale-105 transition-all duration-200">
                <Menu className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}