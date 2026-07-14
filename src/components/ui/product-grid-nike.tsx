"use client";

import React, { useState } from "react";
import ProductCardNike from "./product-card-nike";
import Link from "next/link";
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
  title?: React.ReactNode;
  subtitle?: string;
  viewAllLink?: string;
  layout?: "carousel" | "grid";
  theme?: "dark" | "light";
}

export default function ProductGridNike({
  products,
}: ProductGridProps) {
  const [activeTab, setActiveTab] = useState("tab1");

  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-10">
      
      {/* ── Tabs (All / New Arrivals / Best Seller / Top Rated) ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
        {[
          { id: "tab1", label: "All" },
          { id: "tab2", label: "New Arrivals" },
          { id: "tab3", label: "Best Seller" },
          { id: "tab4", label: "Top Rated" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative text-base font-semibold uppercase transition-colors duration-300 group bg-transparent border-none cursor-pointer",
              activeTab === tab.id ? "text-black" : "text-[#767676] hover:text-black"
            )}
          >
            {tab.label}
            {/* Active underline */}
            {activeTab === tab.id && (
              <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-black" />
            )}
            {/* Hover underline (for inactive tabs) */}
            {activeTab !== tab.id && (
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-black transition-[width] duration-200 ease-out group-hover:w-full group-hover:delay-200" />
            )}
          </button>
        ))}
      </div>

      {/* ── Product Grid ── */}
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[30px] animate-in fade-in duration-500">
          
          {/* Tab 1: All */}
          {activeTab === "tab1" && products.slice(0, 8).map((product, idx) => (
            <ProductCardNike key={product._id || idx} product={product} priority={idx === 0} />
          ))}

          {/* Tab 2: New Arrivals (reversed for visual difference) */}
          {activeTab === "tab2" && [...products].reverse().slice(0, 8).map((product, idx) => (
            <ProductCardNike key={product._id || idx} product={product} priority={idx === 0} />
          ))}

          {/* Tab 3: Best Seller (sorted by review count dummy logic) */}
          {activeTab === "tab3" && [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 8).map((product, idx) => (
            <ProductCardNike key={product._id || idx} product={product} priority={idx === 0} />
          ))}

          {/* Tab 4: Top Rated (sorted by rating dummy logic) */}
          {activeTab === "tab4" && [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8).map((product, idx) => (
            <ProductCardNike key={product._id || idx} product={product} priority={idx === 0} />
          ))}

        </div>
      </div>

      {/* ── Discover More ── */}
      <div className="mt-2">
        <Link 
          href="/products" 
          className="relative inline-block text-[14px] font-medium uppercase text-black no-underline group"
        >
          Discover More
          <span className="absolute -bottom-1.5 left-0 w-[60%] h-[2px] bg-black transition-[width] duration-200 ease-out group-hover:w-full" />
        </Link>
      </div>

    </div>
  );
}