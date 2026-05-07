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
      <CartoonCard className="flex flex-col h-full" hatchOverlay>
        {/* Image Area */}
        <div className="relative aspect-[4/5] bg-paper overflow-hidden border-b-3 border-ink">
          {product.images?.[0] && (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4 z-20">
              <CartoonBadge variant="sticker">{product.badge}</CartoonBadge>
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform bg-ink text-paper py-2 text-center font-bebas text-lg">
            QUICK VIEW
          </div>
        </div>

        {/* Info Strip */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-comic font-bold text-lg leading-tight line-clamp-1">
              {product.title}
            </h3>
            <p className="font-bebas text-2xl tracking-wide">
              ৳ {product.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <CartoonButton
              size="sm"
              className="w-full h-10"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
              }}
            >
              <Plus size={18} /> ADD
            </CartoonButton>
          </div>
        </div>
      </CartoonCard>
    </Link>
  );
};

export default CartoonProductCard;
