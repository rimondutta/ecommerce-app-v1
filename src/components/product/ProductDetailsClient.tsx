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
    <main className="min-h-screen bg-zinc-50/50">
      {/* Navigation / Breadcrumbs */}
      <div className="relative z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
          <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <ChevronRight size={10} className="text-zinc-300" />
            <Link href="/shop" className="hover:text-zinc-900 transition-colors">Shop</Link>
            <ChevronRight size={10} className="text-zinc-300" />
            {categoryName && (
              <>
                <span className="text-zinc-400">{categoryName}</span>
                <ChevronRight size={10} className="text-zinc-300" />
              </>
            )}
            <span className="text-zinc-900 truncate max-w-[150px]">{product.title}</span>
          </nav>
          
          <button className="flex items-center gap-2 group px-4 py-2 rounded-full bg-white border border-zinc-100 shadow-soft-sm hover:shadow-soft transition-all">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900">Share</span>
             <Share2 size={12} className="text-zinc-400 group-hover:text-zinc-900" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group bg-white rounded-[2.5rem] overflow-hidden shadow-soft-xl">
              <Swiper
                modules={[Navigation, Pagination, Thumbs, EffectFade]}
                effect="fade"
                thumbs={{ swiper: thumbsSwiper }}
                className="aspect-[4/5] w-full"
              >
                {product.images?.map((img: any, idx: number) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className={`object-cover transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] ${imageZoom ? 'scale-150' : 'scale-100 group-hover:scale-105'}`}
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button 
                onClick={() => setImageZoom(!imageZoom)}
                className="absolute bottom-8 right-8 z-10 w-12 h-12 bg-white/80 backdrop-blur-md text-zinc-900 flex items-center justify-center hover:bg-white transition-all rounded-full shadow-soft-2xl border border-white/20"
              >
                <Maximize2 size={18} />
              </button>

              {product.badge && (
                <div className="absolute top-8 left-8 z-10">
                  <span className="bg-zinc-900/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="px-2">
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={16}
                slidesPerView={4}
                watchSlidesProgress
                modules={[Navigation]}
                breakpoints={{
                  640: { slidesPerView: 5 },
                  1024: { slidesPerView: 6 },
                }}
                className="w-full"
              >
                {product.images?.map((img: any, idx: number) => (
                  <SwiperSlide key={idx} className="cursor-pointer">
                    <div className={`aspect-[4/5] rounded-2xl transition-all duration-500 overflow-hidden border-2 ${thumbsSwiper?.activeIndex === idx ? 'border-zinc-900 shadow-soft' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <Image
                        src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"}
                        alt="thumbnail"
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-5 space-y-10 py-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {categoryName || "Collection"}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock
                </div>
              </div>
              
              <h1 className="font-display font-bold text-5xl md:text-6xl text-zinc-900 leading-tight tracking-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-6">
                <span className="text-4xl font-display font-bold text-zinc-900">
                  ৳{Math.round(product.price).toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-medium text-zinc-300 line-through">
                      ৳{Math.round(product.compareAtPrice).toLocaleString()}
                    </span>
                    <span className="px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
              {product.description || "A masterclass in modern textile engineering, offering unparalleled comfort and a silhouette that defines contemporary elegance."}
            </p>

            {/* Selection Controls */}
            <div className="space-y-10 pt-4">
              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Available Colors</span>
                    <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">{selectedColor?.name || "Select"}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color: any) => {
                      const isSelected = selectedColor?.name === color.name;
                      const colorHex = color.hex || color.value || '#000';
                      return (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-10 h-10 rounded-full transition-all duration-300 ${isSelected ? 'ring-2 ring-zinc-900 ring-offset-4' : 'hover:scale-110'}`}
                        >
                          <div 
                            className="w-full h-full rounded-full border border-zinc-100 shadow-sm"
                            style={{ backgroundColor: colorHex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Size</span>
                    <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest underline decoration-zinc-200 underline-offset-4">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 min-w-[70px] h-12 flex items-center justify-center rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedSize === size ? 'bg-zinc-900 text-white shadow-soft-xl' : 'bg-white text-zinc-500 border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-zinc-100 rounded-3xl h-16 p-1.5 shadow-soft-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="w-12 h-full flex items-center justify-center rounded-2xl hover:bg-zinc-50 transition-colors text-zinc-400 hover:text-zinc-900"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-display font-bold text-lg tabular-nums text-zinc-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="w-12 h-full flex items-center justify-center rounded-2xl hover:bg-zinc-50 transition-colors text-zinc-400 hover:text-zinc-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
                    className={`flex-1 h-16 flex items-center justify-center gap-3 rounded-3xl transition-all duration-500 font-bold text-sm uppercase tracking-widest ${
                      (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)
                      ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-soft-xl active:scale-[0.98]'
                    }`}
                  >
                    <span>{(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? 'Select Options' : 'Add to Bag'}</span>
                    <ShoppingBag size={18} />
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); toggleItem(product._id); }}
                    className={`w-16 h-16 flex items-center justify-center rounded-3xl transition-all duration-500 ${isWishlisted(product._id) ? 'bg-zinc-900 text-white shadow-soft-xl' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900 shadow-soft-sm'}`}
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
        <div className="bg-zinc-900 rounded-[3.5rem] py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10 px-6">
            <div className="space-y-6">
              <h2 className="font-display font-bold text-5xl md:text-7xl text-white tracking-tight leading-none">
                Stay in the <span className="text-zinc-500">Loop</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                Join our collective for early access to limited drops, unique collaborations, and curated editorial pieces.
              </p>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
               <input 
                 type="email" 
                 placeholder="Enter your email" 
                 className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 px-8 h-16 rounded-3xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
               />
               <button className="h-16 px-12 bg-white text-zinc-900 font-bold rounded-3xl uppercase text-xs tracking-widest hover:bg-zinc-100 transition-all shadow-soft-xl active:scale-95">
                 Join Now
               </button>
            </form>
            
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
