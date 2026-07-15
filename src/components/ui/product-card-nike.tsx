"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
      color: "Default",
      size: "Default",
      image: product.images?.[0]?.url || "/placeholder.jpg",
    });
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
  const imageVariants = {
    rest:  { scale: 1,    filter: "brightness(0.9)", transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
    hover: { scale: reduced ? 1 : 1.05, filter: "brightness(1)", transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] } },
  };

  return (
    <motion.div
      className="relative group flex flex-col w-full cursor-pointer"
      initial="rest"
      whileHover="hover"
      animate="rest"
      suppressHydrationWarning
    >
      {/* ─── Image Container ─── */}
      <motion.div
        className="relative w-full aspect-[4/5] overflow-hidden bg-paper-white border border-rule-grey"
        variants={imageVariants}
      >
        {/* Index Tag — top left, rotates on hover */}
        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
          <IndexTag
            index={index}
            category={categoryName}
            className="text-[10px] leading-none tracking-tight"
          />
        </div>

        {/* Front image */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative z-[2] group-hover:opacity-0 transition-opacity duration-300">
          {frontImg ? (
            <Image
              src={frontImg.url}
              alt={frontImg.alt || product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-paper-grey">
              <Image src="/placeholder.jpg" alt="Placeholder" fill className="object-cover" />
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
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>
        )}

        {/* Badges — top right as stamp-red ink marks */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1 items-end pointer-events-none">
          {hasDiscount && (
            <span className="bg-stamp-red text-paper-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              −{discountPercentage}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stamp-red text-paper-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              SOLD OUT
            </span>
          )}
          {product.badge && !hasDiscount && !isOutOfStock && (
            <span className="bg-ink-black text-paper-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>

        {/* Slide-up "Add to Cart" bar — desktop */}
        <div
          onClick={handleQuickAdd}
          suppressHydrationWarning
          className={cn(
            "absolute hidden md:flex left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 z-[3]",
            "bg-ink-black text-paper-white font-body text-[11px] font-medium uppercase tracking-[0.12em]",
            "justify-center py-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer",
            isOutOfStock && "pointer-events-none opacity-60"
          )}
        >
          {isAdding ? "Adding…" : isOutOfStock ? "Unavailable" : "Add to Cart"}
        </div>

        {/* Mobile cart icon */}
        <div
          onClick={handleQuickAdd}
          suppressHydrationWarning
          className="md:hidden flex justify-center items-center absolute bottom-2 right-2 z-[8] bg-ink-black text-paper-white p-2"
        >
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
            <path d="M160 112c0-35.3 28.7-64 64-64s64 28.7 64 64v48H160V112zm-48 48H48c-26.5 0-48 21.5-48 48V416c0 53 43 96 96 96H352c53 0 96-43 96-96V208c0-26.5-21.5-48-48-48H336V112C336 50.1 285.9 0 224 0S112 50.1 112 112v48zm24 96c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24zm200-24c0 13.3-10.7 24-24 24s-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24z" />
          </svg>
        </div>
      </motion.div>

      {/* ─── Product Info ─── */}
      <div className="flex flex-col mt-3 border-b border-rule-grey pb-3" suppressHydrationWarning>
        {/* Category + Wishlist row */}
        <div className="flex justify-between items-center mb-1">
          <p className="font-mono text-[10px] text-rule-grey uppercase tracking-[0.1em]">
            {categoryName || "Toy"}
          </p>
          <button
            onClick={handleWishlistClick}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              stroke="currentColor"
              fill={wishlisted ? "currentColor" : "none"}
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              height="15"
              width="15"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: wishlisted ? "#E8391D" : "#C9C7C1" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Title with stamp-red underline draw-in on hover */}
        <Link href={`/products/${product.slug}`} className="no-underline">
          <h5 className="font-body text-[14px] font-normal text-ink-black leading-snug relative inline-block">
            {product.title}
            <span className="absolute -bottom-0.5 left-0 h-[1px] bg-stamp-red w-0 group-hover:w-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          </h5>
        </Link>

        {/* Price in mono */}
        <p className="font-mono text-[13px] text-ink-black mt-1.5">
          ৳{product.price.toLocaleString()}
          {hasDiscount && (
            <span className="ml-2 line-through text-rule-grey text-[11px]">
              ৳{product.compareAtPrice!.toLocaleString()}
            </span>
          )}
        </p>

        {/* Review stars */}
        {(product.reviewCount !== undefined) && (
          <div className="flex items-center gap-1.5 mt-1.5" suppressHydrationWarning>
            <div className="flex items-center gap-[2px]">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="9"
                  height="9"
                  viewBox="0 0 576 512"
                  fill="currentColor"
                  className={i < Math.floor(product.rating || 0) ? "text-stamp-red" : "text-rule-grey"}
                >
                  <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                </svg>
              ))}
            </div>
            <span className="font-mono text-[10px] text-rule-grey">{product.reviewCount} reviews</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}