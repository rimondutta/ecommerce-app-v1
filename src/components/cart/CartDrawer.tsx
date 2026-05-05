"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { motion } from "framer-motion";

const FREE_SHIPPING_THRESHOLD = 8000;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={closeCart} className="relative z-[600]">
        <TransitionChild as={Fragment} enter="transition-opacity ease-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-in duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild as={Fragment} enter="transform transition ease-[0.16,1,0.3,1] duration-700" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-[0.16,1,0.3,1] duration-500" leaveFrom="translate-x-0" leaveTo="translate-x-full">
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[550px] bg-[#111111] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-10 border-b border-white/5">
              <div className="flex flex-col gap-2">
                <span className="label-tiny text-[#555]">Vault Selection</span>
                <h2 className="font-serif text-4xl text-white tracking-[-0.02em] leading-none">
                  Bag <span className="text-[#555] ml-2">({count})</span>
                </h2>
              </div>
              <button onClick={closeCart} className="group w-12 h-12 flex items-center justify-center text-[#8e9192] hover:text-white transition-all duration-500" aria-label="Close cart">
                <X size={24} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-8 py-6 bg-[#0e0e0e] border-b border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold mb-3">
                {remaining > 0 ? (
                  <p className="label-tiny text-[#8e9192]">Add <span className="text-white">৳{Math.round(remaining).toLocaleString()}</span> for free shipping</p>
                ) : (
                  <p className="label-tiny text-white flex items-center gap-2"><span className="w-1.5 h-1.5 bg-white animate-pulse" /> Free shipping unlocked</p>
                )}
                <span className="label-tiny text-[#555]">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-[2px] bg-[#1a1a1a] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-white transition-all duration-700 ease-out" />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 scrollbar-hide">
              {items.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-24 h-24 bg-[#1a1a1a] flex items-center justify-center text-[#333] mb-8 border border-white/5"><ShoppingBag size={48} strokeWidth={1} /></div>
                  <p className="font-serif text-2xl text-white mb-3 tracking-tight">Empty Archive</p>
                  <p className="label-tiny text-[#8e9192] mb-10 max-w-[280px]">Your collection is currently unoccupied.</p>
                  <button onClick={closeCart} className="btn-pill-primary">Begin Acquisition</button>
                </motion.div>
              ) : (
                items.map((item, idx) => (
                  <motion.div key={`${item.id}-${item.color}-${item.size}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }} className="flex gap-8 group">
                    <div className="w-28 h-36 relative overflow-hidden bg-[#1a1a1a] shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" sizes="112px" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/products/${item.slug}`} onClick={closeCart} className="font-serif text-lg text-white hover:text-[#8e9192] transition-colors leading-[1.1] tracking-tight line-clamp-2">{item.title}</Link>
                          <button onClick={() => removeItem(item.id)} className="text-[#333] hover:text-white transition-colors ml-4 p-1" aria-label="Remove"><Trash2 size={16} strokeWidth={1} /></button>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="label-tiny text-[#555]" style={{ fontSize: '8px' }}>{item.color}</span>
                          <div className="w-1 h-1 bg-[#333]" />
                          <span className="label-tiny text-[#555]" style={{ fontSize: '8px' }}>{item.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-[#1a1a1a] h-10 px-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-white transition-all"><Minus size={12} strokeWidth={1} /></button>
                          <span className="w-8 text-center text-sm text-white tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-white transition-all"><Plus size={12} strokeWidth={1} /></button>
                        </div>
                        <p className="font-serif text-xl text-white tracking-tight">৳{Math.round(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom */}
            {items.length > 0 && (
              <div className="border-t border-white/5 p-10 bg-[#0e0e0e] space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="label-tiny text-[#8e9192]">Total Assessment</span>
                    <span className="font-serif text-4xl text-white tracking-tight">৳{Math.round(total).toLocaleString()}</span>
                  </div>
                  <p className="label-tiny text-[#555] leading-[2]" style={{ fontSize: '8px' }}>Logistic fees computed during finalization.</p>
                </div>
                <div className="flex flex-col gap-4 pt-2">
                  <Link href="/checkout" onClick={closeCart} className="group relative w-full bg-white text-[#0a0a0a] py-5 label-tiny flex items-center justify-center gap-6 overflow-hidden transition-all hover:bg-[#0a0a0a] hover:text-white rounded-none">
                    <span className="relative z-10">Proceed to Finalization</span>
                    <ArrowRight size={16} strokeWidth={1} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button onClick={closeCart} className="w-full bg-[#1a1a1a] text-[#8e9192] py-4 label-tiny hover:bg-[#222] hover:text-white transition-all rounded-none border border-white/5" style={{ fontSize: '8px' }}>Resume Exploration</button>
                </div>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
