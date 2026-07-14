"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ShelfRowProps {
  title: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ShelfRow({ title, href, children, className }: ShelfRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-6 md:px-0">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-ink tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-sm font-semibold text-ink-light hover:text-ink transition-colors flex items-center gap-1 group"
          >
            See all
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Scrollable Area */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-paper/90 shadow-lg items-center justify-center hover:bg-paper transition-colors backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-ink" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-paper/90 shadow-lg items-center justify-center hover:bg-paper transition-colors backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-ink" />
          </button>
        )}

        {/* Products Row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-snap-x no-scrollbar px-6 md:px-0 pb-5"
        >
          {children}
        </div>

        {/* Shelf Ledge */}
        <div className="shelf-ledge" />
      </div>
    </section>
  );
}
