"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ShoppingBag, Heart, ArrowRight, Minus, Plus, Star, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useQuickLook } from "@/store/quickLookStore";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickLookDrawer() {
  const { isOpen, product, closeQuickLook } = useQuickLook();
  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const images = product.images?.map((img: any) => {
    const src = img.url || img.src || "";
    return (src && src.length > 5) ? src : "https://placehold.co/600x800?text=No+Image";
  }) || ["https://placehold.co/600x800?text=No+Image"];

  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const currentPrice = product.priceNum || product.price;
  const wishlisted = isWishlisted(product._id || product.id);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={closeQuickLook} className="relative z-[700]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-0 md:p-6 lg:p-12">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-[0.16,1,0.3,1] duration-700"
            enterFrom="scale-95 opacity-0 translate-y-8"
            enterTo="scale-100 opacity-100 translate-y-0"
            leave="transform transition ease-[0.16,1,0.3,1] duration-500"
            leaveFrom="scale-100 opacity-100 translate-y-0"
            leaveTo="scale-95 opacity-0 translate-y-8"
          >
            <DialogPanel className="relative w-full max-w-6xl h-full lg:h-auto max-h-screen lg:max-h-[90vh] bg-[#111111] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
              
              {/* Close Button */}
              <button
                onClick={closeQuickLook}
                className="absolute top-8 right-8 z-[60] w-12 h-12 flex items-center justify-center bg-[#1a1a1a] text-[#8e9192] hover:text-white transition-all duration-500"
                aria-label="Close"
              >
                <X size={24} strokeWidth={1} className="hover:rotate-90 transition-transform duration-500" />
              </button>

              {/* Left: Image Gallery */}
              <div className="w-full lg:w-[55%] relative bg-[#0e0e0e] flex flex-col h-[45vh] lg:h-auto border-r border-white/5">
                <div className="relative flex-1 overflow-hidden group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[activeImageIndex]}
                        alt={product.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-10 left-10 flex flex-col gap-3 pointer-events-none">
                    <div className="bg-white text-[#0a0a0a] px-4 py-2 label-tiny" style={{ fontSize: '9px' }}>
                      NEW ARCHIVE
                    </div>
                  </div>
                </div>

                {/* Thumbnails (Desktop) */}
                <div className="hidden lg:flex gap-4 p-8 bg-[#111] border-t border-white/5 overflow-x-auto scrollbar-hide">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-24 overflow-hidden transition-all duration-500 border border-white/5 ${activeImageIndex === idx ? 'ring-1 ring-white scale-105' : 'opacity-30 hover:opacity-100 hover:scale-105'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover grayscale hover:grayscale-0" sizes="80px" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Details */}
              <div className="w-full lg:w-[45%] flex flex-col bg-[#111] overflow-y-auto scrollbar-hide">
                <div className="flex-1 px-8 lg:px-16 py-12 lg:py-20 space-y-12">
                  
                  {/* Title & Price */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="label-tiny text-[#555]">
                        {product.category?.name || "Archive Collection"}
                      </span>
                      <button 
                        onClick={() => toggleItem(product._id || product.id)}
                        className={`p-2 transition-all ${wishlisted ? 'text-white' : 'text-[#333] hover:text-[#8e9192]'}`}
                      >
                        <Heart size={20} fill={wishlisted ? "currentColor" : "none"} strokeWidth={1} />
                      </button>
                    </div>
                    <h2 className="font-serif text-4xl lg:text-5xl text-white tracking-tight leading-[1.1]">
                      {product.title}
                    </h2>
                    <div className="flex items-center gap-8 pt-2">
                      <p className="font-serif text-3xl text-white">
                        ৳{Math.round(currentPrice).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 label-tiny text-[#555]">
                        <Star size={12} className="fill-[#555] text-[#555]" />
                        <span className="text-white">4.9</span>
                        <span className="ml-2">128 Specimens</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h4 className="label-tiny text-[#8e9192]">Archival Note</h4>
                    <p className="text-[#8e9192] text-sm font-light leading-relaxed max-w-md">
                      {product.description || "Designed for extreme durability and minimalist impact. Engineered with high-performance textiles and structural intent."}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-12">
                    {/* Color */}
                    {colors.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="label-tiny text-[#8e9192]">Chromatic Range</h4>
                          {selectedColor && <span className="label-tiny text-[#555]">{selectedColor.name}</span>}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {colors.map((c: any) => (
                            <button
                              key={c.name}
                              onClick={() => setSelectedColor(c)}
                              className={`w-10 h-10 border p-1 transition-all duration-500 ${selectedColor?.name === c.name ? 'border-white scale-110' : 'border-white/5 hover:border-white/20'}`}
                            >
                              <div
                                className="w-full h-full grayscale hover:grayscale-0 transition-all"
                                style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size */}
                    {sizes.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="label-tiny text-[#8e9192]">Metric System</h4>
                          <button className="label-tiny text-[#333] hover:text-white transition-colors">Guide</button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {sizes.map((s: string) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSize(s)}
                              className={`h-14 flex items-center justify-center label-tiny transition-all ${selectedSize === s ? 'bg-white text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#555] hover:bg-[#222] hover:text-white'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-6">
                      <h4 className="label-tiny text-[#8e9192]">Quantity</h4>
                      <div className="flex items-center bg-[#1a1a1a] w-fit p-1 border border-white/5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 flex items-center justify-center text-[#555] hover:text-white transition-all"
                        >
                          <Minus size={16} strokeWidth={1} />
                        </button>
                        <span className="w-12 text-center label-tiny text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-12 h-12 flex items-center justify-center text-[#555] hover:text-white transition-all"
                        >
                          <Plus size={16} strokeWidth={1} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="p-8 lg:p-16 bg-[#111] border-t border-white/5 sticky bottom-0">
                  <div className="flex flex-col gap-6">
                    <button
                      onClick={() => {
                        if ((colors.length > 0 && !selectedColor) || (sizes.length > 0 && !selectedSize)) return;
                        addItem({
                          id: product._id || product.id.toString(),
                          slug: product.slug,
                          title: product.title,
                          price: currentPrice,
                          quantity: quantity,
                          color: selectedColor?.name || "Default",
                          size: selectedSize || "Default",
                          image: images[0]
                        });
                        closeQuickLook();
                        openCart();
                      }}
                      disabled={(colors.length > 0 && !selectedColor) || (sizes.length > 0 && !selectedSize)}
                      className="w-full py-6 bg-white text-[#0a0a0a] label-tiny flex items-center justify-center gap-6 group disabled:bg-[#1a1a1a] disabled:text-[#333] disabled:cursor-not-allowed hover:bg-[#e5e2e1] transition-all rounded-full"
                    >
                      <span className="flex items-center gap-4">
                        <ShoppingBag size={18} strokeWidth={1} />
                        {(!selectedColor && colors.length > 0) 
                          ? "Specify Chromatic" 
                          : (!selectedSize && sizes.length > 0) 
                            ? "Specify Metric" 
                            : "Add to Archive"}
                      </span>
                      <div className="w-px h-4 bg-[#0a0a0a]/10" />
                      <span className="font-serif text-lg lowercase">
                        ৳{Math.round(currentPrice * quantity).toLocaleString()}
                      </span>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      onClick={closeQuickLook}
                      className="label-tiny text-[#555] hover:text-white transition-all text-center flex items-center justify-center gap-3 group"
                    >
                      View Comprehensive Details
                      <Maximize2 size={12} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
