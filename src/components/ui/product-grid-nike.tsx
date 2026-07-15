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



      {/* ── Product Grid ── */}
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[30px] animate-in fade-in duration-500">
          {products.map((product, idx) => (
            <ProductCardNike key={product._id} product={product} priority={idx < 4} index={idx + 1} />
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