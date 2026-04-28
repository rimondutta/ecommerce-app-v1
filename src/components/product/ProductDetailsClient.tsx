"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  ShoppingBag, 
  ArrowLeft, 
  Share2, 
  Ruler, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Plus, 
  Minus, 
  ArrowRight, 
  CreditCard, 
  Award, 
  ChevronRight,
  Maximize2
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, EffectFade } from "swiper/modules";
import ProductReviews from "@/components/sections/ProductReviews";
import EditorialProductGrid from "@/components/sections/EditorialProductGrid";

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
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
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

  const isLightColor = (hex: string) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Subtle Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Navigation / Breadcrumbs */}
      <div className="border-b border-black/5 sticky top-[80px] z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={10} className="text-black/20" />
            <Link href="/shop" className="hover:text-black transition-colors">Collection</Link>
            <ChevronRight size={10} className="text-black/20" />
            {categoryName && (
              <>
                <span className="hover:text-black transition-colors cursor-pointer">{categoryName}</span>
                <ChevronRight size={10} className="text-black/20" />
              </>
            )}
            <span className="text-black">{product.title}</span>
          </nav>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 group">
               <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">Share</span>
               <Share2 size={12} className="text-black/40 group-hover:text-black transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group border border-black/5 bg-[#fafafa]">
              <Swiper
                modules={[Navigation, Pagination, Thumbs, EffectFade]}
                effect="fade"
                thumbs={{ swiper: thumbsSwiper }}
                className="aspect-[4/5] w-full"
              >
                {product.images?.map((img: any, idx: number) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full overflow-hidden">
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
                className="absolute bottom-6 right-6 z-10 w-12 h-12 bg-white border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 rounded-full shadow-xl"
              >
                <Maximize2 size={18} />
              </button>

              {product.badge && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-4">
              <button className="swiper-prev-custom w-12 h-12 border border-black/10 flex items-center justify-center hover:border-black transition-colors bg-white">
                <ArrowLeft size={16} />
              </button>
              <div className="flex-1 overflow-hidden">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={12}
                  slidesPerView={5}
                  watchSlidesProgress
                  modules={[Navigation]}
                  className="w-full"
                >
                  {product.images?.map((img: any, idx: number) => (
                    <SwiperSlide key={idx} className="cursor-pointer">
                      <div className={`aspect-[4/5] bg-[#fafafa] border transition-all duration-500 overflow-hidden ${thumbsSwiper?.activeIndex === idx ? 'border-black' : 'border-black/5 opacity-40 hover:opacity-100'}`}>
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
              <button className="swiper-next-custom w-12 h-12 border border-black/10 flex items-center justify-center hover:border-black transition-colors bg-white">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-5 lg:sticky lg:top-[160px] lg:self-start space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
                  {categoryName || "Collection"}
                </span>
                <span className="w-1 h-1 rounded-full bg-black/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">In Stock</span>
              </div>
              
              <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tighter">
                {product.title}
              </h1>

              <div className="flex items-center gap-6 pt-4">
                <span className="text-4xl font-black font-display tracking-tight">
                  ৳{Math.round(product.price).toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-black/20 line-through">
                      ৳{Math.round(product.compareAtPrice).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black bg-black text-white px-2 py-1 uppercase tracking-widest">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm font-medium leading-relaxed text-black/60 max-w-md">
              {product.description || "Refined silhouette engineered with precision. A testament to modern minimalism and superior textile engineering."}
            </p>

            {/* Selection Controls */}
            <div className="space-y-8">
              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Select Color</span>
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{selectedColor?.name || "Required"}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: any) => {
                      const isSelected = selectedColor?.name === color.name;
                      const colorHex = color.hex || color.value || '#000';
                      return (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-12 h-12 flex items-center justify-center group transition-all duration-500 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                        >
                          <div 
                            className={`w-full h-full rounded-full transition-all duration-500 border ${isSelected ? 'border-black scale-110' : 'border-transparent'}`}
                            style={{ padding: '4px' }}
                          >
                            <div 
                              className="w-full h-full rounded-full border border-black/5"
                              style={{ backgroundColor: colorHex }}
                            />
                          </div>
                          {isSelected && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
                          )}
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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Select Size</span>
                    <button className="text-[10px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2 hover:text-black transition-colors border-b border-black/10 pb-0.5">
                      <Ruler size={12} /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[64px] h-12 px-4 flex items-center justify-center border text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-black/10 h-14 bg-white">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-full flex items-center justify-center hover:bg-black/5 transition-colors"><Minus size={14} /></button>
                    <span className="w-14 text-center font-display font-black text-lg tabular-nums">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-full flex items-center justify-center hover:bg-black/5 transition-colors"><Plus size={14} /></button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
                    className={`flex-1 h-14 flex items-center justify-between px-8 border transition-all duration-500 uppercase tracking-[0.2em] font-black text-[11px] ${
                      (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)
                      ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-black text-white border-black hover:bg-neutral-900 active:scale-[0.98]'
                    }`}
                  >
                    <span>{(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? 'Select Options' : 'Add to bag'}</span>
                    <ShoppingBag size={18} />
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); toggleItem(product._id); }}
                    className={`w-14 h-14 flex items-center justify-center border transition-all duration-500 ${isWishlisted(product._id) ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black text-black'}`}
                  >
                    <Heart size={20} fill={isWishlisted(product._id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>

            {/* Features Accordion */}
            <div className="border-t border-black/10">
              {[
                { title: "Composition & Care", content: "Main: 100% Cotton. Machine wash at 30°C. Do not tumble dry. Cool iron on reverse." },
                { title: "Shipping & Returns", content: "Complimentary worldwide shipping on orders over ৳3000. 14-day free return policy." },
                { title: "Payment Info", content: "Secure transactions with bKash, Visa, and Mastercard. Cash on delivery available." }
              ].map((item) => (
                <div key={item.title} className="border-b border-black/10">
                  <button 
                    onClick={() => setActiveAccordion(activeAccordion === item.title ? null : item.title)}
                    className="w-full py-6 flex items-center justify-between group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{item.title}</span>
                    <Plus size={14} className={`transition-transform duration-500 ${activeAccordion === item.title ? 'rotate-45' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-700 ease-[0.16,1,0.3,1] ${activeAccordion === item.title ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                    <p className="text-[11px] leading-relaxed text-black/50 font-medium">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Section */}
      <div className="border-y border-black/5 py-24 md:py-40 bg-[#fafafa] relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 block">Technical Specification</span>
              <h2 className="font-display font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tighter">
                Crafted For<br />Perfection
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-black/60 max-w-xl">
                Every stitch is a testament to our commitment to excellence. We source only the finest fabrics and employ master tailors to ensure each piece meets our rigorous standards of quality and aesthetic integrity.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-2">Material</span>
                   <p className="text-sm font-bold uppercase tracking-widest">Premium Egyptian Cotton</p>
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-2">Origin</span>
                   <p className="text-sm font-bold uppercase tracking-widest">Ethically Made in BD</p>
                </div>
              </div>
           </div>

           <div className="relative aspect-[4/3] group overflow-hidden border border-black/5">
              <Image 
                src={product.images?.[1]?.url || product.images?.[0]?.url || "/placeholder.jpg"} 
                alt="Detail" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-[0.16,1,0.3,1]"
              />
              <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
           </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="py-24">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-end justify-between mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Curated For You</span>
            <h3 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter">You May Also Like</h3>
          </div>
          <Link href="/shop" className="group flex items-center gap-4 border-b border-black pb-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">View All</span>
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="max-w-[1800px] mx-auto">
            <EditorialProductGrid initialProducts={relatedProducts} />
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-32">
        <ProductReviews slug={product.slug} />
      </div>

      {/* Brand Footer CTA */}
      <div className="bg-black py-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 text-center space-y-12 relative z-10">
          <h2 className="font-display font-black text-6xl md:text-9xl lg:text-[12rem] text-white uppercase leading-[0.8] tracking-tighter opacity-10">
            Timeless Piece
          </h2>
          <div className="max-w-2xl mx-auto space-y-8">
            <p className="text-white/60 font-mono text-sm tracking-widest leading-relaxed uppercase">
              Subscribe to join our inner circle and receive exclusive access to new drops, limited editions, and curated editorial content.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
               <input 
                 type="email" 
                 placeholder="ENTER YOUR EMAIL" 
                 className="flex-1 bg-white/5 border border-white/20 px-8 h-16 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors text-center md:text-left"
               />
               <button className="h-16 px-12 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-neutral-200 transition-colors">
                 Join Us
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
