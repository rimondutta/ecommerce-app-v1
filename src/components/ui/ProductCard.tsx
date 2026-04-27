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
        className="relative aspect-[4/5] overflow-hidden bg-[#f0f0f0] rounded-none mb-4 block group"
        data-cursor="VIEW"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Archival Tag */}
        <div className="absolute top-0 left-0 z-20 bg-black text-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em]">
          Ref. {product.slug.slice(0, 4).toUpperCase()}-{index.toString().padStart(3, '0')}
        </div>

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

        {/* Mobile Quick Add */}
        <div className="absolute bottom-3 right-3 lg:hidden z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
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
            className="w-12 h-12 bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform rounded-full border border-black/5"
          >
            <ShoppingBag size={18} />
          </button>
        </div>

        {/* Quick Actions Panel - Desktop */}
        <div className="hidden lg:flex absolute inset-x-0 bottom-0 p-4 flex-col gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              openQuickLook(product);
            }}
            className="w-full h-12 bg-white/90 backdrop-blur-md text-black text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl"
            data-cursor="LOOK"
          >
            <Eye size={14} />
            Details
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
            className="w-full h-12 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all shadow-xl"
            data-cursor="ADD"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product._id || product.id.toString()); }}
          className={`absolute top-4 right-4 z-30 transition-all duration-300 ${isWishlisted(product._id || product.id.toString()) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          data-cursor={isWishlisted(product._id || product.id.toString()) ? "SAVED" : "SAVE"}
        >
          <Heart 
            size={18} 
            className={`${isWishlisted(product._id || product.id.toString()) ? 'fill-white text-white' : 'text-white'}`} 
            strokeWidth={1.5}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <Link 
              href={`/products/${product.slug}`}
              className="text-[14px] md:text-[16px] font-bold text-black tracking-tight leading-tight hover:underline transition-all decoration-1 underline-offset-4"
            >
              {product.title}
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              {product.category?.name || "Uncategorized"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-black text-black">
              <span className="text-[10px] text-neutral-400 mr-1">BDT</span>
              {Math.round(product.priceNum || product.price).toLocaleString()}
            </span>
          </div>
        </div>

        {product.colors?.length > 1 && (
          <div className="flex gap-1.5 pt-1">
            {product.colors.map((c: { name: string; hex?: string }) => (
              <div 
                key={c.name}
                className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
              />
            ))}
          </div>
        )}
      </div>
>
    </motion.div>
  );
}
