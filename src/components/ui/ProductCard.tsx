"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useQuickLook } from "@/store/quickLookStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PerspectiveCard from "./PerspectiveCard";

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
      <PerspectiveCard strength={8} className="w-full">
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-[4/5] overflow-hidden bg-zinc-50 rounded-[2rem] mb-5 block group border border-zinc-100 shadow-soft-sm group-hover:shadow-soft-xl transition-shadow duration-500"
        >
          {/* Badge - Optional */}
          {index === 0 && (
            <div className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-900 border border-white/20 shadow-soft">
              New Arrival
            </div>
          )}

          {/* Images */}
          <div className="absolute inset-0">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className={`object-cover transition-all duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-105 ${hovered ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              priority
            />
            <Image
              src={secondImage}
              alt={product.title}
              fill
              className={`object-cover transition-all duration-[1.5s] ease-[0.16,1,0.3,1] ${hovered ? 'scale-105 opacity-100' : 'scale-110 opacity-0'}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>

          {/* Mobile Quick Add */}
          <div className="absolute bottom-4 right-4 lg:hidden z-20">
            <button
              onClick={handleQuickAdd}
              className="w-12 h-12 bg-white text-zinc-900 flex items-center justify-center shadow-soft-xl active:scale-95 transition-all rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Quick Actions Panel - Desktop */}
          <div className="hidden lg:flex absolute inset-x-4 bottom-4 gap-2 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16,1,0.3,1]">
            <button
              onClick={(e) => {
                e.preventDefault();
                openQuickLook(product);
              }}
              className="flex-1 h-12 bg-white/80 backdrop-blur-md text-zinc-900 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all shadow-soft"
            >
              <Eye size={16} className="text-zinc-400" />
              Quick Look
            </button>
            <button
              onClick={handleQuickAdd}
              className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-all shadow-soft-xl"
            >
              <ShoppingBag size={18} />
            </button>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.preventDefault(); toggleItem(product._id || product.id.toString()); }}
            className={`absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:bg-white/40 ${isWishlisted(product._id || product.id.toString()) ? 'bg-white/80 !text-rose-500 border-white' : 'text-white'}`}
          >
            <Heart
              size={18}
              className={`${isWishlisted(product._id || product.id.toString()) ? 'fill-current' : ''}`}
              strokeWidth={2}
            />
          </button>
        </Link>
      </PerspectiveCard>

      {/* Product Info */}
      <div className="px-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${product.slug}`}
              className="text-base font-bold text-zinc-900 tracking-tight leading-tight hover:text-zinc-600 transition-colors block truncate"
            >
              {product.title}
            </Link>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {product.category?.name || "Premium Collection"}
            </span>
          </div>
          <p className="text-base font-bold text-zinc-900">
            ৳{Math.round(product.priceNum || product.price).toLocaleString()}
          </p>
        </div>

        {product.colors?.length > 1 && (
          <div className="flex gap-2 mt-0.5">
            {product.colors.map((c: { name: string; hex?: string }) => (
              <div
                key={c.name}
                className="w-3 h-3 rounded-full ring-1 ring-zinc-200"
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
