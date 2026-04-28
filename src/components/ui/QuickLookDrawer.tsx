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

  const images = product.images?.map((img: any) => {
    const src = img.url || img.src || "";
    // Defensive check for invalid/short URLs
    return (src && src.length > 5) ? src : "/placeholder.jpg";
  }) || ["/placeholder.jpg"];

  const colors = product.colors || [];
  const sizes = product.sizes || [];

  const handleClose = () => {
    closeQuickLook();
  };

  const currentPrice = product.priceNum || product.price;
  const wishlisted = isWishlisted(product._id || product.id);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-[700]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-400"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        {/* Centered Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-2 md:p-6">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-[0.16,1,0.3,1] duration-700"
            enterFrom="scale-95 opacity-0 translate-y-4"
            enterTo="scale-100 opacity-100 translate-y-0"
            leave="transform transition ease-[0.16,1,0.3,1] duration-500"
            leaveFrom="scale-100 opacity-100 translate-y-0"
            leaveTo="scale-95 opacity-0 translate-y-4"
          >
            <DialogPanel className="relative w-full max-w-6xl h-full lg:h-auto max-h-[100vh] lg:max-h-[96vh] bg-white rounded-none border-0 lg:border-4 border-black shadow-none lg:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">

              {/* Close Button - Technical Style */}
              <button
                onClick={handleClose}
                className="fixed lg:absolute top-4 right-4 lg:top-6 lg:right-6 z-[60] w-10 h-10 lg:w-12 lg:h-12 bg-white border-4 border-black hover:bg-black text-black hover:text-white flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                aria-label="Close"
              >
                <X size={20} strokeWidth={3} className="lg:hidden" />
                <X size={24} strokeWidth={3} className="hidden lg:block" />
              </button>

              {/* LEFT — Image Gallery */}
              <div className="relative w-full lg:w-[60%] bg-[#f8f8f8] flex flex-col border-b lg:border-b-0 lg:border-r border-black/10">
                {/* Main Image Container */}
                <div className="relative flex-1 min-h-[350px] md:min-h-[500px] lg:min-h-0 aspect-[4/5] lg:aspect-auto overflow-hidden group">
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

                  {/* Brutalist Badges */}
                  <div className="absolute top-4 left-4 lg:top-8 lg:left-8 flex flex-col gap-2 lg:gap-3">
                    <div className="bg-white border-2 border-black px-2 lg:px-4 py-1 inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-black animate-pulse" />
                      <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-black">New Release</span>
                    </div>
                    {images.length > 1 && (
                      <div className="bg-black text-white px-3 py-1 inline-flex w-fit shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                        <span className="text-[10px] font-black tracking-widest">GALLERY {activeImageIndex + 1}/{images.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Floating Action: Wishlist */}
                  <button
                    onClick={() => toggleItem(product._id || product.id)}
                    className={`absolute top-4 right-16 lg:top-8 lg:right-24 z-40 w-10 h-10 lg:w-12 lg:h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${wishlisted ? 'bg-red-500' : 'bg-white hover:bg-neutral-50'}`}
                  >
                    <Heart
                      size={18}
                      strokeWidth={3}
                      className={wishlisted ? 'text-white fill-white' : 'text-black lg:hidden'}
                    />
                    <Heart
                      size={20}
                      strokeWidth={3}
                      className={wishlisted ? 'text-white fill-white' : 'text-black hidden lg:block'}
                    />
                  </button>
                </div>

                  <div className="flex gap-4 p-6 bg-white overflow-x-auto no-scrollbar border-t-2 border-black">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative flex-shrink-0 w-24 h-28 border-2 transition-all ${activeImageIndex === idx ? 'border-black ring-4 ring-black/10 scale-105 z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-black/5 opacity-40 hover:opacity-100'}`}
                      >
                        <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                      </button>
                    ))}
                  </div>
              </div>

              {/* RIGHT — Product Details & Interaction */}
              <div className="w-full lg:w-[40%] flex flex-col bg-white">
                <div className="flex-1 lg:overflow-y-auto no-scrollbar px-6 lg:px-12 py-8 lg:py-16 space-y-8 lg:space-y-10">

                  {/* Header: Identity & Specs */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-neutral-600">
                        {product.category?.name || "COLLECTION"}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-neutral-500">SKU: {product._id?.slice(-6).toUpperCase() || "NEW-SS24"}</span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase tracking-tight leading-[0.9] lg:leading-[0.85] text-black">
                        {product.title}
                      </h2>
                      <div className="flex items-center gap-6 pt-2">
                        <p className="text-3xl font-bold tracking-tighter text-black">
                          ৳{Math.round(currentPrice).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star size={10} className="fill-black text-black" />
                          <span className="text-[10px] font-mono font-bold">4.9</span>
                          <span className="text-[10px] font-mono text-neutral-600 ml-1">/ 128 REVIEWS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description — Technical Readout Style */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neutral-500 border-b border-neutral-100 pb-2">Description</h4>
                    <p className="text-neutral-700 text-[13px] leading-relaxed font-medium">
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
                            <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest">{selectedColor.name}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {colors.map((c: any) => (
                            <button
                              key={c.name}
                              onClick={() => setSelectedColor(c)}
                              className={`group relative w-12 h-12 border-2 border-black transition-all ${selectedColor?.name === c.name ? 'ring-4 ring-black/20 scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'hover:scale-105'}`}
                            >
                              <div
                                className="absolute inset-0"
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
                              className={`h-14 border-2 border-black transition-all text-xs font-black uppercase ${selectedSize === s ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black">Quantity</h4>
                      <div className="flex items-center border-2 border-black bg-white w-fit h-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-14 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors border-r-2 border-black"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="w-16 text-center text-sm font-black text-black">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-14 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors border-l-2 border-black"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                    {/* Stock Status & Actions */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-green-600 uppercase tracking-[0.2em]">Ready for Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions — Impactful & Minimal */}
                <div className="sticky bottom-0 lg:static p-6 lg:p-10 bg-white border-t border-neutral-100 z-50">
                  <div className="flex flex-col gap-4 lg:gap-6">
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
                      className="w-full h-16 lg:h-20 bg-black text-white text-[12px] lg:text-[14px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] hover:bg-neutral-800 transition-all flex items-center justify-between px-6 lg:px-10 group disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] lg:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                      <span className="flex items-center gap-4">
                        <ShoppingBag size={20} strokeWidth={3} />
                        {(!selectedColor && colors.length > 0) 
                          ? "SELECT COLOR" 
                          : (!selectedSize && sizes.length > 0) 
                            ? "SELECT SIZE" 
                            : "ADD TO BAG"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="font-black">
                          ৳{Math.round(currentPrice * quantity).toLocaleString()}
                        </span>
                        <ArrowRight size={22} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      onClick={handleClose}
                      className="inline-flex items-center justify-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neutral-600 hover:text-black transition-all group"
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
