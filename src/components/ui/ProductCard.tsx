"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useQuickLook } from "@/store/quickLookStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ProductCardProps {
  product: any; // Allow for flexible data structure from DB
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { openQuickLook } = useQuickLook();

  const mainImage = product.images?.[0]?.url || product.images?.[0]?.src || "https://placehold.co/600x800?text=No+Image";
  const secondImage = product.images?.[1]?.url || product.images?.[1]?.src || mainImage;

  return (
    <motion.div 
      className="group relative flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link 
        href={`/products/${product.slug}`} 
        className="relative aspect-[4/5] overflow-hidden bg-[#f0f0f0] rounded-sm mb-6 block"
        data-cursor="VIEW"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Images */}
        <div className="absolute inset-0">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-[3s] ease-out group-hover:scale-110 ${hovered ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority
          />
          <Image
            src={secondImage}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-[1.2s] ease-out ${hovered ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>

        {/* Quick Actions Panel */}
        <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              openQuickLook(product);
            }}
            className="w-full h-14 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all shadow-xl"
            data-cursor="LOOK"
          >
            <Eye size={16} />
            Quick Look
          </button>
          <button 
            onClick={(e) => {
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
            }}
            className="w-full h-14 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-xl"
            data-cursor="ADD"
          >
            <ShoppingBag size={16} />
            {product.colors?.length > 0 || product.sizes?.length > 0 ? "Select Options" : "Quick Add"}
          </button>
        </div>

        {/* Wishlist Button - Absolute Top Right */}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product._id || product.id.toString()); }}
          className={`absolute top-6 right-6 z-30 transition-all duration-300 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          data-cursor={isWishlisted(product._id || product.id.toString()) ? "SAVED" : "SAVE"}
        >
          <Heart 
            size={20} 
            className={`${isWishlisted(product._id || product.id.toString()) ? 'fill-white text-white' : 'text-white'}`} 
            strokeWidth={1.5}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-baseline group/info">
          <Link href={`/products/${product.slug}`} className="text-[12px] font-black uppercase tracking-[0.2em] text-black/80 hover:text-black transition-colors block">
            {product.category?.name || "Collection"}
          </Link>
          <span className="text-[14px] font-medium text-black">
            ৳{Math.round(product.priceNum || product.price).toLocaleString()}
          </span>
        </div>
        
        <Link 
          href={`/products/${product.slug}`}
          className="text-[18px] font-bold text-black tracking-tighter leading-tight hover:italic transition-all inline-flex items-center gap-2 group/title"
        >
          {product.title}
          <ArrowRight size={16} className="opacity-0 -translate-x-4 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
        </Link>

        {product.colors?.length > 1 && (
          <div className="flex gap-1.5 pt-2">
            {product.colors.map((c: { name: string; hex?: string }) => (
              <div 
                key={c.name}
                className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5"
                style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
