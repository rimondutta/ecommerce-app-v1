"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartoonStarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CartoonStarRating = ({ 
  rating, 
  maxStars = 5, 
  size = "md",
  className 
}: CartoonStarRatingProps) => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 28
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const isFilled = i < Math.floor(rating);
        return (
          <Star
            key={i}
            size={sizeMap[size]}
            className={cn(
              "stroke-[3px]",
              isFilled ? "fill-ink text-ink" : "text-ink/20"
            )}
          />
        );
      })}
    </div>
  );
};

export default CartoonStarRating;
