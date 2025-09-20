import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "shimmer" | "glow" | "pulse";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group",
          
          // Size variants
          {
            "px-3 py-1.5 text-sm rounded-md": size === "sm",
            "px-4 py-2 text-base rounded-lg": size === "md",
            "px-6 py-3 text-lg rounded-xl": size === "lg",
          },
          
          // Variant styles
          {
            // Primary - Royal blue with gold shimmer
            "bg-gradient-to-r from-royal-blue to-royal-blue-light text-white hover:shadow-premium hover:scale-105 focus:ring-royal-blue before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700": variant === "primary",
            
            // Secondary - Charcoal with subtle animation
            "bg-charcoal text-white border border-charcoal-light hover:bg-charcoal-light hover:shadow-elegant hover:scale-105 focus:ring-charcoal": variant === "secondary",
            
            // Outline - Gold border with fill animation
            "border-2 border-gold text-gold hover:text-charcoal relative before:absolute before:inset-0 before:bg-gold before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300 before:z-[-1]": variant === "outline",
            
            // Shimmer - Animated gold shimmer effect
            "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-charcoal relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 hover:shadow-gold animate-gold-shimmer": variant === "shimmer",
            
            // Glow - Pulsing glow effect
            "bg-gradient-to-r from-crimson-dark to-crimson text-white hover:shadow-[0_0_30px_rgba(220,20,60,0.5)] animate-pulse-glow": variant === "glow",
            
            // Pulse - Subtle pulse animation
            "bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse": variant === "pulse",
          },
          
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 overflow-hidden rounded-inherit">
          <div className="absolute inset-0 rounded-inherit bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 origin-center"></div>
        </div>
      </button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };