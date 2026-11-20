"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/ui/ProductCard";

interface DiscountSectionProps {
  initialProducts?: ProductCardData[];
}

export default function DiscountSection({ initialProducts = [] }: DiscountSectionProps) {
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetch("/api/products?tag=discount&limit=12")
        .then((r) => r.json())
        .then((data) => {
          const list = data?.data || data?.products;
          if (Array.isArray(list) && list.length > 0) {
            setProducts(list);
          }
        })
        .catch(() => {/* silent */});
    }
  }, [initialProducts.length]);

  const scroll = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement;
    const amount = card ? card.offsetWidth + 14 : 220;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }, []);

  // Section completely hidden if admin hasn't tagged any product with 'discount'
  if (products.length === 0) return null;

  return (
    <section className="w-full py-8 sm:py-10 md:py-14 bg-[#FCFBF8]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="truncate">
            <h2 className="text-lg sm:text-2xl md:text-[26px] font-extrabold text-[#2C2416] flex items-center gap-2 leading-tight truncate">
              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <Tag size={16} className="sm:w-[18px] sm:h-[18px]" />
              </span>
              <span>Discount Deals</span>
            </h2>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1 font-normal truncate">
              Limited-time discounts on top rated kids toys and gear
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
              href="/products?tag=discount"
              className="text-xs sm:text-sm font-bold text-[#5428D8] hover:text-[#4318C4] transition-colors whitespace-nowrap pl-1"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* 
          Responsive Scroll Row:
          - Mobile: exactly 2 products in row
          - Small tablet: 3 products
          - Medium tablet: 4 products
          - Desktop: 5 products
        */}
        <div
          ref={scrollRef}
          className="flex gap-3.5 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              data-card
              className="w-[calc(50%-7px)] sm:w-[calc(33.333%-9.4px)] md:w-[calc(25%-10.5px)] lg:w-[calc(20%-11.2px)] flex-shrink-0 snap-start"
            >
              <ProductCard
                product={p}
                badgeColor="red"
                cartButtonColor="purple"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
