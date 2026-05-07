"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ComicDividerProps {
  variant?: "zigzag" | "torn" | "ink";
  className?: string;
}

const ComicDivider: React.FC<ComicDividerProps> = ({
  variant = "ink",
  className,
}) => {
  if (variant === "ink") {
    return (
      <div className={cn("h-1 w-full bg-ink my-8 cartoon-shadow", className)} />
    );
  }

  if (variant === "zigzag") {
    return (
      <div className={cn("relative h-8 w-full overflow-hidden my-4", className)}>
        <svg
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full fill-ink"
        >
          <path d="M0 20 L10 0 L20 20 L30 0 L40 20 L50 0 L60 20 L70 0 L80 20 L90 0 L100 20 Z" />
        </svg>
      </div>
    );
  }

  if (variant === "torn") {
    return (
      <div className={cn("relative h-10 w-full overflow-hidden my-4", className)}>
        <svg
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full fill-ink"
        >
          <path d="M0,0 L1000,0 L1000,80 C950,90 900,70 850,85 C800,100 750,80 700,95 C650,110 600,90 550,105 C500,120 450,100 400,115 C350,130 300,110 250,125 C200,140 150,120 100,135 C50,150 0,130 0,145 Z" />
        </svg>
      </div>
    );
  }

  return null;
};

export default ComicDivider;
