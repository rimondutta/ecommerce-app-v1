"use client";

import React, { useState } from "react";
import { trackAddToCart } from "@/lib/fbPixel";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

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

interface Props {
  product: Product;
  priority?: boolean;
  index?: number;
}


// Consistent price formatter — avoids hydration mismatches from toLocaleString
function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function ProductCardModern({ product, priority = false, index = 1 }: Props) {
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const wishlisted = isWishlisted(product._id);
  const isOutOfStock = product.inventory !== undefined && product.inventory <= 0;
  const hasDiscount = !!(product.compareAtPrice && product.compareAtPrice > product.price);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product._id);
  };

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
      image: product.images?.[0]?.url || "/placeholder.jpg",
    });
    try { trackAddToCart(product, 1); } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 600));
    setIsAdding(false);
    openCart();
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const frontImg = product.images?.[0];
  const backImg = product.images?.[1];

  return (
    <motion.div
      className="relative group flex flex-col w-full cursor-pointer bg-white border border-gray-200 rounded-[20px] overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={reduced ? {} : { y: isHovered ? -6 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      suppressHydrationWarning
    >
      {/* ─── Image Container ─── */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F5F5F5]">

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
          {product.badge && (
            <span className="bg-[#A3E635] text-[#14532D] font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#A3E635] text-[#14532D] font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
              {discountPercentage}% ছাড়
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-900 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistClick}
          className={cn(
            "absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
            wishlisted
              ? "bg-[#043224] text-white scale-110"
              : "bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-[#043224] hover:text-white"
          )}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Product Images */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full absolute inset-0 z-[1]">
          {frontImg ? (
            <Image
              src={frontImg.url}
              alt={frontImg.alt || product.title}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                isHovered && backImg ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-joy-mist">
              <Image src="/placeholder.jpg" alt="Placeholder" fill className="object-cover opacity-40" />
            </div>
          )}

          {/* Back image on hover */}
          {backImg && (
            <Image
              src={backImg.url}
              alt={backImg.alt || product.title}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>

      </div>

      {/* ─── Product Info ─── */}
      <div className="flex flex-col p-4 sm:p-5 flex-1" suppressHydrationWarning>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="no-underline mb-1">
          <h3 className="font-body text-[16px] font-bold text-gray-900 leading-tight line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
          <span className="font-body font-bold text-[17px] text-gray-900">
            ৳{formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="font-body text-[13px] text-gray-400 line-through">
                ৳{formatPrice(product.compareAtPrice!)}
              </span>
              <span className="text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
              </span>
            </>
          )}
        </div>
        
        {/* Order Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding || isOutOfStock}
          className="w-full mt-5 bg-[#D5AEFD] hover:bg-[#D5AEFD]/90 text-black font-body font-bold text-[15px] py-3.5 rounded-full transition-colors disabled:opacity-70 flex justify-center items-center"
        >
          {isAdding ? "Adding..." : (isOutOfStock ? "Sold Out" : "Add to Cart")}
        </button>
      </div>
    </motion.div>
  );
}