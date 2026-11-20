"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/ui/ProductCard";

interface BestSellingSectionProps {
  initialProducts?: ProductCardData[];
}

export default function BestSellingSection({ initialProducts = [] }: BestSellingSectionProps) {
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetch("/api/products?tag=bestselling&limit=10")
        .then((r) => r.json())
        .then((data) => { if (data?.products?.length) setProducts(data.products); })
        .catch(() => {/* silent */});
    }
  }, [initialProducts.length]);

  const scroll = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    // scroll exactly one card width
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement;
    const amount = card ? card.offsetWidth + 14 : 220;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-14 bg-[#FDF8F0]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
          <h2 className="text-lg sm:text-2xl md:text-[26px] font-extrabold text-[#2C2416] flex items-center gap-1.5 sm:gap-2 leading-tight truncate">
            🔥 Best Selling Toys
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Nav arrows */}
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
            <Link
              href="/products?tag=bestselling"
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
          className="flex gap-3.5 overflow-x-auto pb-2 relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              data-card
              className="w-[calc(50%-7px)] sm:w-[calc(33.333%-9.4px)] md:w-[calc(25%-10.5px)] lg:w-[calc(20%-11.2px)] flex-shrink-0 snap-start"
            >
              <ProductCard product={p} badgeColor="red" cartButtonColor="purple" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
