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
    <main className="min-h-screen bg-[#f0ece5] text-black font-sans relative">
      {/* Blueprint Grid Overlay */}
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
      style={{
        backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
        backgroundSize: '40px 40px'
      }}
    />

    <div className="border-b border-black relative z-10 bg-[#f0ece5]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <nav className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-medium tracking-widest text-black/50 uppercase">
          <span className="text-black font-bold">[ ROOT_DIR ]</span>
          <span className="text-black/30">/</span>
          <Link href="/" className="hover:text-black hover:bg-black/5 transition-colors px-1">HOME</Link>
          <span className="text-black/30">/</span>
          <Link href="/shop" className="hover:text-black hover:bg-black/5 transition-colors px-1">SHOP</Link>
          <span className="text-black/30">/</span>
          {categoryName && (
            <>
              <span className="hover:text-black transition-colors cursor-pointer px-1">{categoryName}</span>
              <span className="text-black/30">/</span>
            </>
          )}
          <span className="text-black font-bold px-1">{product.title}</span>
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          <div className="font-mono text-[10px] tracking-widest flex items-center gap-2 border border-black px-2 py-1">
            <span className="w-1.5 h-1.5 bg-black animate-pulse" />
            SYS_ACTIVE
          </div>
          <button className="p-2 border border-black hover:bg-black hover:text-[#f0ece5] transition-colors flex items-center justify-center" title="Share">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>

    <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-7 flex flex-col">
          <div
            className="w-full bg-white mb-3 relative overflow-hidden group cursor-crosshair border border-black"
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
                    src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"}
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
              <div className="absolute top-0 left-0 z-10 border-b border-r border-black">
                <span className="bg-black text-[#f0ece5] font-mono text-[10px] font-black uppercase tracking-widest px-4 py-2 block">
                  {product.badge}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 z-10 border-t border-l border-black bg-[#f0ece5] px-2 py-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest">ZOOM_ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center w-full gap-3">
            <button className="swiper-prev-custom shrink-0 w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-[#f0ece5] transition-all bg-white">
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
                    <div className={`aspect-[3/4] bg-white border transition-all relative overflow-hidden ${thumbsSwiper?.activeIndex === idx ? 'border-black' : 'border-black/20 opacity-60 hover:opacity-100'}`}>
                      <Image
                        src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"}
                        alt="thumb"
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <button className="swiper-next-custom shrink-0 w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-[#f0ece5] transition-all bg-white">
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-[100px] lg:self-start">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black border border-black px-3 py-1.5 bg-white">
                {categoryName || "Collection"}
              </span>
              {product.inventory > 0 && (
                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-black uppercase tracking-widest border border-black px-3 py-1.5 bg-emerald-400/20">
                  <span className="w-1.5 h-1.5 bg-black animate-pulse" />
                  IN_STOCK
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.9] tracking-tight" style={{ WebkitTextStroke: "1px black", color: "transparent" }}>
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-black font-display tracking-tight">
                ৳{Math.round(product.price).toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg font-bold text-black/40 line-through">
                    ৳{Math.round(product.compareAtPrice).toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-black text-[#f0ece5] px-2.5 py-1">
                    SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="border border-black bg-white p-4 relative">
              <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 transform -translate-y-full border-t border-l border-r border-black">
                SYS_DESC
              </div>
              <p className="font-mono text-xs leading-[1.8] text-black font-medium tracking-wide">
                {product.description || "Expertly crafted garment with premium materials and contemporary silhouette."}
              </p>
            </div>

            <div className="w-full h-[1px] bg-black" />

            {product.colors?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-[10px] font-black uppercase tracking-widest">COLOR_SELECT</h3>
                  <span className="font-mono text-[10px] font-medium text-black/60 tracking-widest border-b border-black/20 pb-0.5">[{selectedColor?.name || "NONE"}]</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: any) => {
                    const isSelected = selectedColor?.name === color.name;
                    const colorHex = color.hex || color.value || '#999';
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex items-center gap-3 px-4 py-2.5 border transition-all font-mono text-[10px] font-bold uppercase tracking-wider bg-white ${isSelected ? 'border-black' : 'border-black/20 hover:border-black'}`}
                      >
                        <span className="relative w-4 h-4 border border-black shrink-0">
                          <span className="absolute inset-0" style={{ backgroundColor: colorHex }} />
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke={isLightColor(colorHex) ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="square" />
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
                  <h3 className="font-mono text-[10px] font-black uppercase tracking-widest">SIZE_SELECT</h3>
                  <button className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-black uppercase tracking-widest border-b border-black/20 pb-0.5 hover:border-black transition-colors">
                    <Ruler size={12} /> SIZE_GUIDE
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-[40px] px-3.5 flex items-center justify-center border transition-all font-mono text-[11px] font-black uppercase tracking-wider ${selectedSize === size ? 'border-black bg-black text-[#f0ece5]' : 'border-black/20 bg-white text-black hover:border-black'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center border border-black w-fit bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-[#f0ece5] transition-colors"><Minus size={14} /></button>
                <span className="w-12 text-center font-mono text-[13px] font-black tabular-nums border-x border-black/10 flex items-center justify-center h-10">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-[#f0ece5] transition-colors"><Plus size={14} /></button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
                  className={`flex-1 flex items-center justify-between px-4 py-3 min-h-[48px] border transition-all active:scale-[0.98] ${(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed'
                    : 'bg-black text-[#f0ece5] border-black hover:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                    }`}
                >
                  <span className="font-mono font-black text-[11px] sm:text-[12px] uppercase tracking-widest whitespace-nowrap">
                    {(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? 'SELECT_VAR' : 'ADD_TO_CART'}
                  </span>
                  <ShoppingBag size={16} className="shrink-0" />
                </button>

                <button
                  onClick={(e) => { e.preventDefault(); toggleItem(product._id); }}
                  className={`w-[48px] min-h-[48px] shrink-0 flex items-center justify-center border transition-all ${isWishlisted(product._id) ? 'border-black bg-black text-[#f0ece5]' : 'border-black bg-white text-black hover:bg-black hover:text-[#f0ece5]'}`}
                >
                  <Heart size={16} fill={isWishlisted(product._id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Truck, label: "SYS_SHIP", sub: "FREE_OVER_3000" },
                { icon: RotateCcw, label: "SYS_RETN", sub: "30_DAY_WINDOW" },
                { icon: ShieldCheck, label: "SYS_GUAR", sub: "QUALITY_ASSUR" },
                { icon: CreditCard, label: "SYS_PAYM", sub: "SECURE_GATEWAY" }
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 p-3 bg-white border border-black hover:bg-black hover:text-[#f0ece5] transition-colors group">
                  <badge.icon size={16} className="text-black group-hover:text-[#f0ece5] shrink-0 transition-colors" />
                  <div>
                    <p className="font-mono text-[9px] font-black uppercase tracking-widest leading-none mb-1">{badge.label}</p>
                    <p className="font-mono text-[8px] font-medium text-black/50 group-hover:text-[#f0ece5]/70 tracking-widest uppercase">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full h-[1px] bg-black" />

            <div className="border border-black bg-white">
              {[
                { title: "SHIPPING", icon: Truck, content: "Fast, tracked shipping on all orders. Standard delivery 5-7 business days." },
                { title: "RETURNS", icon: RotateCcw, content: "Free returns within 30 days of purchase. Items must be in original condition." },
                { title: "PAYMENT_METHODS", icon: CreditCard, content: "We accept Visa, MasterCard, bKash, and Cash on Delivery." },
                { title: "PRODUCT_GUARANTEE", icon: Award, content: "This product is backed by our quality guarantee." }
              ].map((item, idx) => (
                <div key={item.title} className={`border-b border-black last:border-b-0`}>
                  <button onClick={() => setActiveAccordion(activeAccordion === item.title ? null : item.title)} className="w-full flex items-center justify-between p-4 group hover:bg-black/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon size={14} className="text-black" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black">{item.title}</span>
                    </div>
                    <div className="w-4 h-4 border border-black flex items-center justify-center bg-white group-hover:bg-black group-hover:text-white transition-colors">
                      <Plus size={10} className={`transition-transform duration-300 ${activeAccordion === item.title ? 'rotate-45' : ''}`} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === item.title ? 'max-h-40 opacity-100 pb-4 px-4 border-t border-black/10' : 'max-h-0 opacity-0 px-4'}`}>
                    <p className="font-mono text-[10px] leading-[1.8] text-black pt-4">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-b border-black relative z-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="py-16 lg:py-24 lg:pr-16 lg:border-r border-black">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black/50 mb-6 block border border-black/20 w-fit px-3 py-1">SYS_DETAILS</span>
            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.95] tracking-tight">DESIGN &<br />SPECIFICATION</h2>
          </div>
          <div className="py-12 lg:py-24 lg:pl-16 flex items-center">
            <div className="space-y-8 w-full">
              <p className="font-mono text-xs md:text-sm font-medium leading-[1.8] tracking-wide text-black bg-[#f0ece5] p-4 border border-black">{product.description}</p>
              {product.attributes?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 border border-black bg-[#f0ece5]">
                  {product.attributes.map((attr: any, idx: number) => (
                    <div key={attr.name} className={`flex justify-between p-3 ${idx % 2 === 0 ? 'sm:border-r border-black' : ''} ${idx >= 2 ? 'border-t border-black' : 'border-t sm:border-t-0 border-black'} first:border-t-0`}>
                      <span className="font-mono text-[9px] font-black uppercase tracking-widest text-black/50">{attr.name}</span>
                      <span className="font-mono text-[10px] font-bold text-black uppercase tracking-widest">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="relative w-full py-8 overflow-hidden bg-black border-y border-white/20">
      <div className="animate-marquee whitespace-nowrap flex gap-12 text-xl md:text-3xl font-display font-black uppercase tracking-tight text-[#f0ece5]">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="text-[#f0ece5]/30">✦</span> FREE_SHIPPING_&gt;_3000 <span className="text-[#f0ece5]/30">✦</span> PREMIUM_QUALITY_SYS <span className="text-[#f0ece5]/30">✦</span> 30_DAY_EASY_RETURNS
          </span>
        ))}
      </div>
    </div>

    <div className="relative z-10">
      {relatedProducts.length > 0 && <BrutalistProductGrid initialProducts={relatedProducts} />}
    </div>

    <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32 relative z-10">
      <ProductReviews slug={product.slug} />
    </div>

    <div className="relative w-full min-h-[500px] lg:min-h-[600px] bg-white border-t border-black overflow-hidden flex items-center">
      {/* Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full border-[20px] border-[#f0ece5] pointer-events-none z-20" />
      <div className="absolute top-8 left-8 border border-black bg-white px-3 py-1 z-20">
        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-black animate-pulse" />
          SYS_PHILOSOPHY
        </span>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-12 md:px-24 flex items-center justify-between">
        <div className="max-w-3xl border border-black bg-[#f0ece5] p-8 md:p-16 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-black" />
          <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-black" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-t border-r border-black" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-t border-l border-black" />

          <h2 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tight text-black mb-8" style={{ WebkitTextStroke: "2px black", color: "transparent" }}>
            TIMELESS<br />PIECES<br />MODERN SOUL
          </h2>
          <div className="border-t-2 border-black pt-6 flex flex-col md:flex-row gap-8">
            <p className="font-mono text-sm font-medium tracking-widest max-w-sm leading-relaxed text-black/80">
              [ 01 ] EVERY PIECE TELLS A STORY OF CRAFTSMANSHIP, QUALITY MATERIALS, AND DESIGNS THAT TRANSCEND SEASONS.
            </p>
            <div className="font-mono text-[10px] font-black tracking-widest text-black/40 uppercase flex flex-col gap-1 border-l border-black/20 pl-8">
              <span>EST: 2026</span>
              <span>ORIGIN: DHAKA, BD</span>
              <span>BATCH: {product._id?.toString().slice(-6) || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  );
}
