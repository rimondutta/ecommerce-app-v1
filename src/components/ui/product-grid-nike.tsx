"use client";

import React from "react";
import ProductCardAwwwards from "./product-card-nike";
import Link from "next/link";

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
  category?: any;
  inventory?: number;
}

interface ProductGridProps {
  products: Product[];
  title?: React.ReactNode;
  subtitle?: string;
  viewAllLink?: string;
  layout?: "carousel" | "grid";
  theme?: "dark" | "light";
}

// Assigns Awwwards-style layout to each card in a 4-product featured grid
const LAYOUT_PATTERNS: Array<"tall" | "wide" | "standard"> = [
  "tall",      // card 0 — 2 rows tall
  "standard",  // card 1
  "standard",  // card 2
  "standard",  // card 3
  "standard",  // card 4
  "standard",  // card 5
];

export default function ProductGridNike({ products }: ProductGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-14">
      {/* ── Clean Uniform Grid ── */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
        {products.map((product, idx) => (
          <ProductCardAwwwards
            key={product._id}
            product={product}
            priority={idx < 2}
            index={idx + 1}
          />
        ))}
      </div>

      {/* ── View All — animated underline ── */}
      <Link
        href="/products"
        className="group relative inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-widest text-ink-black hover:text-ink-black/70 transition-colors"
      >
        <span className="relative">
          View All Products
          <span className="absolute -bottom-1 left-0 h-[1px] bg-ink-black w-full origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" />
          <span className="absolute -bottom-1 left-0 h-[1px] bg-ink-black w-full origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] delay-100" />
        </span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
      </Link>
    </div>
  );
}