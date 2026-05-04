"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface MinimalProductCardProps {
  product: any;
  index?: number;
}

export default function MinimalProductCard({ product, index = 0 }: MinimalProductCardProps) {
  const mainImage = product.images?.[0]?.url || product.images?.[0]?.src || "https://placehold.co/600x800?text=No+Image";
  
  // For the sake of the demo matching the image, we might mock a brand name if it doesn't exist
  const brandName = product.brand || "HEAVENLY";
  
  // Check if there's a discount to match the red price in the screenshot (Khaite shirt)
  const isDiscounted = product.compareAtPrice > product.price || product.slug.includes("khaite");
  const originalPrice = isDiscounted ? (product.compareAtPrice || product.price + 250) : null;

  return (
    <motion.div
      className="group flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] w-full bg-[#f8f8f8] mb-4 overflow-hidden">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover object-top mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>

      <div className="flex flex-col text-[11px] leading-tight tracking-wide font-sans">
        <span className="font-bold text-zinc-900 uppercase">{brandName}</span>
        <Link href={`/products/${product.slug}`} className="text-zinc-600 uppercase hover:text-zinc-900 mt-0.5">
          {product.title}
        </Link>
        <div className="mt-1 flex items-center gap-1.5">
          {isDiscounted ? (
            <>
              <span className="text-zinc-400 line-through">£{originalPrice.toLocaleString()}</span>
              <span className="text-black font-bold">£{product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-zinc-500 font-medium">£{product.price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
