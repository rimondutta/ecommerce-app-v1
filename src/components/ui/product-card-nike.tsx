"use client";

import React, { useState } from "react";
import { trackAddToCart } from "@/lib/fbPixel";
import Link from "next/link";
import Image from "next/image";
// import { motion, useReducedMotion } from "framer-motion";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";
import IndexTag from "@/components/ui/IndexTag";

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
  index?: number; // 1-based position in catalog for Index tag
}

export default function ProductCardModern({ product, priority = false, index = 1 }: Props) {
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const reduced = useReducedMotion();

  const wishlisted = isWishlisted(product._id);
  const isOutOfStock = product.inventory !== undefined && product.inventory <= 0;

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
  const categoryName = product.category?.name || "";

  // Cinematic physics for a subtle, dramatic slow zoom
  const imageVariants: Variants = {
    rest: {
      scale: 1,
      filter: "brightness(0.9)",
      transition: {
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1] as const,
      },
    },

    hover: {
      scale: reduced ? 1 : 1.05,
      filter: "brightness(1)",
      transition: {
        duration: 1.2,
        ease: [0.25, 1, 0.5, 1] as const,
      },
    },
  };

  return (
    <motion.div
      className="relative group flex flex-col w-full cursor-pointer"
      initial="rest"
      whileHover="hover"
      animate="rest"
      suppressHydrationWarning
    >
      <motion.div
        className="relative w-full aspect-[4/5] overflow-hidden bg-paper-grey rounded-[1.5rem] p-4"
        variants={imageVariants}
      >
        {/* Badges — top left as hollow pills */}
        <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
          {product.badge && (
            <span className="border border-ink-black/20 text-ink-black/80 font-body text-[11px] px-3 py-1 rounded-full bg-white/40 backdrop-blur-md">
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="border border-ink-black/20 text-ink-black/80 font-body text-[11px] px-3 py-1 rounded-full bg-white/40 backdrop-blur-md">
              Promotion
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="block w-full h-full relative z-[2] group-hover:opacity-0 transition-opacity duration-300">
          {frontImg ? (
            <Image
              src={frontImg.url}
              alt={frontImg.alt || product.title}
              fill
              className="object-contain p-6"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image src="/placeholder.jpg" alt="Placeholder" fill className="object-contain p-6 mix-blend-multiply opacity-50" />
            </div>
          )}
        </Link>

        {/* Back image (hover reveal) */}
        {backImg && (
          <Link href={`/products/${product.slug}`} className="block w-full h-full absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Image
              src={backImg.url}
              alt={backImg.alt || product.title}
              fill
              className="object-contain p-6"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>
        )}

        {/* Right Arrow (Carousel hint, shown on hover for interaction) */}
        <div className="absolute inset-y-0 right-4 flex items-center z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </motion.div>

      {/* ─── Product Info ─── */}
      <div className="flex flex-col mt-4 gap-1 px-1" suppressHydrationWarning>
        
        {/* Swatches (Placeholder colors) */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#8E9B90] border border-black/10" />
          <div className="w-3 h-3 rounded-full bg-[#B5B5B5] border border-black/10" />
          <div className="w-3 h-3 rounded-full bg-[#D4B398] border border-black/10" />
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="no-underline">
          <h5 className="font-body text-[15px] font-medium text-ink-black leading-tight line-clamp-2 min-h-[44px]">
            {product.title}
          </h5>
        </Link>

        {/* Price and Cart Button */}
        <div className="flex items-center justify-between mt-2">
          <p className="font-body font-bold text-lg text-ink-black">
            ${(product.price / 110).toFixed(2)} {/* Mock USD price for aesthetic match */}
          </p>
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
            className="flex items-center gap-1.5 bg-stamp-red text-white px-4 py-1.5 rounded-full font-body text-xs font-semibold hover:bg-stamp-red/90 transition-colors disabled:opacity-50"
          >
            <span>+</span> Cart
          </button>
        </div>

      </div>
    </motion.div>
  );
}