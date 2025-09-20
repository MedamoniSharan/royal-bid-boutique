import React from "react";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <div
      className={cn(
        "animate-parallax-float hover:animate-none transition-all duration-300 hover:scale-105 hover:shadow-premium",
        className
      )}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export { FloatingCard };