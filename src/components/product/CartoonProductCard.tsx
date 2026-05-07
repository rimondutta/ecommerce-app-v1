"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import CartoonCard from "@/components/ui/CartoonCard";
import { CartoonBadge } from "@/components/ui/CartoonBadge";
import CartoonButton from "@/components/ui/CartoonButton";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images: { url: string; alt?: string }[];
  badge?: string;
}

const CartoonProductCard = ({ product }: { product: Product }) => {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <CartoonCard className="flex flex-col h-full bg-[#f4e4bc] border-[#5d4037]" hoverable>
        {/* WANTED Header */}
        <div className="pt-4 pb-2 text-center border-b-2 border-[#5d4037]/20">
          <h4 className="font-bangers text-4xl text-[#5d4037] leading-none tracking-widest">WANTED</h4>
          <p className="font-comic text-[10px] font-bold text-[#5d4037] opacity-60 -mt-1 tracking-[0.3em]">DEAD OR ALIVE</p>
        </div>

        {/* Image Area */}
        <div className="relative aspect-square m-3 border-4 border-[#5d4037] bg-white overflow-hidden shadow-inner">
          {product.images?.[0] && (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 sepia-[0.3] group-hover:sepia-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-2 left-2 z-20">
              <CartoonBadge variant="sticker" className="bg-[#ffeb3b] border-[#5d4037]">{product.badge}</CartoonBadge>
            </div>
          )}
        </div>

        {/* Info Strip */}
        <div className="px-4 pb-6 pt-2 flex flex-col flex-1 items-center text-center gap-4">
          <div className="space-y-1">
            <h3 className="font-bangers text-2xl text-[#5d4037] leading-tight line-clamp-1 uppercase tracking-tight">
              {product.title}
            </h3>
            <div className="flex items-center justify-center gap-1 text-[#5d4037]">
              <span className="font-bangers text-3xl">฿</span>
              <span className="font-bebas text-4xl tracking-tighter">
                {product.price.toLocaleString()}
              </span>
              <span className="font-bangers text-xl opacity-80">-</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-center">
            <CartoonButton
              variant="outline"
              size="sm"
              className="w-full border-[#5d4037] text-[#5d4037] hover:bg-[#5d4037] hover:text-white cartoon-shadow-none group-hover:cartoon-shadow-sm"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              CLAIM BOUNTY
            </CartoonButton>
          </div>
        </div>
      </CartoonCard>
    </Link>
  );
};

export default CartoonProductCard;
