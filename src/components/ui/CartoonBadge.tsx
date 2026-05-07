"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CartoonBadgeProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "sticker";
  className?: string;
}

export const CartoonBadge: React.FC<CartoonBadgeProps> = ({
  children,
  variant = "solid",
  className,
}) => {
  const baseStyles = "inline-block px-3 py-1 font-bebas text-sm tracking-wider uppercase border-2 border-ink";
  
  const variants = {
    solid: "bg-ink text-paper",
    outline: "bg-paper text-ink",
    sticker: "bg-paper text-ink -rotate-3 shadow-[2px_2px_0px_#0A0A0A]",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {children}
    </div>
  );
};

interface StarburstBadgeProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StarburstBadge: React.FC<StarburstBadgeProps> = ({
  children,
  className,
  size = "md",
}) => {
  const sizes = {
    sm: "w-16 h-16 text-xs",
    md: "w-24 h-24 text-sm",
    lg: "w-32 h-32 text-lg",
  };

  return (
    <div className={cn("relative flex items-center justify-center animate-float", className)}>
      {/* Starburst SVG background */}
      <svg
        viewBox="0 0 100 100"
        className={cn("absolute inset-0 fill-ink stroke-ink", sizes[size])}
        style={{ filter: "drop-shadow(4px 4px 0px #0A0A0A)" }}
      >
        <path d="M50 0 L60 30 L90 20 L75 50 L100 70 L65 75 L60 100 L40 75 L0 70 L25 50 L10 20 L40 30 Z" />
      </svg>
      <span className={cn("relative z-10 font-bangers text-paper text-center px-2", sizes[size])}>
        {children}
      </span>
    </div>
  );
};

export default CartoonBadge;
