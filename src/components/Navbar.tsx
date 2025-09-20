import { AnimatedButton } from "@/components/reactbits/AnimatedButton";
import { GlowButton } from "@/components/reactbits/GlowButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { Gavel, ShoppingBag, Crown, User, Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-border/50 shadow-elegant rounded-lg mx-4 mt-2" style={{width: 'calc(100% - 2rem)'}}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AuctionHouse</h1>
              <div className="text-xs text-muted-foreground">Premium Collections</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground hover:text-primary">
                    <Gavel className="w-4 h-4 mr-2" />
                    Auctions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-80">
                      <div className="grid gap-2">
                        <NavigationMenuLink className="block p-3 rounded-md hover:bg-muted cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-crimson rounded-full animate-pulse"></div>
                            <span className="font-medium">Live Auctions</span>
                            <Badge variant="destructive" className="text-xs">23 Active</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Current bidding opportunities</p>
                        </NavigationMenuLink>
                        <NavigationMenuLink className="block p-3 rounded-md hover:bg-muted cursor-pointer">
                          <div className="font-medium mb-1">Upcoming Auctions</div>
                          <p className="text-sm text-muted-foreground">Preview upcoming lots</p>
                        </NavigationMenuLink>
                        <NavigationMenuLink className="block p-3 rounded-md hover:bg-muted cursor-pointer">
                          <div className="font-medium mb-1">Past Results</div>
                          <p className="text-sm text-muted-foreground">Historical sales data</p>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground hover:text-primary">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Retail
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-80">
                      <div className="grid gap-2">
                        <NavigationMenuLink className="block p-3 rounded-md hover:bg-muted cursor-pointer">
                          <div className="font-medium mb-1">New Arrivals</div>
                          <p className="text-sm text-muted-foreground">Latest premium additions</p>
                        </NavigationMenuLink>
                        <NavigationMenuLink className="block p-3 rounded-md hover:bg-muted cursor-pointer">
                          <div className="font-medium mb-1">Categories</div>
                          <p className="text-sm text-muted-foreground">Browse by collection</p>
                        </NavigationMenuLink>
                        <NavigationMenuLink className="block p-3 rounded-md hover:bg-muted cursor-pointer">
                          <div className="font-medium mb-1">Limited Editions</div>
                          <p className="text-sm text-muted-foreground">Exclusive releases</p>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground hover:text-primary">
                    <Crown className="w-4 h-4 mr-2" />
                    Anti-Pieces
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-80">
                      <div className="p-3 bg-gold/10 rounded-md border border-gold/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-4 h-4 text-gold" />
                          <span className="font-medium text-gold">Exclusive Access</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Membership required to view collection
                        </p>
                        <Button size="sm" className="bg-gold text-charcoal hover:bg-gold-light px-6 py-3">
                          Request Access
                        </Button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <AnimatedButton variant="secondary" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </AnimatedButton>
            
            <AnimatedButton variant="secondary" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4" />
            </AnimatedButton>

            <GlowButton size="sm" glowColor="crimson" className="px-4">
              <Gavel className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Join Auction</span>
            </GlowButton>

            <Sheet>
              <SheetTrigger asChild>
                <AnimatedButton variant="secondary" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </AnimatedButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-6 mt-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Auctions
                    </h3>
                    <div className="space-y-2 ml-6">
                      <a href="#" className="block text-sm text-muted-foreground hover:text-foreground">Live Auctions</a>
                      <a href="#" className="block text-sm text-muted-foreground hover:text-foreground">Upcoming</a>
                      <a href="#" className="block text-sm text-muted-foreground hover:text-foreground">Past Results</a>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Retail
                    </h3>
                    <div className="space-y-2 ml-6">
                      <a href="#" className="block text-sm text-muted-foreground hover:text-foreground">New Arrivals</a>
                      <a href="#" className="block text-sm text-muted-foreground hover:text-foreground">Categories</a>
                      <a href="#" className="block text-sm text-muted-foreground hover:text-foreground">Limited Editions</a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-gold" />
                      Anti-Pieces
                    </h3>
                    <div className="p-3 bg-gold/10 rounded-md border border-gold/30">
                      <p className="text-sm text-muted-foreground mb-3">
                        Exclusive membership required
                      </p>
                      <GlowButton size="sm" glowColor="gold" className="w-full">
                        Request Access
                      </GlowButton>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}