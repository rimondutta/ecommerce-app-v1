"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

const ProgressBar = ({ 
  value, 
  max, 
  label,
  className 
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="font-comic font-bold italic text-lg text-secondary">{label}</p>
      )}
      <div className="h-6 bg-white border-3 border-ink cartoon-shadow-sm overflow-hidden flex items-center p-1">
        <div 
          className="h-full bg-ink transition-all duration-500 ease-out flex items-center justify-end px-2"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && (
            <div className="w-1.5 h-1.5 rounded-full bg-paper animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
