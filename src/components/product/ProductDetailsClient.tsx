"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCartoonToast } from "@/components/ui/CartoonToast";
import CartoonButton from "@/components/ui/CartoonButton";
import CartoonCounter from "@/components/ui/CartoonCounter";
import CartoonCard from "@/components/ui/CartoonCard";
import { CartoonBadge, StarburstBadge } from "@/components/ui/CartoonBadge";
import CartoonStarRating from "@/components/ui/CartoonStarRating";
import SpeechBubble from "@/components/ui/SpeechBubble";
import CartoonProductCard from "@/components/product/CartoonProductCard";
import { Heart, Share2, Info, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetailsClientProps {
  product: any;
  relatedProducts?: any[];
}

export default function ProductDetailsClient({ product, relatedProducts = [] }: ProductDetailsClientProps) {
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { showToast } = useCartoonToast();

  const [selectedColor, setSelectedColor] = useState<any>(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images?.map((img: any) => img.url || "/placeholder.jpg") || ["/placeholder.jpg"];
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      color: selectedColor?.name || "Default",
      size: selectedSize || "Default",
      image: images[0],
    });
    showToast("ITEM ACQUIRED! ★");
    openCart();
  };

  return (
    <div className="bg-paper min-h-screen">
      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-12 font-comic font-bold text-lg italic text-secondary">
          <Link href="/products" className="hover:text-ink transition-colors">THE SHOP</Link>
          <span>/</span>
          <span className="text-ink truncate">{product.title}</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Sticky Image Gallery (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6 sticky top-32">
            
            {/* Thumbs (2 cols) */}
            <div className="hidden md:flex flex-col gap-4 md:col-span-2 order-2 md:order-1">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative aspect-[3/4] border-3 transition-all overflow-hidden",
                    activeImageIndex === idx ? "border-ink cartoon-shadow-sm" : "border-ink/20 hover:border-ink/50"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                </button>
              ))}
            </div>

            {/* Main Image (10 cols) */}
            <div className="md:col-span-10 order-1 md:order-2">
              <CartoonCard hoverable={false} className="aspect-[3/4] relative overflow-hidden bg-white">
                 <Image
                    src={images[activeImageIndex]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  {product.badge && (
                    <div className="absolute top-6 left-6 z-10">
                       <StarburstBadge size="md">{product.badge}</StarburstBadge>
                    </div>
                  )}
              </CartoonCard>
              
              {/* Mobile Thumbs */}
              <div className="flex md:hidden gap-3 mt-6 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative w-20 aspect-[3/4] shrink-0 border-3 transition-all",
                      activeImageIndex === idx ? "border-ink" : "border-ink/20"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Info Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Title & Badge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <CartoonBadge variant="sticker">{product.category?.name || "COLLECTION"}</CartoonBadge>
                <div className="flex gap-2">
                   <button 
                    onClick={() => toggleItem(product._id)}
                    className={cn(
                      "p-3 border-3 border-ink cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all",
                      wishlisted ? "bg-ink text-paper" : "bg-white text-ink"
                    )}
                   >
                     <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                   </button>
                   <button className="p-3 border-3 border-ink cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all bg-white">
                     <Share2 size={20} />
                   </button>
                </div>
              </div>
              <h1 className="font-bangers text-5xl md:text-7xl text-ink leading-tight text-ink-shadow">
                {product.title}
              </h1>
              <div className="flex items-center gap-4">
                <CartoonStarRating rating={4.8} size="md" />
                <span className="font-comic font-bold italic text-secondary">(128 REVIEWS)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
               <span className="font-bebas text-7xl text-ink">৳{product.price.toLocaleString()}</span>
               {product.oldPrice && (
                 <span className="font-bebas text-4xl text-secondary line-through">৳{product.oldPrice.toLocaleString()}</span>
               )}
            </div>

            {/* Description */}
            <div className="relative">
              <div className="absolute -top-8 -right-4 z-10 rotate-12">
                 <SpeechBubble position="right" bg="bg-surface">MUST HAVE!</SpeechBubble>
              </div>
              <div className="bg-white border-3 border-ink p-6 cartoon-shadow font-comic text-xl font-bold italic leading-relaxed text-secondary">
                {product.description || "Every stitch tells a story. Every panel is a move. Wear the ink, be the thread. Premium quality for the modern streetwear enthusiast."}
              </div>
            </div>

            {/* Selection Area */}
            <div className="space-y-8">
              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bebas text-2xl tracking-widest">// CHOOSE COLOR: {selectedColor?.name}</h4>
                  <div className="flex gap-4">
                    {product.colors.map((c: any) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "w-12 h-12 border-4 transition-all cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1",
                          selectedColor?.name === c.name ? "border-ink scale-110" : "border-ink/20"
                        )}
                        style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bebas text-2xl tracking-widest">// PICK YOUR SIZE</h4>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={cn(
                          "min-w-[60px] h-14 flex items-center justify-center font-bebas text-2xl px-4 border-3 transition-all cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1",
                          selectedSize === s ? "bg-ink text-paper border-ink" : "bg-white text-ink border-ink hover:bg-surface"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add */}
              <div className="space-y-4 pt-4">
                <h4 className="font-bebas text-2xl tracking-widest">// QUANTITY</h4>
                <div className="flex flex-col sm:flex-row gap-6">
                   <CartoonCounter value={quantity} onChange={setQuantity} className="w-full sm:w-auto" />
                   <CartoonButton 
                    size="xl" 
                    className="flex-1"
                    onClick={handleAddToCart}
                   >
                     ADD TO COLLECTION
                   </CartoonButton>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8 border-y-3 border-ink/10">
              <div className="flex items-center gap-3 font-comic font-bold italic text-secondary">
                <Truck size={24} className="text-ink" />
                <span className="text-lg">FAST SHIPPING</span>
              </div>
              <div className="flex items-center gap-3 font-comic font-bold italic text-secondary">
                <ShieldCheck size={24} className="text-ink" />
                <span className="text-lg">SECURE PAYMENT</span>
              </div>
              <div className="flex items-center gap-3 font-comic font-bold italic text-secondary">
                <Info size={24} className="text-ink" />
                <span className="text-lg">QUALITY INK</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
               <div className="space-y-2">
                 <h2 className="font-bangers text-5xl text-ink uppercase">RELATED VOLUMES</h2>
                 <div className="h-1.5 w-48 bg-ink -rotate-1" />
               </div>
               <Link href="/products">
                 <CartoonButton variant="outline">VIEW ALL ITEMS</CartoonButton>
               </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p: any) => (
                <CartoonProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
