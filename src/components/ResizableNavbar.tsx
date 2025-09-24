"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { Link } from "react-router-dom";
import { smoothScrollTo } from "@/utils/smoothScroll";

export function ResizableNavbar() {
  const navItems = [
    {
      name: "Auctions",
      link: "auctions",
    },
    {
      name: "Retail",
      link: "retail",
    },
    {
      name: "Anti-Pieces",
      link: "anti-pieces",
    },
    {
      name: "About",
      link: "about",
    },
  ];

  const handleNavClick = (link: string) => {
    smoothScrollTo(link);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} onItemClick={() => {}} />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <NavbarButton variant="secondary">
                Login
              </NavbarButton>
            </Link>
            <Link to="/signup">
              <NavbarButton variant="primary">
                Join Auction
              </NavbarButton>
            </Link>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <button
                key={`mobile-link-${idx}`}
                onClick={() => {
                  handleNavClick(item.link);
                  setIsMobileMenuOpen(false);
                }}
                className="relative text-neutral-600 dark:text-neutral-300 text-left"
              >
                <span className="block">{item.name}</span>
              </button>
            ))}
            <div className="flex w-full flex-col gap-4">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full"
              >
                <NavbarButton
                  variant="secondary"
                  className="w-full"
                >
                  Login
                </NavbarButton>
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full"
              >
                <NavbarButton
                  variant="primary"
                  className="w-full"
                >
                  Join Auction
                </NavbarButton>
              </Link>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
