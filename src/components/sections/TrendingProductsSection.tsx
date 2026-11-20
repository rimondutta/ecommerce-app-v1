"use client";

import React, { useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/ui/ProductCard";

interface TrendingProductsSectionProps {
  products?: ProductCardData[];
}

export default function TrendingProductsSection({ products = [] }: TrendingProductsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement;
    const amount = card ? card.offsetWidth + 14 : 220;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-8 sm:py-10 md:py-14 bg-white">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
          <div className="truncate">
            <h2 className="text-lg sm:text-2xl md:text-[26px] font-extrabold text-[#1E1B4B] leading-tight truncate">
              Trending Products
            </h2>
            <p className="text-xs sm:text-[13px] text-gray-400 mt-0.5 font-medium truncate">
              Loved by kids. Trusted by parents.
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scroll("left")}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-[#5428D8] hover:text-[#5428D8] text-gray-400 transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-[#5428D8] hover:text-[#5428D8] text-gray-400 transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-[#5428D8] hover:text-[#4318C4] transition-colors whitespace-nowrap pl-1"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* 
          Scroll container:
          - Mobile (<640px): 2 products in row -> w-[calc(50%-7px)]
          - Small tablet (640-768px): 3 products -> sm:w-[calc(33.333%-9.4px)]
          - Medium tablet (768-1024px): 4 products -> md:w-[calc(25%-10.5px)]
          - Desktop (>=1024px): 5 products -> lg:w-[calc(20%-11.2px)]
        */}
        <div
          ref={scrollRef}
          className="flex gap-3.5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              data-card
              className="w-[calc(50%-7px)] sm:w-[calc(33.333%-9.4px)] md:w-[calc(25%-10.5px)] lg:w-[calc(20%-11.2px)] flex-shrink-0 snap-start"
            >
              <ProductCard product={p} badgeColor="green" cartButtonColor="navy" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
