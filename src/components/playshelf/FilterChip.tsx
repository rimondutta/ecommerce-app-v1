"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function FilterChip({ label, selected = false, onClick, className }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-[var(--radius-pill)] border-2 transition-all font-display text-sm",
        selected
          ? "bg-ink text-paper border-ink shadow-[0_2px_8px_rgba(36,39,43,0.2)] font-semibold"
          : "bg-paper text-ink border-line hover:border-ink/30 hover:bg-shelf-wood/10",
        className
      )}
    >
      {label}
    </button>
  );
}
