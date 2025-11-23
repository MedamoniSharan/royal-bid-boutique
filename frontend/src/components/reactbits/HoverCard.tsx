import React from "react";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "premium" | "glow" | "tilt" | "lift";
  hover?: "scale" | "lift" | "glow" | "tilt" | "border";
}

const HoverCard = React.forwardRef<HTMLDivElement, HoverCardProps>(
  ({ className, variant = "default", hover = "scale", children, ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          "relative overflow-hidden transition-all duration-300 group cursor-pointer",
          
          // Variant styles
          {
            "bg-card border border-border rounded-lg": variant === "default" || variant === "tilt",
            "bg-gradient-to-br from-royal-blue/5 to-gold/5 border border-gold/20 rounded-xl backdrop-blur-sm": variant === "premium",
            "bg-card border border-border rounded-lg shadow-elegant": variant === "glow",
            "bg-card border border-border rounded-lg shadow-lg": variant === "lift",
          },
          
          // Hover effects
          {
            "hover:scale-105 hover:shadow-lg": hover === "scale",
            "hover:translate-y-[-8px] hover:shadow-xl": hover === "lift",
            "hover:shadow-premium hover:border-gold/40": hover === "glow",
            "hover:rotate-1 hover:scale-105": hover === "tilt",
            "hover:border-gold/60 hover:shadow-gold": hover === "border",
          },
          
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        
        {/* Glow overlay for premium variant */}
        {variant === "premium" && (
          <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Corner accent for premium */}
        {variant === "premium" && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-gold/30 group-hover:border-t-gold/60 transition-colors duration-300"></div>
        )}
      </div>
    );
  }
);
HoverCard.displayName = "HoverCard";

export { HoverCard };