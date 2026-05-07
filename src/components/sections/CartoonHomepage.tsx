"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CartoonNavbar from "@/components/layout/CartoonNavbar";
import CartoonButton from "@/components/ui/CartoonButton";
import CartoonCard from "@/components/ui/CartoonCard";
import { StarburstBadge, CartoonBadge } from "@/components/ui/CartoonBadge";
import SpeechBubble from "@/components/ui/SpeechBubble";
import ComicDivider from "@/components/ui/ComicDivider";
import CartoonProductCard from "@/components/product/CartoonProductCard";
import KanjiStamp from "@/components/ui/KanjiStamp";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images: { url: string; alt?: string }[];
  badge?: string;
}

interface Category {
  name: string;
  slug: string;
}

const CartoonHomepage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/store/products?limit=6").then(r => r.json()).then(d => d.products || []),
      fetch("/api/store/categories").then(r => r.json()).then(d => d.categories || [])
    ])
    .then(([p, c]) => {
      setProducts(p);
      setCategories(c);
    })
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <CartoonNavbar />

      {/* HERO SECTION — "COVER PAGE" */}
      <section className="relative min-h-[80vh] flex items-center px-6 md:px-12 py-20 bg-white">
        <div className="absolute inset-0 bg-halftone pointer-events-none" />
        
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-10 gap-12 items-center relative z-10">
          <div className="md:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-jp text-lg font-black tracking-[0.3em] text-secondary/40 mb-1">
                  態度を着る — WEAR THE ATTITUDE
                </span>
                <h1 className="font-bangers text-7xl md:text-9xl text-ink leading-[0.8] text-ink-shadow">
                  STYLE<br />COMMANDO
                </h1>
              </div>
              <p className="font-comic text-2xl md:text-3xl font-bold italic text-secondary max-w-xl">
                Street-ready clothing. No rules. Just style.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 items-center">
              <Link href="/shop">
                <CartoonButton size="xl">SHOP NOW →</CartoonButton>
              </Link>
              <div className="hidden lg:block">
                <SpeechBubble position="left" bg="bg-surface">
                  NEW DROP IS LIVE! ★
                </SpeechBubble>
              </div>
            </div>

            {/* Doodles */}
            <div className="flex gap-4 items-center">
              <KanjiStamp text="魂" sub="SOUL" rotate={-5} />
              <div className="flex gap-4 text-4xl text-ink animate-float">
                <span>✦</span> <span>★</span> <span>⚡</span> <span>✸</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 relative group">
            <div className="absolute inset-0 bg-speed-lines opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
            <CartoonCard hoverable={false} className="aspect-[3/4] rotate-3 relative overflow-hidden">
              <div className="relative h-full w-full">
                <Image 
                  src="/brain/fe735886-c63e-4721-ae22-0765a8d3a5bc/anime_fashion_character_1_1778173485573.png" 
                  alt="Hero Character" 
                  fill 
                  className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-paper/40 to-transparent pointer-events-none" />
                <div className="absolute top-4 right-4 z-20">
                  <StarburstBadge size="md">NEW DROP</StarburstBadge>
                </div>
              </div>
            </CartoonCard>
            
            {/* Manga Onomatopoeia */}
            <div className="absolute -bottom-6 -left-6 font-bangers text-6xl text-ink-shadow -rotate-12 z-30 animate-pulse">
               DON!!
            </div>
          </div>
        </div>
      </section>

      <ComicDivider variant="zigzag" />

      {/* CATEGORY SECTION — "CHOOSE YOUR STYLE" */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="container mx-auto">
          <h2 className="font-bangers text-5xl text-center mb-16 uppercase tracking-tight">
            // PICK YOUR VIBE
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {categories.map((cat, i) => (
              <Link key={cat.slug} href={`/shop?category=${cat.name}`} className="group">
                <CartoonCard className={cn("aspect-square", i % 2 === 0 ? "rotate-2" : "-rotate-2")}>
                  <div className="relative h-full w-full">
                    {/* Fallback image if no category image exists */}
                    <div className="absolute inset-0 bg-hatch flex items-center justify-center font-bebas text-4xl text-ink/20">
                      {cat.name[0]}
                    </div>
                    
                    {/* Caption Box */}
                    <div className="absolute bottom-0 left-0 right-0 bg-ink p-3 group-hover:bg-paper transition-colors border-t-3 border-ink">
                      <span className="font-bebas text-2xl text-paper group-hover:text-ink block text-center uppercase">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </CartoonCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT GRID — "THE LINEUP" */}
      <section className="py-20 px-6 md:px-12 bg-surface">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
            <div className="text-center md:text-left relative">
              <span className="font-jp text-sm font-bold tracking-widest text-muted block mb-1">
                新着商品 — FRESH ARRIVALS
              </span>
              <h2 className="font-bangers text-6xl text-ink uppercase">THE LINEUP</h2>
              <div className="h-2 w-48 bg-ink cartoon-shadow -mt-2 mx-auto md:mx-0" />
              <KanjiStamp 
                text="新作" 
                sub="NEW" 
                variant="ghost" 
                className="absolute -top-10 -right-20 hidden lg:flex" 
                rotate={15} 
              />
            </div>
            <Link href="/shop">
              <CartoonButton variant="outline">EXPLORE ALL PRODUCTS</CartoonButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/6] bg-paper border-3 border-ink cartoon-shadow animate-pulse" />
              ))
            ) : (
              products.map((p) => (
                <CartoonProductCard key={p._id} product={p} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* FEATURED / EDITORIAL SECTION — "THE SPREAD" */}
      <section className="py-32 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-crosshatch pointer-events-none opacity-20" />
        
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute inset-0 action-lines opacity-10 group-hover:opacity-30 transition-opacity" />
            <CartoonCard hoverable={false} className="aspect-square -rotate-2 border-paper relative overflow-hidden">
              <Image 
                src="/brain/fe735886-c63e-4721-ae22-0765a8d3a5bc/anime_fashion_character_2_1778173567127.png" 
                alt="Editorial Character" 
                fill 
                className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
              />
              <div className="absolute inset-0 manga-panel-shading opacity-10 pointer-events-none" />
            </CartoonCard>
          </div>

          <div className="order-1 lg:order-2 space-y-8 relative z-10 text-paper">
            <CartoonBadge variant="outline" className="border-paper text-paper">
              特選 — WEEKLY PICK
            </CartoonBadge>
            <h2 className="font-bangers text-7xl md:text-8xl leading-[0.9] text-paper-shadow uppercase">
              THE OVERSIZED<br />REVOLUTION
            </h2>
            <p className="font-comic text-xl italic font-bold">
              Loose fits. Bold graphics. Zero apologies. The new era of streetwear is here, and it's louder than ever.
            </p>
            <Link href="/shop?type=oversized">
              <CartoonButton variant="secondary" size="lg">EXPLORE COLLECTION</CartoonButton>
            </Link>
          </div>
        </div>
      </section>

      {/* LOOKBOOK STRIP — "THE COMIC STRIP" */}
      <section className="py-20 bg-paper border-y-4 border-ink">
        <div className="container mx-auto px-6 mb-12">
           <h2 className="font-bangers text-4xl uppercase tracking-widest">// STREET LOOKBOOK Vol. 01</h2>
        </div>
        
        <div className="flex gap-8 overflow-x-auto px-12 pb-8 no-scrollbar scroll-smooth">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="flex-shrink-0 space-y-4">
              <CartoonCard className="w-80 h-80">
                <Image 
                  src={`https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&index=${i}`} 
                  alt="Lookbook" 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </CartoonCard>
              <div className="bg-ink p-2 text-center cartoon-shadow">
                <span className="font-bebas text-xl text-paper uppercase tracking-wider">Style #{i} — Street Casual</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — "FAN MAIL" */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-halftone pointer-events-none opacity-5" />
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-bangers text-5xl mb-20 uppercase tracking-tight">FAN MAIL & LETTERS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { name: "SABIR KHAN", text: "The quality is absolutely insane! Best streetwear brand in the game right now. ★★★★★", pos: "left" },
              { name: "ANIKA D.", text: "The oversized fits are actually oversized. Love the comic book vibe of the UI! ★★★★★", pos: "right" },
              { name: "REZAUL K.", text: "Shipping was super fast. The packaging felt like opening a limited edition comic book. ★★★★★", pos: "left" }
            ].map((review, i) => (
              <div key={i} className={cn("space-y-6 flex flex-col items-center", i === 1 ? "md:translate-y-8" : "")}>
                <SpeechBubble position={review.pos as any} bg={i % 2 === 0 ? "bg-paper" : "bg-surface"}>
                  "{review.text}"
                </SpeechBubble>
                <div className="pt-4">
                  <p className="font-bangers text-2xl tracking-wider text-ink">{review.name}</p>
                  <div className="flex gap-1 text-xl">★★★★★</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER — "THE BACK PAGE" */}
      <footer className="bg-ink text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-crosshatch pointer-events-none opacity-30" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-12 mb-20">
            <h1 className="font-bangers text-9xl md:text-[12rem] leading-none opacity-90 text-paper-shadow">
              INK & THREAD
            </h1>
            <div className="flex justify-center gap-8 font-bebas text-3xl tracking-widest flex-wrap">
              <Link href="/shop" className="hover:text-ink hover:bg-paper px-4 transition-colors">SHOP</Link>
              <Link href="/about" className="hover:text-ink hover:bg-paper px-4 transition-colors">ABOUT</Link>
              <Link href="/shipping" className="hover:text-ink hover:bg-paper px-4 transition-colors">SHIPPING</Link>
              <Link href="/privacy" className="hover:text-ink hover:bg-paper px-4 transition-colors">PRIVACY</Link>
            </div>
          </div>

          <div className="pt-20 border-t-2 border-paper/20 flex flex-col md:flex-row items-center justify-between gap-8 font-bebas text-xl tracking-widest opacity-60">
             <p>© 2025 INK & THREAD — ALL RIGHTS RESERVED</p>
             <p>MADE WITH ✦ AND INK</p>
          </div>
        </div>
        
        {/* Decorative Doodles Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-paper flex justify-between px-10 opacity-20">
          {[...Array(20)].map((_, i) => <span key={i}>✸</span>)}
        </div>
      </footer>
    </div>
  );
};

export default CartoonHomepage;
