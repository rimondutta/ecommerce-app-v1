"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function LoadingBar() {
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[10000] bg-paper">
      <div className="h-full bg-sun animate-pulse w-full origin-left" />
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("bg-paper/20 rounded-2xl animate-pulse", className)} />;
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="w-16 h-16 bg-sun rounded-2xl animate-spin shadow-sm" />
      </div>
      <span className="font-display text-2xl text-ink tracking-tight animate-pulse">
        Loading...
      </span>
    </div>
  );
}
