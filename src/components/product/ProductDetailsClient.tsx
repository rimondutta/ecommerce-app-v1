"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import ProductReviews from "@/components/sections/ProductReviews";
import EditorialProductGrid from "@/components/sections/EditorialProductGrid";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface ProductDetailsClientProps { product: any; relatedProducts: any[]; }

export default function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("Composition & Care");
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return;
    if (product.colors?.length > 0 && !selectedColor) return;
    addItem({
      id: product._id.toString(), slug: product.slug, title: product.title, price: product.price, quantity,
      color: selectedColor?.name || "Default", size: selectedSize || "Default",
      image: (product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"
    });
    openCart();
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumbs */}
      <div className="relative z-40 bg-[#0a0a0a]">
        <div className="max-w-[1800px] mx-auto px-6 md:px-16 py-8">
          <nav className="flex items-center gap-4 label-tiny text-[#8e9192]">
            <Link href="/" className="hover:text-white transition-colors">Archive</Link>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <Link href="/products" className="hover:text-white transition-colors">Catalog</Link>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span className="text-white truncate max-w-[150px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* Gallery — Sharp edges, grayscale→color */}
          <div className="lg:col-span-7">
            <div className="hidden md:grid grid-cols-2 gap-2">
              {product.images?.map((img: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }} className={`relative overflow-hidden bg-[#111] group ${idx === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/5]'}`}>
                  <Image src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"} alt={`${product.title} view ${idx + 1}`} fill className="object-cover transition-all duration-[600ms] ease-[0.16,1,0.3,1] group-hover:scale-105 grayscale group-hover:grayscale-0" priority={idx === 0} />
                  <div className="absolute top-6 left-6">
                    <span className="label-tiny text-white/40">VIEW_0{idx + 1}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="md:hidden">
              <Swiper modules={[Pagination, EffectFade]} pagination={{ clickable: true }} effect="fade" className="aspect-[4/5] overflow-hidden bg-[#111]">
                {product.images?.map((img: any, idx: number) => (
                  <SwiperSlide key={idx}><div className="relative w-full h-full"><Image src={(img.url && img.url.length > 1) ? img.url : "/placeholder.jpg"} alt={product.title} fill className="object-cover grayscale" /></div></SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32 space-y-10">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="label-tiny text-[#8e9192]">{categoryName || "Archive Collection"}</span>
                  <div className="h-[1px] w-12 bg-[#333]" />
                </div>
                <h1 className="font-serif text-5xl md:text-7xl text-white leading-[0.9] tracking-[-0.02em]">{product.title}</h1>
                <div className="flex items-baseline gap-6">
                  <span className="font-serif text-4xl text-white tracking-tight">৳{Math.round(product.price).toLocaleString()}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg font-light text-[#555] line-through">৳{Math.round(product.compareAtPrice).toLocaleString()}</span>
                  )}
                </div>
                <p className="body-lg text-[#8e9192] max-w-xl">{product.description || "A masterclass in modern textile engineering."}</p>
              </motion.div>

              <div className="space-y-10 pt-6">
                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="label-tiny text-[#8e9192]">Color</span>
                      <span className="label-tiny text-white">{selectedColor?.name || "Select"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color: any) => {
                        const isSelected = selectedColor?.name === color.name;
                        return (
                          <button key={color.name} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full transition-all duration-300 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] scale-110' : 'ring-1 ring-[#333] hover:scale-105'}`}>
                            <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex || color.value || '#333' }} />
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
                      <span className="label-tiny text-[#8e9192]">Size</span>
                      <button className="label-tiny text-[#555] hover:text-white transition-colors underline underline-offset-4 decoration-[#333]">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size: string) => (
                        <button key={size} onClick={() => setSelectedSize(size)} className={`flex-1 min-w-[70px] h-14 flex items-center justify-center label-tiny transition-all duration-300 ${selectedSize === size ? 'bg-white text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#8e9192] hover:text-white hover:bg-[#222]'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#1a1a1a] h-16 px-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-[#8e9192] hover:text-white transition-colors"><Minus size={16} strokeWidth={1} /></button>
                      <span className="w-10 text-center font-serif text-lg text-white">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-[#8e9192] hover:text-white transition-colors"><Plus size={16} strokeWidth={1} /></button>
                    </div>
                    <button onClick={handleAddToCart} disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)} className={`flex-1 h-16 flex items-center justify-center gap-4 rounded-full label-tiny transition-all duration-300 group ${(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor) ? 'bg-[#1a1a1a] text-[#555]' : 'bg-white text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white'}`}>
                      <span>{(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? 'Select Options' : 'Add to Bag'}</span>
                      <ShoppingBag size={16} strokeWidth={1} />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); toggleItem(product._id); }} className={`w-16 h-16 flex items-center justify-center transition-all duration-300 ${isWishlisted(product._id) ? 'bg-white text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#8e9192] hover:text-white'}`}>
                      <Heart size={18} strokeWidth={1} fill={isWishlisted(product._id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                {[{ icon: Truck, label: "Free Shipping" }, { icon: RotateCcw, label: "Easy Returns" }, { icon: ShieldCheck, label: "Secure Pay" }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-4 bg-[#111]">
                    <Icon size={16} strokeWidth={1} className="text-[#8e9192]" />
                    <span className="label-tiny text-[#555]" style={{ fontSize: '8px', letterSpacing: '0.2em' }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="pt-4">
                {[
                  { title: "Composition & Care", content: "Expertly crafted from 100% premium grade cotton. Gentle machine wash at 30°C. Air dry only." },
                  { title: "Shipping & Returns", content: "Complimentary express shipping on orders over ৳1,000. 14-day return window." },
                  { title: "Details", content: "Ergonomic fit with reinforced seams at high-stress points for enhanced durability." }
                ].map((item) => (
                  <div key={item.title} className="border-b border-[#1a1a1a] last:border-0">
                    <button onClick={() => setActiveAccordion(activeAccordion === item.title ? null : item.title)} className="w-full py-6 flex items-center justify-between">
                      <span className="label-tiny text-white">{item.title}</span>
                      <div className={`w-6 h-6 flex items-center justify-center transition-all ${activeAccordion === item.title ? 'rotate-45 text-white' : 'text-[#555]'}`}><Plus size={14} strokeWidth={1} /></div>
                    </button>
                    <AnimatePresence>
                      {activeAccordion === item.title && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                          <p className="pb-8 body-sm text-[#8e9192]">{item.content}</p>
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

      {/* Related Products */}
      <div className="py-24 bg-[#0e0e0e]">
        <div className="max-w-[1800px] mx-auto px-6 md:px-16 flex items-end justify-between mb-16">
          <div>
            <span className="label-tiny text-[#8e9192] mb-4 block">Curated For You</span>
            <h3 className="font-serif text-3xl md:text-5xl text-white tracking-tight">You May Also Like</h3>
          </div>
          <Link href="/products" className="group flex items-center gap-3 label-tiny text-[#8e9192] hover:text-white transition-all">
            Browse All
            <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center group-hover:bg-white group-hover:text-[#0a0a0a] transition-all"><ArrowRight size={14} strokeWidth={1} /></div>
          </Link>
        </div>
        {relatedProducts.length > 0 && (
          <div className="max-w-[1800px] mx-auto px-6 md:px-16">
            <EditorialProductGrid initialProducts={relatedProducts} />
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 py-24">
        <ProductReviews slug={product.slug} />
      </div>
    </main>
  );
}
