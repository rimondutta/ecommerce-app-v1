"use client";

import React, { useState } from "react";
import { trackAddToCart } from "@/lib/fbPixel";
import Link from "next/link";
import Image from "next/image";

import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { cn, getOptimizedCloudinaryUrl } from "@/lib/utils";
import { Heart, Star } from "lucide-react";

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
  reviews?: Array<{ rating?: number; status?: string }>;
  colors?: unknown[];
  sizes?: unknown[];
  category?: { name?: string; slug?: string } | string;
  inventory?: number;
}

interface Props {
  product: Product;
  priority?: boolean;
  index?: number;
}

function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function ProductCardModern({ product, priority = false }: Props) {
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
    await new Promise(resolve => setTimeout(resolve, 600));
    addItem({
      id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images?.[0]?.url || "/placeholder.jpg",
    });
    setIsAdding(false);

    try {
      trackAddToCart(product, 1);
    } catch { /* noop */ }

    openCart();
  };

  // Database discount calculation logic
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  const discountPercentage = hasDiscount && product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // Reviews & Rating calculation
  const reviewsCount = typeof product.reviewCount === "number" && product.reviewCount > 0
    ? product.reviewCount
    : Array.isArray(product.reviews)
    ? product.reviews.length
    : 0;

  const ratingValue = typeof product.rating === "number" && product.rating > 0
    ? product.rating
    : 5.0;

  const rawFront = product.images?.[0];
  const rawBack  = product.images?.[1];
  // Inject f_auto,q_auto into Cloudinary URLs — served as WebP/AVIF, ~40% smaller
  const frontImg = rawFront ? { ...rawFront, url: getOptimizedCloudinaryUrl(rawFront.url, { width: 600 }) } : undefined;
  const backImg  = rawBack  ? { ...rawBack,  url: getOptimizedCloudinaryUrl(rawBack.url,  { width: 600 }) } : undefined;

  return (
    <div
      className="relative group flex flex-col w-full cursor-pointer bg-white border border-gray-200 rounded-[20px] overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1.5 will-change-transform"
      suppressHydrationWarning
    >
      {/* Image Container */}
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
              {discountPercentage}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-900 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
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
                backImg ? "group-hover:opacity-0 opacity-100" : "opacity-100"
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

          {backImg && (
            <Image
              src={backImg.url}
              alt={backImg.alt || product.title}
              fill
              className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>
      </div>

      {/* Product Details & Price */}
      <div className="flex flex-col p-4 sm:p-5 flex-1" suppressHydrationWarning>
        <Link href={`/products/${product.slug}`} className="no-underline mb-1">
          <h3 className="font-body text-[16px] font-bold text-gray-900 leading-tight line-clamp-2 hover:text-[#043224] transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <Link
          href={`/products/${product.slug}#reviews`}
          className="flex items-center gap-1.5 mt-1.5 mb-2 no-underline group/rating w-fit"
          aria-label={`${ratingValue.toFixed(1)} out of 5 stars based on ${reviewsCount} reviews`}
        >
          <div className="flex items-center gap-0.5 text-[#FFB800]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                className={cn(
                  "transition-colors",
                  star <= Math.round(ratingValue)
                    ? "fill-[#FFB800] text-[#FFB800]"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="font-body font-bold text-xs text-gray-800 leading-none">
            {ratingValue.toFixed(1)}
          </span>
          <span className="font-body text-[11px] text-gray-400 leading-none group-hover/rating:text-gray-600 transition-colors">
            ({reviewsCount})
          </span>
        </Link>

        {/* Price Section */}
        <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
          <span className="font-body font-extrabold text-[22px] text-[#0A1A3A]">
            ৳{formatPrice(product.price)}
          </span>
          {hasDiscount && product.compareAtPrice && (
            <>
              <span className="font-body font-medium text-[15px] text-gray-500 line-through">
                ৳{formatPrice(product.compareAtPrice)}
              </span>
              <span className="text-[12px] font-bold bg-[#FF5733] text-white px-2 py-0.5 rounded-full">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding || isOutOfStock}
          className="w-full mt-5 bg-[#D5AEFD] hover:bg-[#D5AEFD]/90 text-black font-body font-bold text-[15px] py-3.5 rounded-full transition-colors disabled:opacity-70 flex justify-center items-center"
        >
          {isAdding ? "Adding..." : (isOutOfStock ? "Sold Out" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}