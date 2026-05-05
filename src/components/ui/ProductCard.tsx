"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useQuickLook } from "@/store/quickLookStore";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProductCardProps {
  product: any;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { openQuickLook } = useQuickLook();

  const mainImage = product.images?.[0]?.url || product.images?.[0]?.src || "https://placehold.co/600x800?text=No+Image";
  const secondImage = product.images?.[1]?.url || product.images?.[1]?.src || mainImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.colors?.length > 0 || product.sizes?.length > 0) {
      openQuickLook(product);
      return;
    }
    addItem({
      id: product._id || product.id.toString(),
      slug: product.slug,
      title: product.title,
      price: product.priceNum || product.price,
      quantity: 1,
      color: "Default",
      size: "Default",
      image: mainImage
    });
    openCart();
  };

  return (
    <motion.div
      className="group relative flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sharp-edged card — 0px radius, grayscale→color */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-[#111] mb-5 block group"
      >
        {/* Badge */}
        {index === 0 && (
          <div className="absolute top-4 left-4 z-20 bg-white text-[#0a0a0a] px-3 py-1.5 label-tiny" style={{ fontSize: '8px' }}>
            New Arrival
          </div>
        )}

        {/* Images — Grayscale to color on hover */}
        <div className="absolute inset-0">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-[600ms] ease-[0.16,1,0.3,1] group-hover:scale-105 grayscale group-hover:grayscale-0 ${hovered ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority
          />
          <Image
            src={secondImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-[600ms] ease-[0.16,1,0.3,1] grayscale group-hover:grayscale-0 ${hovered ? 'scale-105 opacity-100' : 'scale-110 opacity-0'}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>

        {/* Mobile Quick Add */}
        <div className="absolute bottom-4 right-4 lg:hidden z-20">
          <button
            onClick={handleQuickAdd}
            className="w-10 h-10 bg-white text-[#0a0a0a] flex items-center justify-center active:scale-95 transition-all border border-white/5"
          >
            <Plus size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Quick Actions Panel - Desktop */}
        <div className="hidden lg:flex absolute inset-x-4 bottom-4 gap-2 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16,1,0.3,1]">
          <button
            onClick={(e) => { e.preventDefault(); openQuickLook(product); }}
            className="flex-1 h-10 bg-white/90 backdrop-blur-sm text-[#0a0a0a] label-tiny flex items-center justify-center gap-2 hover:bg-white transition-all" style={{ fontSize: '8px' }}
          >
            <Eye size={14} strokeWidth={1} />
            Quick Look
          </button>
          <button
            onClick={handleQuickAdd}
            className="w-10 h-10 bg-white text-[#0a0a0a] flex items-center justify-center hover:bg-[#0a0a0a] hover:text-white transition-all"
          >
            <ShoppingBag size={16} strokeWidth={1} />
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product._id || product.id.toString()); }}
          className={`absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center transition-all duration-300 ${isWishlisted(product._id || product.id.toString()) ? 'bg-white text-[#0a0a0a]' : 'bg-black/40 text-white/60 hover:text-white hover:bg-black/60 border border-white/5'}`}
        >
          <Heart
            size={14}
            className={`${isWishlisted(product._id || product.id.toString()) ? 'fill-current' : ''}`}
            strokeWidth={1}
          />
        </button>
      </Link>

      {/* Product Info — Label tiny + serif */}
      <div className="px-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${product.slug}`}
              className="text-sm font-light text-white tracking-tight leading-tight hover:text-[#8e9192] transition-colors block truncate"
            >
              {product.title}
            </Link>
            <span className="label-tiny text-[#555] mt-1 block" style={{ fontSize: '8px' }}>
              {product.category?.name || "Archive"}
            </span>
          </div>
          <p className="label-tiny text-white">
            ৳{Math.round(product.priceNum || product.price).toLocaleString()}
          </p>
        </div>

        {product.colors?.length > 1 && (
          <div className="flex gap-1.5 mt-0.5">
            {product.colors.map((c: { name: string; hex?: string }) => (
              <div
                key={c.name}
                className="w-2.5 h-2.5 border border-white/10"
                style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
