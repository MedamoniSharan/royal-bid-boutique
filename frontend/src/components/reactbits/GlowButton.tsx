import React from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  glowColor?: "gold" | "crimson" | "royal" | "white";
  size?: "sm" | "md" | "lg";
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, children, glowColor = "gold", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none overflow-hidden group border-2",
          
          // Size variants
          {
            "px-4 py-2 text-sm rounded-lg": size === "sm",
            "px-6 py-3 text-base rounded-xl": size === "md",
            "px-8 py-4 text-lg rounded-2xl": size === "lg",
          },
          
          // Glow color variants
          {
            "border-gold text-gold hover:text-charcoal hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] before:bg-gold": glowColor === "gold",
            "border-crimson text-crimson hover:text-white hover:shadow-[0_0_30px_rgba(220,20,60,0.6)] before:bg-crimson": glowColor === "crimson",
            "border-royal-blue text-royal-blue hover:text-white hover:shadow-[0_0_30px_rgba(26,31,113,0.6)] before:bg-royal-blue": glowColor === "royal",
            "border-white text-white hover:text-charcoal hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] before:bg-white": glowColor === "white",
          },
          
          // Hover fill animation
          "before:absolute before:inset-0 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300 before:z-0",
          
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {/* Pulse ring effect */}
        <div className={cn(
          "absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 group-hover:animate-ping",
          {
            "bg-gold/20": glowColor === "gold",
            "bg-crimson/20": glowColor === "crimson", 
            "bg-royal-blue/20": glowColor === "royal",
            "bg-white/20": glowColor === "white",
          }
        )}></div>
      </button>
    );
  }
);
GlowButton.displayName = "GlowButton";

export { GlowButton };