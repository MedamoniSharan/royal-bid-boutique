import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  variant?: "typewriter" | "fade-in" | "slide-up" | "shimmer" | "split";
  delay?: number;
  duration?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  variant = "fade-in",
  delay = 0,
  duration = 1000,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      if (variant === "typewriter") {
        let currentIndex = 0;
        const typeInterval = setInterval(() => {
          if (currentIndex <= text.length) {
            setDisplayText(text.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, duration / text.length);
        
        return () => clearInterval(typeInterval);
      } else {
        setDisplayText(text);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, variant, delay, duration]);

  if (variant === "split") {
    return (
      <div className={cn("inline-block", className)}>
        {text.split("").map((char, index) => (
          <span
            key={index}
            className={cn(
              "inline-block transition-all duration-300",
              {
                "animate-fade-in-up": isVisible,
              }
            )}
            style={{
              animationDelay: `${delay + index * 50}ms`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span
      className={cn(
        "transition-all duration-1000",
        {
          "opacity-100 translate-y-0": (isVisible && variant === "fade-in") || (isVisible && variant === "slide-up"),
          "opacity-0 translate-y-4": !isVisible && variant === "fade-in",
          "opacity-0 translate-y-8": !isVisible && variant === "slide-up",
          "bg-gradient-to-r from-royal-blue via-gold to-crimson bg-clip-text text-transparent animate-gold-shimmer": variant === "shimmer",
        },
        className
      )}
    >
      {variant === "typewriter" ? displayText : text}
      {variant === "typewriter" && displayText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

export { AnimatedText };