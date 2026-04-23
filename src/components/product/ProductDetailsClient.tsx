"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowLeft, Share2, Ruler, ShieldCheck, Truck, RotateCcw, Star, Plus, Minus, ArrowRight, CreditCard, Award, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, EffectFade } from "swiper/modules";
import ProductReviews from "@/components/sections/ProductReviews";
import BrutalistProductGrid from "@/components/sections/BrutalistProductGrid";

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
      image: product.images?.[0]?.url || ""
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
    <main className="min-h-screen bg-white text-black font-sans">
      <div className="border-b border-black/10 bg-[#fafafa]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-black/40">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
            <ChevronRight size={12} />
            {categoryName && (
              <>
                <span className="hover:text-black transition-colors cursor-pointer">{categoryName}</span>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-black font-bold">{product.title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Share">
              <Share2 size={16} className="text-black/40" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-7 flex flex-col">
             <div 
               className="w-full bg-[#f5f5f3] mb-3 relative overflow-hidden group cursor-crosshair"
               onClick={() => setImageZoom(!imageZoom)}
             >
               <Swiper
                 modules={[Navigation, Pagination, Thumbs, EffectFade]}
                 effect="fade"
                 thumbs={{ swiper: thumbsSwiper }}
                 className="aspect-[3/4] w-full"
               >
                 {product.images?.map((img: any, idx: number) => (
                   <SwiperSlide key={idx}>
                     <Image 
                       src={img.url} 
                       alt={`${product.title} - View ${idx + 1}`} 
                       fill
                       className={`object-cover transition-transform duration-700 ${imageZoom ? 'scale-150' : 'scale-100 group-hover:scale-105'}`}
                       priority={idx === 0}
                       sizes="(max-width: 1024px) 100vw, 60vw"
                     />
                   </SwiperSlide>
                 ))}
               </Swiper>
               {product.badge && (
                 <div className="absolute top-5 left-5 z-10">
                   <span className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2">
                     {product.badge}
                   </span>
                 </div>
               )}
             </div>

             <div className="flex items-center w-full gap-3">
               <button className="swiper-prev-custom shrink-0 w-10 h-10 border border-black/10 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all">
                  <ArrowLeft size={14} />
               </button>
               <div className="flex-1">
                 <Swiper
                   onSwiper={setThumbsSwiper}
                   spaceBetween={8}
                   slidesPerView={4}
                   watchSlidesProgress
                   navigation={{ prevEl: '.swiper-prev-custom', nextEl: '.swiper-next-custom' }}
                   modules={[Navigation]}
                   className="w-full"
                 >
                   {product.images?.map((img: any, idx: number) => (
                     <SwiperSlide key={idx} className="cursor-pointer">
                       <div className={`aspect-[3/4] bg-[#f5f5f3] border-2 transition-all relative overflow-hidden ${thumbsSwiper?.activeIndex === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                         <Image src={img.url} alt="thumb" fill className="object-cover" sizes="100px" />
                       </div>
                     </SwiperSlide>
                   ))}
                 </Swiper>
               </div>
               <button className="swiper-next-custom shrink-0 w-10 h-10 border border-black/10 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all">
                  <ArrowRight size={14} />
               </button>
             </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-[100px] lg:self-start">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 border border-black/10 px-3 py-1.5">
                  {categoryName || "Collection"}
                </span>
                {product.inventory > 0 && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    In Stock
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.9] tracking-tight">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-black font-display tracking-tight">
                  ৳{Math.round(product.price).toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-lg font-bold text-black/30 line-through">
                      ৳{Math.round(product.compareAtPrice).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-2.5 py-1 border border-red-100">
                      Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm leading-[1.8] text-black/60 font-medium tracking-wide max-w-md border-l-2 border-black/10 pl-4">
                {product.description || "Expertly crafted garment with premium materials and contemporary silhouette."}
              </p>

              <div className="w-full h-px bg-black/10" />

              {product.colors?.length > 0 && (
                <div>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Color</h3>
                     <span className="text-[11px] font-medium text-black/40 tracking-wide">{selectedColor?.name || "Select"}</span>
                   </div>
                   <div className="flex flex-wrap gap-3">
                     {product.colors.map((color: any) => {
                       const isSelected = selectedColor?.name === color.name;
                       const colorHex = color.hex || color.value || '#999';
                       return (
                         <button
                           key={color.name}
                           onClick={() => setSelectedColor(color)}
                           className={`group relative flex items-center gap-3 px-4 py-3 border-2 transition-all text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'border-black' : 'border-black/10 hover:border-black/30'}`}
                         >
                            <span className="relative w-5 h-5 rounded-full shrink-0 border border-black/15 shadow-inner">
                              <span className="absolute inset-0 rounded-full" style={{ backgroundColor: colorHex }} />
                              {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke={isLightColor(colorHex) ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                              )}
                            </span>
                            {color.name}
                         </button>
                       );
                     })}
                   </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Size</h3>
                     <button className="flex items-center gap-1.5 text-[10px] font-bold text-black/40 uppercase tracking-wider hover:text-black transition-colors">
                       <Ruler size={12} /> Size Guide
                     </button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {product.sizes.map((size: string) => (
                       <button
                         key={size}
                         onClick={() => setSelectedSize(size)}
                         className={`min-w-[48px] h-[44px] px-3.5 flex items-center justify-center border-2 transition-all text-[11px] font-black uppercase tracking-wider ${selectedSize === size ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black hover:border-black/40'}`}
                       >
                         {size}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              <div className="space-y-3">
                 <div className="flex items-center border-2 border-black/10 w-fit">
                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 transition-colors"><Minus size={14} /></button>
                   <span className="w-12 text-center text-sm font-black tabular-nums">{quantity}</span>
                   <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 transition-colors"><Plus size={14} /></button>
                 </div>

                 <div className="flex gap-3">
                   <button 
                     onClick={handleAddToCart}
                     disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
                     className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 min-h-[52px] border-2 transition-all active:scale-[0.98] ${
                        (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)
                        ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-black text-white border-black hover:bg-neutral-900 shadow-lg shadow-black/10'
                      }`}
                   >
                     <ShoppingBag size={18} className="shrink-0" />
                     <span className="font-black text-[11px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">
                       {(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? 'Select Variation' : 'Add To Cart'}
                     </span>
                   </button>

                   <button 
                     onClick={(e) => { e.preventDefault(); toggleItem(product._id); }}
                     className={`w-[52px] min-h-[52px] shrink-0 flex items-center justify-center border-2 transition-all ${isWishlisted(product._id) ? 'border-black bg-black text-white' : 'border-black/10 text-black hover:border-black'}`}
                   >
                     <Heart size={18} fill={isWishlisted(product._id) ? "currentColor" : "none"} />
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "Orders over ৳3,000" },
                  { icon: RotateCcw, label: "Easy Returns", sub: "30-day returns" },
                  { icon: ShieldCheck, label: "Guarantee", sub: "Quality assured" },
                  { icon: CreditCard, label: "Secure Pay", sub: "100% protected" }
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-3 p-3 bg-[#fafafa] border border-black/5 rounded-sm">
                    <badge.icon size={18} className="text-black/30 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider leading-none mb-0.5">{badge.label}</p>
                      <p className="text-[9px] font-medium text-black/40 tracking-wide">{badge.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-black/10" />

              <div>
                 {[
                   { title: "SHIPPING", icon: Truck, content: "Fast, tracked shipping on all orders. Standard delivery 5-7 business days." },
                   { title: "RETURNS", icon: RotateCcw, content: "Free returns within 30 days of purchase. Items must be in original condition." },
                   { title: "PAYMENT METHODS", icon: CreditCard, content: "We accept Visa, MasterCard, bKash, and Cash on Delivery." },
                   { title: "PRODUCT GUARANTEE", icon: Award, content: "This product is backed by our quality guarantee." }
                 ].map((item, idx) => (
                   <div key={item.title} className={`border-b border-black/10 ${idx === 0 ? 'border-t' : ''}`}>
                     <button onClick={() => setActiveAccordion(activeAccordion === item.title ? null : item.title)} className="w-full flex items-center justify-between py-4 group">
                        <div className="flex items-center gap-3">
                          <item.icon size={15} className="text-black/25" />
                          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-black">{item.title}</span>
                        </div>
                        <Plus size={16} className={`text-black/40 transition-transform duration-300 ${activeAccordion === item.title ? 'rotate-45' : ''}`} />
                     </button>
                     <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === item.title ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                       <p className="text-[12px] font-medium leading-[1.8] text-black/50 pl-[27px]">{item.content}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f8f6] border-y border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="py-20 lg:py-32 lg:pr-20 lg:border-r border-black/10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-6 block">Product Details</span>
              <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.95] tracking-tight">Design &<br />Specification</h2>
            </div>
            <div className="py-16 lg:py-32 lg:pl-20 flex items-center">
              <div className="space-y-6">
                <p className="text-sm md:text-base font-medium leading-[2] tracking-wide text-black/60">{product.description}</p>
                {product.attributes?.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-4 border-t border-black/10">
                    {product.attributes.map((attr: any) => (
                      <div key={attr.name} className="flex justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black/30">{attr.name}</span>
                        <span className="text-[11px] font-bold text-black">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full py-8 overflow-hidden bg-black">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-xl md:text-3xl font-display font-black uppercase tracking-tight text-white/80">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="text-white/20">✦</span> FREE SHIPPING ON ORDERS OVER ৳3,000 <span className="text-white/20">✦</span> PREMIUM QUALITY GUARANTEED <span className="text-white/20">✦</span> 30-DAY EASY RETURNS
            </span>
          ))}
        </div>
      </div>

      {relatedProducts.length > 0 && <BrutalistProductGrid initialProducts={relatedProducts} />}

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32">
         <ProductReviews slug={product.slug} />
      </div>

      <div className="relative w-full h-[500px] lg:h-[600px] bg-neutral-900 overflow-hidden">
         <Image src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2000&auto=format&fit=crop" alt="story" fill className="object-cover object-top opacity-40 grayscale" />
         <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
         <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
            <div className="max-w-2xl">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Our Philosophy</p>
               <h2 className="font-display font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tight text-white/90 mb-8">Timeless<br />Pieces,<br />Modern Soul</h2>
               <p className="text-white/30 text-xs font-medium tracking-wide max-w-sm leading-relaxed">Every piece tells a story of craftsmanship, quality materials, and designs that transcend seasons.</p>
            </div>
         </div>
      </div>
    </main>
  );
}
