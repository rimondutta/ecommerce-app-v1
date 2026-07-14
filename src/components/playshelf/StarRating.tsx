import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  showValue = false,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating)
              ? "fill-sun text-sun"
              : "fill-line text-line"
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-ink tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
