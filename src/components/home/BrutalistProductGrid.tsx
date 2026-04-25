"use client";

import { useState } from "react";
import { products } from "@/data/products";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ModernProductGrid() {
  const [visibleCount, setVisibleCount] = useState(8);
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const displayProducts = products.slice(0, visibleCount);

  return (
    <section className="px-6 md:px-12 py-24 bg-white">
      <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Featured / AW24</span>
          <h2 className="font-display font-black uppercase text-7xl md:text-8xl tracking-tight leading-[0.9]">
            SELECTED<br />PIECES
          </h2>
        </div>
        <Link href="/shop" className="group text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 border-black pb-2 hover:opacity-70 transition-opacity">
          View full collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
        {displayProducts.map((product) => {
          const isFavorited = isWishlisted(String(product.id));
          
          return (
            <div key={product.id} className="group flex flex-col opacity-0 animate-reveal" style={{ animationDelay: `${(products.indexOf(product) % 4) * 0.1}s` }}>
              {/* Image Container with Premium Hover */}
              <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden border-2 border-black transition-all duration-500 group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-x-1 group-hover:-translate-y-1">
                <img
                  src={product.images[0].src}
                  alt={product.title}
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1s] ease-out"
                />
                
                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button 
                    onClick={() => toggleItem(String(product.id))}
                    className={`w-12 h-12 flex items-center justify-center border-2 border-black transition-all ${
                      isFavorited ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => addItem({ 
                      id: String(product.id), 
                      slug: product.slug,
                      title: product.title, 
                      price: product.priceNum, 
                      quantity: 1, 
                      color: product.colors[0]?.name || "Default", 
                      size: product.sizes[0] || "M",
                      image: product.images[0].src
                    })}
                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    <ShoppingBag size={20} />
                  </button>
                </div>

                {/* Badge if needed */}
                <div className="absolute top-4 left-4">
                   <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                     NEW ARRIVAL
                   </span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-black uppercase tracking-wider leading-tight group-hover:underline decoration-2 underline-offset-4">
                    <Link href={`/product/${product.id}`}>
                      {product.title}
                    </Link>
                  </h3>
                  <span className="text-xl font-display font-black tracking-tight">৳{Math.round(product.priceNum).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex -space-x-1">
                    {product.colors.map(color => (
                       <div key={color.name} className="w-3 h-3 border border-black/20" style={{ backgroundColor: color.hex }} title={color.name} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < products.length && (
        <div className="mt-24 flex justify-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 4)}
            className="group relative px-16 py-6 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-black hover:border-2 hover:border-black transition-all overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
          >
            LOAD MORE FROM COLLECTION
          </button>
        </div>
      )}
    </section>
  );
}
