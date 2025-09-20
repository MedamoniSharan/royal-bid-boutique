import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerCardProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: "gold" | "white" | "royal";
}

const ShimmerCard: React.FC<ShimmerCardProps> = ({
  children,
  className,
  shimmerColor = "gold",
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card border border-border rounded-xl group cursor-pointer transition-all duration-300 hover:shadow-elegant",
        className
      )}
    >
      {/* Shimmer overlay */}
      <div
        className={cn(
          "absolute inset-0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000",
          {
            "bg-gradient-to-r from-transparent via-gold/20 to-transparent": shimmerColor === "gold",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent": shimmerColor === "white",
            "bg-gradient-to-r from-transparent via-royal-blue/20 to-transparent": shimmerColor === "royal",
          }
        )}
      ></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export { ShimmerCard };