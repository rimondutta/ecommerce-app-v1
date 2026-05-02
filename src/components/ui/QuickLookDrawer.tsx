"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ShoppingBag, Heart, ArrowRight, Minus, Plus, Star, Maximize2, Check } from "lucide-react";
import Image from "next/image";
import { useQuickLook } from "@/store/quickLookStore";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
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
    return (src && src.length > 5) ? src : "/placeholder.jpg";
  }) || ["/placeholder.jpg"];

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
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md" aria-hidden="true" />
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
            <DialogPanel className="relative w-full max-w-6xl h-full lg:h-auto max-h-screen lg:max-h-[90vh] bg-white rounded-t-[2.5rem] lg:rounded-[3rem] shadow-soft-2xl overflow-hidden flex flex-col lg:flex-row">
              
              {/* Close Button */}
              <button
                onClick={closeQuickLook}
                className="absolute top-6 right-6 z-[60] w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-zinc-500 hover:text-zinc-900 shadow-soft transition-all active:scale-95"
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {/* Left: Image Gallery */}
              <div className="w-full lg:w-[55%] relative bg-zinc-50 flex flex-col h-[50vh] lg:h-auto">
                <div className="relative flex-1 overflow-hidden group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[activeImageIndex]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-8 left-8 flex flex-col gap-3 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">New Arrival</span>
                    </div>
                  </div>

                  {/* Thumbnail Navigation (Mobile overlay) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
                    {images.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? 'w-6 bg-zinc-900' : 'bg-zinc-900/20'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnails (Desktop) */}
                <div className="hidden lg:flex gap-4 p-8 bg-white border-t border-zinc-100 overflow-x-auto scrollbar-hide">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-24 rounded-2xl overflow-hidden transition-all duration-300 ${activeImageIndex === idx ? 'ring-2 ring-zinc-900 scale-105 shadow-soft' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Details */}
              <div className="w-full lg:w-[45%] flex flex-col bg-white overflow-y-auto scrollbar-hide">
                <div className="flex-1 px-8 lg:px-12 py-10 lg:py-16 space-y-10">
                  
                  {/* Title & Price */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        {product.category?.name || "Premium Collection"}
                      </span>
                      <button 
                        onClick={() => toggleItem(product._id || product.id)}
                        className={`p-2.5 rounded-full transition-all ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
                      >
                        <Heart size={20} fill={wishlisted ? "currentColor" : "none"} strokeWidth={2} />
                      </button>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-display font-bold text-zinc-900 tracking-tight leading-tight">
                      {product.title}
                    </h2>
                    <div className="flex items-center gap-6 pt-2">
                      <p className="text-3xl font-display font-bold text-zinc-900">
                        ৳{Math.round(currentPrice).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-zinc-900">4.9</span>
                        <span className="text-[11px] font-medium text-zinc-400 ml-1">128 Reviews</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">About this item</h4>
                    <p className="text-zinc-500 text-[15px] leading-relaxed">
                      {product.description || "Designed for ultimate durability and comfort. Features high-performance fabric composition with engineered seams for maximum mobility and aesthetic impact."}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-10">
                    {/* Color */}
                    {colors.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Color</h4>
                          {selectedColor && <span className="text-xs font-medium text-zinc-400">{selectedColor.name}</span>}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {colors.map((c: any) => (
                            <button
                              key={c.name}
                              onClick={() => setSelectedColor(c)}
                              className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor?.name === c.name ? 'border-zinc-900 scale-110 shadow-soft' : 'border-transparent hover:scale-105'}`}
                            >
                              <div
                                className="w-full h-full rounded-full"
                                style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size */}
                    {sizes.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Select Size</h4>
                          <button className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors">Size Guide</button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {sizes.map((s: string) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSize(s)}
                              className={`h-12 rounded-2xl text-sm font-bold transition-all border ${selectedSize === s ? 'bg-zinc-900 text-white border-zinc-900 shadow-soft-xl scale-[1.02]' : 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-900 hover:text-zinc-900'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Quantity</h4>
                      <div className="flex items-center bg-zinc-100 rounded-2xl w-fit h-14 p-1.5 border border-zinc-200/50 shadow-sm">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white text-zinc-500 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-14 text-center text-base font-bold text-zinc-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white text-zinc-500 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="p-8 lg:p-12 bg-white/80 backdrop-blur-md border-t border-zinc-100 sticky bottom-0">
                  <div className="flex flex-col gap-4">
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
                      className="w-full h-16 lg:h-20 bg-zinc-900 text-white rounded-[1.5rem] text-sm lg:text-base font-bold flex items-center justify-between px-8 lg:px-10 group disabled:bg-zinc-100 disabled:text-zinc-300 disabled:cursor-not-allowed shadow-soft-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-4">
                        <ShoppingBag size={20} />
                        {(!selectedColor && colors.length > 0) 
                          ? "Select Color" 
                          : (!selectedSize && sizes.length > 0) 
                            ? "Select Size" 
                            : "Add to Bag"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">
                          ৳{Math.round(currentPrice * quantity).toLocaleString()}
                        </span>
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      onClick={closeQuickLook}
                      className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-all group"
                    >
                      View full details
                      <Maximize2 size={12} />
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
