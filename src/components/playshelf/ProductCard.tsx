"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import {
  CutoutCard,
  CutoutCardAction,
  CutoutCardContent,
  CutoutCardFooter,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  CutoutCorner,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card";
import AgeBadge from "./AgeBadge";
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

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const stagger = useCutoutContentStaggerVariants();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    openCart();
  };

  const rating = product.rating ?? 4.5;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <CutoutCard className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
        
        {/* Media Block with Inverted Rounded Cutouts */}
        <CutoutCardMedia className="relative aspect-square w-full overflow-hidden bg-paper dark:bg-zinc-950">
          {product.images?.[0] && (
            <CutoutCardImage
              src={product.images[0].url}
              alt={product.images[0].alt || product.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )}
          
          <CutoutCardOverlay />

          {/* Age Badge cutout at bottom-left */}
          {product.ageRange && (
            <CutoutCardInsetLabel className="absolute bottom-0 left-0 rounded-tr-[20px] bg-white dark:bg-zinc-900 px-4 py-2 z-10">
              <AgeBadge age={product.ageRange} />
              <CutoutCorner className="absolute -right-[30px] -bottom-px rotate-90 text-white dark:text-zinc-900" size={30} />
              <CutoutCorner className="absolute -top-[30px] -left-px rotate-90 text-white dark:text-zinc-900" size={30} />
            </CutoutCardInsetLabel>
          )}

          {/* Special Promo Pin at top-right */}
          {product.badge && (
            <CutoutCardPin className="absolute top-0 right-0 rounded-bl-[20px] bg-coral text-white px-4 py-2 font-display font-bold text-sm shadow-md z-10">
              {product.badge}
              <CutoutCorner className="absolute top-0 -left-[30px] -rotate-90 text-coral" size={30} />
              <CutoutCorner className="absolute right-0 -bottom-[30px] -rotate-90 text-coral" size={30} />
            </CutoutCardPin>
          )}
        </CutoutCardMedia>

        {/* Info Content Area */}
        <CutoutCardContent className="p-6 flex flex-col justify-between flex-1 gap-2">
          <motion.div
            animate="show"
            className="contents"
            initial="hidden"
            variants={stagger.container}
          >
            {/* Rating */}
            {reviewCount > 0 && (
              <motion.div className="flex items-center gap-1" variants={stagger.item}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i <= Math.round(rating)
                        ? "fill-sun text-sun"
                        : "fill-line dark:fill-zinc-800 text-line dark:text-zinc-800"
                    }
                  />
                ))}
                <span className="text-xs text-muted dark:text-zinc-400 ml-1">({reviewCount})</span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h3
              className="font-display font-semibold text-lg leading-snug line-clamp-2 text-ink dark:text-white"
              variants={stagger.item}
            >
              {product.title}
            </motion.h3>

            {/* Footer with Price */}
            <motion.div variants={stagger.item} className="mt-auto pt-2">
              <CutoutCardFooter className="border-t border-line dark:border-zinc-800 pt-4 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-xl text-ink dark:text-white">
                    Tk. {product.price.toLocaleString()}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-muted dark:text-zinc-500 line-through">
                      Tk. {product.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </CutoutCardFooter>
            </motion.div>
          </motion.div>
        </CutoutCardContent>

        {/* Quick Add CTA at bottom-right */}
        <CutoutCardAction className="absolute bottom-6 right-6">
          <button
            onClick={handleQuickAdd}
            className="w-12 h-12 rounded-full bg-sun text-ink hover:bg-sun-dark shadow-md flex items-center justify-center transition-transform active:scale-95"
            type="button"
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={20} />
          </button>
        </CutoutCardAction>

      </CutoutCard>
    </Link>
  );
}
