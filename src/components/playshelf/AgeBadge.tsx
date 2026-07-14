"use client";

import React from "react";
import { cn } from "@/lib/utils";

const AGE_COLOR_MAP: Record<string, string> = {
  "0-1":  "badge-coral",
  "1-3":  "badge-sun",
  "3-5":  "badge-mint",
  "5-8":  "badge-grape",
  "8+":   "badge-grape",
  "ALL":  "badge-mint",
};

interface AgeBadgeProps {
  age: string;
  className?: string;
}

export default function AgeBadge({ age, className }: AgeBadgeProps) {
  const colorClass = AGE_COLOR_MAP[age] || "badge-sun";

  return (
    <span
      className={cn(
        "badge-pill",
        colorClass,
        className
      )}
    >
      Ages {age}
    </span>
  );
}
