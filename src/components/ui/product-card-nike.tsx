"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
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

export default function ProductCardModern({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

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

  const sku = product._id ? product._id.slice(-6).toUpperCase() : "000000";
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const frontImg = product.images?.[0];
  const backImg = product.images?.[1];

  return (
    <div className="relative group flex flex-col w-full cursor-pointer" suppressHydrationWarning>
      {/* ─── Image Container with front/back swap (reference Trendy style) ─── */}
      <div className="relative w-full aspect-[4/5] md:h-[320px] overflow-hidden bg-neutral-100 transition-all duration-300 linear group" suppressHydrationWarning>
        
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative z-[2] group-hover:opacity-0 transition-opacity duration-300 linear">
          {frontImg ? (
            <Image
              src={frontImg.url}
              alt={frontImg.alt || product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              loading={priority ? "eager" : undefined}
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Image src="/placeholder.jpg" alt="Placeholder" fill className="object-cover" />
            </div>
          )}
        </Link>

        {/* Back image (hover reveal) */}
        {backImg && (
          <Link href={`/products/${product.slug}`} className="block w-full h-full absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 linear">
            <Image
              src={backImg.url}
              alt={backImg.alt || product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>
        )}

        {/* Minimalist Badges on Top-Left */}
        <div className="absolute top-0 left-0 z-20 flex flex-col gap-1.5 items-start p-2 pointer-events-none" suppressHydrationWarning>
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

        {/* ─── Slide-up "Add to Cart" bar (reference Trendy h4 effect) ─── */}
        <div
          onClick={handleQuickAdd}
          suppressHydrationWarning
          className={cn(
            "absolute hidden md:flex left-2.5 right-2.5 -bottom-14 group-hover:bottom-2.5 z-[3] bg-[#fdfdfd] text-black text-[14px] font-medium uppercase text-center justify-center py-2.5 transition-all duration-200 ease-[cubic-bezier(0.99,0.99,0,0.61)] shadow-sm",
            isOutOfStock && "pointer-events-none opacity-60"
          )}
        >
          {isAdding ? "Adding..." : (isOutOfStock ? "Unavailable" : "Add to Cart")}
        </div>

        {/* Mobile Cart Icon Bottom Right */}
        <div 
          onClick={handleQuickAdd}
          suppressHydrationWarning
          className="md:hidden flex justify-center items-center absolute top-2.5 right-2.5 rounded-full p-1.5 z-[8] text-gray-500 bg-white shadow-sm"
        >
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M160 112c0-35.3 28.7-64 64-64s64 28.7 64 64v48H160V112zm-48 48H48c-26.5 0-48 21.5-48 48V416c0 53 43 96 96 96H352c53 0 96-43 96-96V208c0-26.5-21.5-48-48-48H336V112C336 50.1 285.9 0 224 0S112 50.1 112 112v48zm24 96c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24zm200-24c0 13.3-10.7 24-24 24s-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24z"></path></svg>
        </div>
      </div>

      {/* ─── Product Info ─── */}
      <div className="flex flex-col gap-2.5 mt-2.5" suppressHydrationWarning>
        <div className="flex justify-between items-center mt-2.5 z-20" suppressHydrationWarning>
          {/* Category label (reference style) */}
          <p className="text-[14px] text-[#767676] uppercase pointer-events-none">{product.category?.name || "Product"}</p>
          <svg onClick={handleWishlistClick} stroke="currentColor" fill={wishlisted ? "currentColor" : "none"} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg" style={{ color: wishlisted ? "red" : "rgb(118, 118, 118)", cursor: "pointer" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>

        <div className="flex flex-col items-start">
          <Link href={`/products/${product.slug}`} className="text-black no-underline">
            <h5 className="text-[16px] md:text-[16px] font-normal text-left">{product.title}</h5>
          </Link>

          <p className="text-[14px] mt-2 mb-1">
            ৳{product.price.toLocaleString()}
          </p>

          {/* Price Block */}
          <div className="flex gap-2.5 mt-1" suppressHydrationWarning>
            <div className="flex items-center gap-[3px]" suppressHydrationWarning>
              {[...Array(5)].map((_, i) => (
                <svg key={i} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" color="#FEC78A" height="10" width="10" xmlns="http://www.w3.org/2000/svg" style={{ color: "rgb(254, 199, 138)" }}><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
              ))}
            </div>
            <span className="text-[14px] text-[#767676]">{product.reviewCount || 0} reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}