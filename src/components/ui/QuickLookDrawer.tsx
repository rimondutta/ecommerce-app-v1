"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ShoppingBag, Heart, ArrowRight, Minus, Plus, Star, Maximize2 } from "lucide-react";
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

  const images = product.images?.map((img: any) => img.url || img.src) || ["https://placehold.co/600x800?text=No+Image"];
  const colors = product.colors || [];
  const sizes = product.sizes || [];

  const handleClose = () => {
    closeQuickLook();
  };

  const currentPrice = product.priceNum || product.price;
  const wishlisted = isWishlisted(product._id || product.id);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-[300]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-400"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl" aria-hidden="true" />
        </TransitionChild>

        {/* Centered Modal instead of side drawer */}
        <div className="fixed inset-0 flex items-center justify-center p-4 md:p-8">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-[0.16,1,0.3,1] duration-700"
            enterFrom="scale-90 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transform transition ease-[0.16,1,0.3,1] duration-500"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-90 opacity-0"
          >
            <DialogPanel className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row">

              {/* Close Button - Technical Style */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-black text-black hover:text-white rounded-full flex items-center justify-center transition-all backdrop-blur-xl border border-black/5 hover:border-black"
                data-cursor="CLOSE"
              >
                <X size={20} />
              </button>

              {/* LEFT — Image Gallery */}
              <div className="relative w-full lg:w-[60%] bg-[#f8f8f8] flex flex-col border-r border-neutral-100">
                {/* Main Image Container */}
                <div className="relative flex-1 min-h-[400px] lg:min-h-0 overflow-hidden group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[activeImageIndex]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Technical Overlay Badges */}
                  <div className="absolute top-8 left-8 flex flex-col gap-2">
                    <div className="glass px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-black">New Arrival</span>
                    </div>
                    {images.length > 1 && (
                      <div className="bg-black text-white px-3 py-1 rounded-sm inline-flex w-fit">
                        <span className="text-[9px] font-mono font-bold tracking-widest">VIEW {activeImageIndex + 1}/{images.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Floating Action: Wishlist */}
                  <button
                    onClick={() => toggleItem(product._id || product.id)}
                    className="absolute top-8 right-20 lg:right-20 z-40 w-12 h-12 bg-white/80 hover:bg-white text-black rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90 border border-black/5"
                  >
                    <Heart
                      size={18}
                      className={`transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`}
                    />
                  </button>
                </div>

                {/* Thumbnail Sheet — Film Strip Style */}
                {images.length > 1 && (
                  <div className="flex gap-3 p-6 bg-white overflow-x-auto no-scrollbar">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-24 transition-all duration-300 ${activeImageIndex === idx ? 'ring-2 ring-black scale-105 z-10' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                        <div className="absolute top-0 right-0 p-1">
                          <span className="text-[8px] font-mono font-bold bg-white/80 backdrop-blur-sm px-1 leading-none">{idx + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Product Details & Interaction */}
              <div className="w-full lg:w-[40%] flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto no-scrollbar px-8 lg:px-12 py-12 lg:py-16 space-y-10">

                  {/* Header: Identity & Specs */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-neutral-400">
                        {product.category?.name || "COLLECTION"}
                      </span>
                      <span className="text-[9px] font-mono font-medium text-neutral-300">SKU: {product._id?.slice(-6).toUpperCase() || "NEW-SS24"}</span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.85] text-black">
                        {product.title}
                      </h2>
                      <div className="flex items-center gap-6 pt-2">
                        <p className="text-3xl font-bold tracking-tighter text-black">
                          ৳{Math.round(currentPrice).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star size={10} className="fill-black text-black" />
                          <span className="text-[10px] font-mono font-bold">4.9</span>
                          <span className="text-[10px] font-mono text-neutral-400 ml-1">/ 128 REVIEWS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description — Technical Readout Style */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-neutral-300 border-b border-neutral-100 pb-2">Description</h4>
                    <p className="text-neutral-500 text-[13px] leading-relaxed font-medium">
                      {product.description || "Designed for ultimate durability and comfort. Features high-performance fabric composition with engineered seams for maximum mobility and aesthetic impact."}
                    </p>
                  </div>

                  {/* Variants Section */}
                  <div className="space-y-10">
                    {/* Finish Selector */}
                    {colors.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black">Color</h4>
                          {selectedColor && (
                            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">{selectedColor.name}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {colors.map((c: any) => (
                            <button
                              key={c.name}
                              onClick={() => setSelectedColor(c)}
                              className={`group relative w-10 h-10 transition-all ${selectedColor?.name === c.name ? 'scale-110' : 'hover:scale-105'}`}
                            >
                              <div className={`absolute inset-0 border border-black/5 rounded-sm transition-all ${selectedColor?.name === c.name ? 'ring-2 ring-black ring-offset-2' : ''}`} />
                              <div
                                className="absolute inset-1 rounded-sm shadow-inner"
                                style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Grid */}
                    {sizes.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black">Select Size</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {sizes.map((s: string) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSize(s)}
                              className={`h-12 border transition-all text-[11px] font-bold uppercase ${selectedSize === s ? 'bg-black border-black text-white' : 'bg-white border-neutral-200 text-neutral-400 hover:border-black hover:text-black'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black">Quantity</h4>
                      <div className="flex items-center border border-neutral-200 bg-neutral-50 w-fit h-14 rounded-sm overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-14 h-full flex items-center justify-center hover:bg-white text-black transition-colors border-r border-neutral-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-16 text-center text-[13px] font-bold font-mono text-black">
                          {quantity.toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-14 h-full flex items-center justify-center hover:bg-white text-black transition-colors border-l border-neutral-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Stock Status & Actions */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-mono font-bold text-green-600 uppercase tracking-[0.2em]">Ready for Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions — Impactful & Minimal */}
                <div className="p-8 lg:p-10 bg-white border-t border-neutral-100">
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
                        handleClose();
                        openCart();
                      }}
                      disabled={(colors.length > 0 && !selectedColor) || (sizes.length > 0 && !selectedSize)}
                      className="w-full h-16 bg-black text-white text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-900 transition-all flex items-center justify-between px-8 group disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-4">
                        <ShoppingBag size={18} />
                        {(!selectedColor && colors.length > 0) 
                          ? "SELECT COLOR" 
                          : (!selectedSize && sizes.length > 0) 
                            ? "SELECT SIZE" 
                            : "ADD TO BAG"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className={`${!selectedColor || !selectedSize ? 'text-neutral-300' : 'text-white/50'} font-mono transition-colors`}>
                          ৳{Math.round(currentPrice * quantity).toLocaleString()}
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      onClick={handleClose}
                      className="inline-flex items-center justify-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-all group"
                    >
                      View Full Details
                      <div className="w-8 h-px bg-neutral-200 group-hover:w-12 group-hover:bg-black transition-all" />
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
