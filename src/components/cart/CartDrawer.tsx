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
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white flex flex-col shadow-soft-2xl rounded-l-[2rem] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <ShoppingBag size={24} className="text-zinc-900" />
                <h2 className="font-display font-bold text-2xl text-zinc-900 tracking-tight">
                  Shopping Bag <span className="text-zinc-400 font-medium ml-1">({count})</span>
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
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
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="font-display font-bold text-xl text-zinc-900 mb-2">Your bag is empty</p>
                  <p className="text-zinc-500 text-sm mb-8 max-w-[240px]">Looks like you haven't added anything to your bag yet.</p>
                  <button
                    onClick={closeCart}
                    className="px-8 py-3.5 bg-zinc-900 text-white text-sm font-bold rounded-full hover:bg-zinc-800 transition-all shadow-soft"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-6 group">
                    <div className="w-28 h-36 relative rounded-2xl overflow-hidden bg-zinc-100 shrink-0 shadow-sm border border-zinc-200/50">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                        sizes="112px"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <Link 
                            href={`/products/${item.slug}`} 
                            onClick={closeCart}
                            className="font-display font-bold text-lg text-zinc-900 hover:text-zinc-600 transition-colors leading-tight line-clamp-2"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors ml-2"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">
                          {item.color} • {item.size}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex items-center bg-zinc-100 rounded-xl h-10 px-1 border border-zinc-200/50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-zinc-900 text-zinc-500 transition-all shadow-sm"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 h-full flex items-center justify-center text-sm font-bold text-zinc-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-zinc-900 text-zinc-500 transition-all shadow-sm"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-display font-bold text-xl text-zinc-900">
                          ৳{Math.round(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom */}
            {items.length > 0 && (
              <div className="border-t border-zinc-100 p-8 bg-white space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Subtotal</span>
                    <span className="font-display font-bold text-2xl text-zinc-900">৳{Math.round(total).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Shipping and taxes calculated at checkout. Enjoy our premium packaging on every order.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full bg-zinc-900 text-white py-5 rounded-2xl text-sm font-bold flex items-center justify-between px-8 group transition-all hover:bg-zinc-800 shadow-soft-xl active:scale-[0.98]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full bg-zinc-50 text-zinc-600 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 transition-all"
                  >
                    Continue Shopping
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

