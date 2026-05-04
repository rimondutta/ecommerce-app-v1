"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  ShoppingBag, 
  ChevronRight,
  Maximize2,
  Plus,
  Minus,
  ArrowRight,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, EffectFade } from "swiper/modules";
import ProductReviews from "@/components/sections/ProductReviews";
import EditorialProductGrid from "@/components/sections/EditorialProductGrid";
import { motion, AnimatePresence } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";

interface ProductDetailsClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("Composition & Care");
  const [imageZoom, setImageZoom] = useState(false);

  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return;
    if (product.colors?.length > 0 && !selectedColor) return;

    addItem({
      id: product._id.toString(),
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      color: selectedColor?.name || "Default",
      size: selectedSize || "Default",
      image: (product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"
    });
    openCart();
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumbs - Minimalist */}
      <div className="relative z-40 bg-white">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-8">
          <nav className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Archive</Link>
            <span className="w-1 h-1 rounded-full bg-zinc-200" />
            <Link href="/shop" className="hover:text-zinc-900 transition-colors">Catalog</Link>
            <span className="w-1 h-1 rounded-full bg-zinc-200" />
            <span className="text-zinc-900 truncate max-w-[150px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          {/* Gallery Section - Sticky Asymmetrical Grid for Desktop */}
          <div className="lg:col-span-7">
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {product.images?.map((img: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-soft-xl group ${idx === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/5]'}`}
                >
                  <Image
                    src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"}
                    alt={`${product.title} view ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-[2s] ease-[0.16,1,0.3,1] group-hover:scale-110"
                    priority={idx === 0}
                  />
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
                  <div className="absolute top-8 left-8">
                    <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-100">VIEW_0{idx + 1}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Swiper */}
            <div className="md:hidden">
              <Swiper
                modules={[Pagination, EffectFade]}
                pagination={{ clickable: true }}
                effect="fade"
                className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-soft-xl"
              >
                {product.images?.map((img: any, idx: number) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Product Info Section - Sticky */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32 space-y-12">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <span className="text-zinc-400 font-bold text-[10px] tracking-[0.3em] uppercase">{categoryName || "Archive Collection"}</span>
                  <div className="h-[1px] w-12 bg-zinc-200" />
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-bold text-[9px] tracking-[0.2em] uppercase">Status: Available</span>
                  </div>
                </div>
                
                <h1 className="font-display font-black text-6xl md:text-8xl text-zinc-900 leading-[0.85] tracking-[-0.05em]">
                  {product.title.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i % 2 !== 0 ? 'text-zinc-400 italic' : ''}>{word}{' '}</span>
                  ))}
                </h1>

                <div className="flex items-baseline gap-6">
                  <span className="text-5xl font-display font-black text-zinc-900 tracking-tighter">
                    ৳{Math.round(product.price).toLocaleString()}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xl font-medium text-zinc-300 line-through">
                      ৳{Math.round(product.compareAtPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-zinc-500 text-lg leading-relaxed font-medium max-w-xl">
                  {product.description || "A masterclass in modern textile engineering, offering unparalleled comfort and a silhouette that defines contemporary elegance."}
                </p>
              </motion.div>

              {/* Selection Controls */}
              <div className="space-y-12 pt-8">
                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Surface Finish</span>
                      <span className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.2em] bg-zinc-50 px-3 py-1 rounded-full">{selectedColor?.name || "Select Color"}</span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {product.colors.map((color: any) => {
                        const isSelected = selectedColor?.name === color.name;
                        const colorHex = color.hex || color.value || '#000';
                        return (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color)}
                            className={`group relative w-12 h-12 transition-all duration-500 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                          >
                            <div 
                              className="w-full h-full rounded-full border border-zinc-100 shadow-sm relative z-10 overflow-hidden"
                              style={{ backgroundColor: colorHex }}
                            >
                               {isSelected && <div className="absolute inset-0 border-[3px] border-white/40 rounded-full" />}
                            </div>
                            {isSelected && (
                              <motion.div 
                                layoutId="color-ring"
                                className="absolute inset-[-6px] border border-zinc-900 rounded-full"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Dimension</span>
                      <button className="text-[9px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-[0.2em] underline underline-offset-4 decoration-zinc-200">
                        Sizing Protocol
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`flex-1 min-w-[80px] h-14 flex items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${selectedSize === size ? 'bg-black text-white shadow-2xl scale-105' : 'bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-300'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Actions */}
                <div className="pt-6 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-[2rem] h-16 p-2">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                        className="w-12 h-full flex items-center justify-center rounded-2xl hover:bg-white transition-all text-zinc-400 hover:text-zinc-900"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-display font-black text-xl tabular-nums text-zinc-900">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)} 
                        className="w-12 h-full flex items-center justify-center rounded-2xl hover:bg-white transition-all text-zinc-400 hover:text-zinc-900"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
                      className={`flex-1 h-16 relative overflow-hidden flex items-center justify-center gap-4 rounded-[2rem] transition-all duration-500 font-black text-[11px] uppercase tracking-[0.3em] group ${
                        (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)
                        ? 'bg-zinc-100 text-zinc-300'
                        : 'bg-black text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <span className="relative z-10">{(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? 'Configure Options' : 'Initiate Acquisition'}</span>
                      <ShoppingBag size={18} className="relative z-10" />
                      <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                    </button>

                    <button
                      onClick={(e) => { e.preventDefault(); toggleItem(product._id); }}
                      className={`w-16 h-16 flex items-center justify-center rounded-[2rem] transition-all duration-500 ${isWishlisted(product._id) ? 'bg-black text-white shadow-2xl' : 'bg-white border border-zinc-100 text-zinc-400 hover:border-zinc-300 hover:text-zinc-900'}`}
                    >
                      <Heart size={20} fill={isWishlisted(product._id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl border border-zinc-100 shadow-soft-sm">
                  <Truck size={18} className="text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl border border-zinc-100 shadow-soft-sm">
                  <RotateCcw size={18} className="text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl border border-zinc-100 shadow-soft-sm">
                  <ShieldCheck size={18} className="text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Secure Payment</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="pt-6">
                {[
                  { title: "Composition & Care", content: "Expertly crafted from 100% premium grade cotton. We recommend a gentle machine wash at 30°C to preserve the textile's integrity. Air dry only. Cool iron if necessary." },
                  { title: "Shipping & Returns", content: "Complimentary express shipping on all orders over ৳1,000. We offer a seamless 14-day return window for a full refund or exchange." },
                  { title: "Technical Blueprint", content: "Designed with an ergonomic fit to facilitate effortless movement. Reinforced seams at high-stress points for enhanced durability." }
                ].map((item) => (
                  <div key={item.title} className="group border-b border-zinc-100 last:border-0">
                    <button 
                      onClick={() => setActiveAccordion(activeAccordion === item.title ? null : item.title)}
                      className="w-full py-6 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">{item.title}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeAccordion === item.title ? 'bg-zinc-900 text-white rotate-45' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200'}`}>
                        <Plus size={14} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {activeAccordion === item.title && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-8 text-sm leading-relaxed text-zinc-500 font-medium">{item.content}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="py-24 bg-white rounded-t-[4rem] shadow-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-end justify-between mb-16">
          <div>
            <span className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Curated For You</span>
            <h3 className="font-display font-bold text-4xl md:text-5xl text-zinc-900 tracking-tight">You May Also Like</h3>
          </div>
          <Link href="/shop" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-all">
            Browse All
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <EditorialProductGrid initialProducts={relatedProducts} />
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <ProductReviews slug={product.slug} />
      </div>

      {/* Newsletter / Brand Footer */}
      <div className="px-6 md:px-12 pb-12">
        <div className="bg-zinc-900 rounded-[3.5rem] py-32 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 pointer-events-none noise-overlay" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10 px-6">
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.4em]">Transmission Live</span>
              </div>
              <h2 className="font-display font-black text-6xl md:text-8xl text-white tracking-[-0.04em] leading-none">
                Access the <br />
                <span className="text-zinc-500">Collective</span>
              </h2>
              <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                Join our private newsletter for prioritized access to limited drops, technical data, and exclusive editorial content.
              </p>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
               <div className="flex-1 relative">
                 <input 
                   type="email" 
                   placeholder="IDENTIFICATION / EMAIL" 
                   className="w-full bg-white/5 border border-white/10 px-10 h-20 rounded-[2rem] text-white placeholder:text-zinc-700 text-[10px] font-black tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all uppercase"
                 />
               </div>
               <button className="group relative h-20 px-16 bg-white text-black font-black rounded-[2rem] uppercase text-[10px] tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl">
                 <span className="relative z-10">Authorize</span>
                 <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
               </button>
            </form>
            
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">
              *By joining you agree to receive digital transmissions from our archive.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
