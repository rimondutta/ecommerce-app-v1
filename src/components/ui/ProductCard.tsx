"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { useToast } from "@/components/playshelf/Toast";
import { trackAddToCart } from "@/lib/fbPixel";
import { getOptimizedCloudinaryUrl } from "@/lib/utils";

export interface ProductCardData {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt?: string } | string>;
  badge?: string;
  ageRange?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  inventory?: number;
  category?: { name?: string; slug?: string } | string;
  hasVariations?: boolean;
  variants?: Array<{
    sku?: string;
    combinationLabel?: string;
    price?: number;
    comparePrice?: number;
    stock?: number;
    combination?: Array<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variationType?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variationValue?: any;
    }>;
    isActive?: boolean;
    images?: string[];
  }>;
}

/* ─── Helpers ─── */
export function formatPrice(price: number, currency = "৳") {
  return currency + price.toLocaleString("en-BD");
}
export function getDiscountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
export function formatReviewCount(count?: number) {
  if (!count) return "0";
  if (count >= 1000) return (count / 1000).toFixed(1) + "k";
  return count.toString();
}

/* ─── Star Row ─── */
export function StarRow({ rating = 0, reviewCount }: { rating: number; reviewCount?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={11}
            className={
              s <= full
                ? "fill-amber-400 text-amber-400"
                : s === full + 1 && half
                ? "fill-amber-200 text-amber-400"
                : "fill-gray-100 text-gray-300"
            }
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-[10px] text-gray-400 leading-none">
          ({formatReviewCount(reviewCount)})
        </span>
      )}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  red: "bg-red-500 text-white",
  green: "bg-emerald-500 text-white",
  orange: "bg-orange-500 text-white",
  blue: "bg-blue-500 text-white",
};

interface ProductCardProps {
  product: ProductCardData;
  badgeColor?: "red" | "green" | "orange" | "blue";
  cartButtonColor?: "purple" | "navy";
  currency?: string;
  priority?: boolean;
}

/**
 * ProductCard — width-agnostic (parent controls the size).
 * Uses h-full so all cards in a row stretch to equal height.
 */
export default function ProductCard({
  product,
  badgeColor = "red",
  cartButtonColor = "purple",
  currency = "৳",
  priority = false,
}: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const [addedToCart, setAddedToCart] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const isOutOfStock = React.useMemo(() => {
    // 1. If badge explicitly states out of stock / stock out
    if (product.badge && /^(out of stock|stock out|স্টক আউট)/i.test(product.badge.trim())) {
      return true;
    }

    // 2. If product has variations, check total active variants stock
    if (product.hasVariations && Array.isArray(product.variants) && product.variants.length > 0) {
      const totalVariantStock = product.variants.reduce(
        (sum, v) => sum + (v.isActive !== false ? (Number(v.stock) || 0) : 0),
        0
      );
      return totalVariantStock <= 0;
    }

    // 3. Flat inventory check
    if (product.inventory !== undefined && product.inventory !== null) {
      const invNum =
        typeof product.inventory === "object" && product.inventory !== null
          ? Number((product.inventory as { quantity?: number }).quantity) || 0
          : Number(product.inventory);
      return invNum <= 0;
    }

    return false;
  }, [product.inventory, product.hasVariations, product.variants, product.badge]);

  const discount = getDiscountPercent(product.price, product.compareAtPrice);
  const firstImage = product.images?.[0];
  const imageUrl =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || "/images/placeholder.png";
  const imageAlt =
    typeof firstImage === "string"
      ? product.title
      : firstImage?.alt || product.title;

  const cartBg =
    cartButtonColor === "navy"
      ? "bg-[#1E1B4B] hover:bg-[#16134a]"
      : "bg-[#5428D8] hover:bg-[#4318C4]";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    setAddedToCart(true);
    addItem({
      id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: imageUrl,
    });

    try {
      trackAddToCart(product, 1);
    } catch {
      /* noop */
    }

    showToast(`"${product.title}" added to cart!`, "success");
    openCart();
    setTimeout(() => setAddedToCart(false), 1800);
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product._id);
  }

  return (
    /* w-full + h-full: stretches to whatever the parent slot gives */
    <div className="
      group relative bg-white rounded-[18px] border border-[#EDE4D8]
      shadow-[0_1px_2px_rgba(44,36,22,0.04),0_4px_16px_rgba(44,36,22,0.06)]
      hover:shadow-[0_2px_4px_rgba(44,36,22,0.05),0_12px_36px_rgba(84,40,216,0.11)]
      hover:border-[#c4b0f0]/50
      flex flex-col w-full h-full
      transition-all duration-350 ease-out hover:-translate-y-[3px]
      overflow-hidden
    ">
      {/* ── Image zone ── */}
      <div className="relative w-full aspect-square bg-gray-100 flex-shrink-0 overflow-hidden">
        {/* Out of stock badge takes priority over discount */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-black px-2.5 py-[3px] rounded-full tracking-wide shadow-sm bg-red-600 text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Stock Out
          </span>
        ) : discount ? (
          <span className={`
            absolute top-2.5 left-2.5 z-10 text-[10px] font-black
            px-2.5 py-[3px] rounded-full tracking-wide shadow-sm
            ${BADGE_STYLES[badgeColor]}
          `}>
            -{discount}%
          </span>
        ) : null}

        {/* Wishlist — visible on mobile, hover on desktop */}
        <button
          onClick={handleToggleWishlist}
          className={`
            absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full
            bg-white/95 shadow-md flex items-center justify-center cursor-pointer
            transition-all duration-200
            ${wishlisted ? "scale-110" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-95 sm:scale-90 sm:group-hover:scale-100"}
          `}
          aria-label="Toggle wishlist"
        >
          <Heart size={12} className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>

        {/* Product image (Cloudinary auto-optimized to 450px WebP/AVIF) */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={getOptimizedCloudinaryUrl(imageUrl, { width: 450 })}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.07] ${
              isOutOfStock ? "grayscale-[35%] opacity-90" : ""
            }`}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <span className="bg-white/95 text-red-600 font-extrabold text-[11px] sm:text-xs px-3 py-1 rounded-full shadow-md tracking-wide">
                Stock Out
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Content zone — flex-1 so all cards same height ── */}
      <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 flex-1">

        {/* Stars */}
        <StarRow rating={product.rating || 0} reviewCount={product.reviewCount} />

        {/* Title — 2-line clamp, flex-1 to push price to bottom */}
        <Link href={`/products/${product.slug}`} className="block flex-1 min-h-[32px] sm:min-h-[36px]">
          <h3 className="text-xs sm:text-[13px] font-semibold text-[#2C2416] leading-snug line-clamp-2 group-hover:text-[#5428D8] transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        {/* Price row — always at same vertical position */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-black text-[#5428D8] tracking-tight">
            {formatPrice(product.price, currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[10px] sm:text-[11px] text-[#B5A898] line-through font-normal">
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>

        {/* Add to Cart / Stock Out */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`
            w-full ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                : `${cartBg} text-white shadow-[0_2px_8px_rgba(84,40,216,0.25)] hover:shadow-[0_4px_16px_rgba(84,40,216,0.35)] cursor-pointer active:scale-95 hover:-translate-y-0.5`
            } text-[11px] sm:text-xs font-semibold
            rounded-xl py-2 sm:py-2.5
            flex items-center justify-center gap-1.5
            transition-all duration-200
            ${addedToCart ? "opacity-80" : ""}
          `}
        >
          <ShoppingCart size={12} strokeWidth={2.5} />
          {isOutOfStock ? "Stock Out" : addedToCart ? "Added ✓" : "Add to Cart"}
        </button>
      </div>

      {/* Warm bottom accent bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F5A623] via-[#5428D8] to-[#F5A623] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-[18px]" />
    </div>
  );
}
