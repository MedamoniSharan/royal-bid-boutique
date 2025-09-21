"use client";
import React from "react";
import { HeroParallax } from "./ui/hero-parallax";

export function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}

export const products = [
  {
    title: "Rare Diamond Collection",
    link: "/auctions/diamond-collection",
    thumbnail:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Vintage Rolex Watch",
    link: "/auctions/vintage-rolex",
    thumbnail:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Picasso Masterpiece",
    link: "/auctions/picasso-painting",
    thumbnail:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Antique Persian Rug",
    link: "/auctions/persian-rug",
    thumbnail:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Luxury Sports Car",
    link: "/auctions/sports-car",
    thumbnail:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Rare Wine Collection",
    link: "/auctions/wine-collection",
    thumbnail:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Vintage Jewelry Set",
    link: "/auctions/vintage-jewelry",
    thumbnail:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Classic Art Sculpture",
    link: "/auctions/art-sculpture",
    thumbnail:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Luxury Timepiece",
    link: "/auctions/luxury-watch",
    thumbnail:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Antique Furniture",
    link: "/auctions/antique-furniture",
    thumbnail:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Exotic Sports Car",
    link: "/auctions/exotic-car",
    thumbnail:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Premium Whiskey Collection",
    link: "/auctions/whiskey-collection",
    thumbnail:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Designer Handbag",
    link: "/auctions/designer-handbag",
    thumbnail:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Modern Art Painting",
    link: "/auctions/modern-art",
    thumbnail:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop&crop=center",
  },
  {
    title: "Luxury Yacht",
    link: "/auctions/luxury-yacht",
    thumbnail:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop&crop=center",
  },
];
