"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function CartoonLoadingBar() {
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[10000] bg-paper">
      <div className="h-full bg-ink animate-ink-reveal w-full origin-left" />
    </div>
  );
}

export function CartoonSkeleton({ className = "" }: { className?: string }) {
  return <div className={cn("bg-ink/5 border-2 border-ink/10 animate-pulse", className)} />;
}

export function CartoonPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="w-20 h-20 bg-ink animate-float border-4 border-ink cartoon-shadow" />
        <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border-3 border-ink flex items-center justify-center font-bangers text-2xl">
          ?
        </div>
      </div>
      <span className="font-bangers text-4xl text-ink tracking-tight animate-pulse uppercase">
        LOADING INTEL...
      </span>
    </div>
  );
}
