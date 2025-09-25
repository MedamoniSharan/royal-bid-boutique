import { Button } from "@/components/ui/button";
import { Moon, Menu, User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
              {isAuthenticated ? (
                <>
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-10 h-10 rounded-full border-gray-600 hover:bg-gray-800 hover:scale-105 transition-all duration-200">
                        <User className="w-4 h-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-600">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-gray-600" />
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Logout Button */}
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="border-red-600 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>

                  {/* Join Auction button */}
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                    Join Auction
                  </Button>
                </>
              ) : (
                <>
                  {/* Login/Signup buttons */}
                  <Link to="/login">
                    <Button variant="outline" className="border-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-200">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              
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