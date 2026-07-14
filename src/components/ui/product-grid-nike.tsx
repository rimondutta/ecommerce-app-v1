"use client";

import React, { useRef, useState, useEffect } from "react";
import ProductCardNike from "./product-card-nike";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; alt?: string }[];
  badge?: string;
  ageRange?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  /** layout: 'carousel' (default) | 'grid' */
  layout?: "carousel" | "grid";
}

export default function ProductGridNike({
  products,
  title,
  subtitle,
  viewAllLink,
  layout = "carousel",
}: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [displayLayout, setDisplayLayout] = useState<"carousel" | "grid">(layout);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [products, displayLayout]);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full relative">
      {/* ── Section Header ── */}
      {(title || viewAllLink) && (
        <div className="flex items-end justify-between mb-7 md:mb-9 gap-4">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-white/35 mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-all duration-200 group"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            )}

            {/* Layout toggle (desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
              <button
                onClick={() => setDisplayLayout("carousel")}
                className={cn(
                  "w-8 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                  displayLayout === "carousel"
                    ? "bg-white/15 text-white"
                    : "text-white/30 hover:text-white/60"
                )}
                aria-label="Carousel view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDisplayLayout("grid")}
                className={cn(
                  "w-8 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                  displayLayout === "grid"
                    ? "bg-white/15 text-white"
                    : "text-white/30 hover:text-white/60"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scroll arrows (carousel only) */}
            {displayLayout === "carousel" && (
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className={cn(
                    "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200",
                    canScrollLeft
                      ? "border-white/15 text-white/60 hover:border-white/30 hover:text-white hover:bg-white/8"
                      : "border-white/5 text-white/15 cursor-not-allowed"
                  )}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className={cn(
                    "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200",
                    canScrollRight
                      ? "border-white/15 text-white/60 hover:border-white/30 hover:text-white hover:bg-white/8"
                      : "border-white/5 text-white/15 cursor-not-allowed"
                  )}
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Carousel Layout ── */}
      {displayLayout === "carousel" && (
        <div className="relative">
          {/* Left fade */}
          {canScrollLeft && (
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none rounded-l-2xl" />
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-5 pb-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, idx) => (
              <div
                key={product._id}
                className="flex-none snap-start"
                style={{
                  width: "clamp(180px, 45vw, 260px)",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <ProductCardNike product={product} />
              </div>
            ))}
          </div>

          {/* Right fade */}
          {canScrollRight && (
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none rounded-r-2xl" />
          )}
        </div>
      )}

      {/* ── Grid Layout ── */}
      {displayLayout === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {products.map((product, idx) => (
            <div
              key={product._id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "both" }}
            >
              <ProductCardNike product={product} />
            </div>
          ))}
        </div>
      )}

      {/* ── Mobile View All ── */}
      {viewAllLink && (
        <div className="md:hidden flex justify-center mt-6">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
}
