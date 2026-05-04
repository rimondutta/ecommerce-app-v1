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

        <TransitionChild
          as={Fragment}
          enter="transform transition ease-[0.16,1,0.3,1] duration-700"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-[0.16,1,0.3,1] duration-500"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[550px] bg-white flex flex-col shadow-soft-2xl rounded-l-[3rem] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-10 border-b border-zinc-100">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
                  <span className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em]">Vault Selection</span>
                </div>
                <h2 className="font-display font-black text-4xl text-zinc-900 tracking-[-0.05em] leading-none">
                  Shopping Bag <span className="text-zinc-300 ml-2">({count})</span>
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="group w-12 h-12 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-500"
                aria-label="Close cart"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100">
              <div className="flex items-center justify-between text-xs font-semibold mb-3">
                {remaining > 0 ? (
                  <p className="text-zinc-600">
                    Add <span className="text-zinc-900 font-bold">৳{Math.round(remaining).toLocaleString()}</span> for free shipping
                  </p>
                ) : (
                  <p className="text-emerald-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Free shipping unlocked
                  </p>
                )}
                <span className="text-zinc-400 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-zinc-900 transition-all duration-700 ease-out"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 scrollbar-hide">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-8">
                    <ShoppingBag size={48} />
                  </div>
                  <p className="font-display font-black text-2xl text-zinc-900 mb-3 tracking-tight">Empty Archive</p>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] mb-10 max-w-[280px]">Your collection is currently unoccupied.</p>
                  <button
                    onClick={closeCart}
                    className="group relative px-12 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full overflow-hidden transition-all hover:scale-105 shadow-2xl"
                  >
                    <span className="relative z-10">Begin Acquisition</span>
                    <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                  </button>
                </motion.div>
              ) : (
                items.map((item, idx) => (
                  <motion.div 
                    key={`${item.id}-${item.color}-${item.size}`} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-8 group"
                  >
                    <div className="w-32 h-44 relative rounded-[2rem] overflow-hidden bg-zinc-50 shrink-0 shadow-soft-xl border border-zinc-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-110"
                        sizes="128px"
                      />
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            href={`/products/${item.slug}`} 
                            onClick={closeCart}
                            className="font-display font-black text-xl text-zinc-900 hover:text-zinc-400 transition-colors leading-[1.1] tracking-tighter line-clamp-2"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-zinc-300 hover:text-zinc-900 transition-colors ml-4 p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{item.color}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-200" />
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{item.size}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-zinc-50 rounded-[1.5rem] h-12 px-2 border border-zinc-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-zinc-900 text-zinc-400 transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 h-full flex items-center justify-center text-sm font-black text-zinc-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-zinc-900 text-zinc-400 transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-display font-black text-2xl text-zinc-900 tracking-tighter">
                          ৳{Math.round(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom */}
            {items.length > 0 && (
              <div className="border-t border-zinc-100 p-10 bg-white space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">Total Assessment</span>
                    <span className="font-display font-black text-4xl text-zinc-900 tracking-tighter">৳{Math.round(total).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Logistic fees and fiscal duties will be computed during the finalization phase.
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="group relative w-full bg-black text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-6 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                  >
                    <span className="relative z-10">Proceed to Finalization</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full bg-zinc-50 text-zinc-400 py-5 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.3em] hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                  >
                    Resume Exploration
                  </button>
                </div>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

