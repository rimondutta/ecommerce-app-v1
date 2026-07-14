"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
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
  colors?: any[];
  sizes?: any[];
  category?: any;
  inventory?: number;
}

export default function ProductCardModern({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product.inventory !== undefined && product.inventory <= 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    addItem({
      id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      color: "Default",
      size: "Default",
      image: product.images?.[0]?.url || "/placeholder.jpg",
    });
    await new Promise((r) => setTimeout(r, 600));
    setIsAdding(false);
    openCart();
  };

  const sku = product._id ? product._id.slice(-6).toUpperCase() : "000000";
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block w-full relative cursor-pointer border border-neutral-200/80 bg-white p-6 transition-all duration-300 hover:border-neutral-400"
    >
      {/* ─── Editorial Image Container ─── */}
      <div className="relative w-full aspect-[4/5] bg-white rounded-none overflow-hidden mb-5 z-0">
        {/* Product Image */}
        {product.images?.[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.title}
            fill
            className="object-contain transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <Image
              src="/placeholder.jpg"
              alt="Placeholder"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Minimalist Badges on Top-Left */}
        <div className="absolute top-0 left-0 z-20 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="bg-white text-black px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] rounded-full shadow-sm border border-neutral-100">
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-black text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] rounded-full shadow-sm">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* ─── Glassmorphism Quick Add Button (appears on hover) ─── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || isOutOfStock}
            className={cn(
              "w-full py-3 bg-white/95 backdrop-blur-xl border border-neutral-200 text-black font-semibold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.04)] active:scale-[0.98]",
              isOutOfStock
                ? "opacity-50 cursor-not-allowed bg-neutral-100"
                : "hover:bg-black hover:text-white hover:border-black"
            )}
            aria-label="Add to cart"
          >
            {isAdding ? (
              <>
                <Loader2 size={15} strokeWidth={2.5} className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} strokeWidth={2} />
                <span>{isOutOfStock ? "Unavailable" : "Quick Add"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Product Info (Mimicking the clean, spacious text layout) ─── */}
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-[13px] md:text-[14px] font-normal text-neutral-800 leading-snug line-clamp-2 tracking-tight">
          {product.title}
        </h3>

        <div className="flex flex-col items-start mt-1">
          {hasDiscount ? (
            <>
              <span className="text-[13px] md:text-[14px] font-medium text-neutral-900">
                ৳{product.price.toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-400 line-through mt-0.5">
                ৳{product.compareAtPrice?.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-[13px] md:text-[14px] font-medium text-neutral-900">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}