"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";

const FREE_SHIPPING_THRESHOLD = 8000;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={closeCart} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white border-l-4 border-black flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b-2 border-black">
              <h2 className="font-display font-black text-3xl uppercase tracking-tighter">
                YOUR BASKET ({count})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all"
                aria-label="Close cart"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-4 border-b-2 border-black bg-gray-50">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                {remaining > 0 ? (
                  <span>
                    Add <span className="text-black underline underline-offset-4">৳{Math.round(remaining).toLocaleString()}</span> FOR FREE SHIPPING
                  </span>
                ) : (
                  <span className="text-black font-black">✳ FREE SHIPPING UNLOCKED</span>
                )}
              </div>
              <div className="w-full h-4 bg-white border-2 border-black overflow-hidden p-0.5">
                <div
                  className="h-full bg-black transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="font-display font-black text-8xl mb-4 opacity-10 select-none">✳</div>
                  <p className="font-display font-black text-2xl uppercase tracking-tight mb-6">Your basket is empty</p>
                  <button
                    onClick={closeCart}
                    className="px-10 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all"
                  >
                    CONTINUE SHOPPING ↗
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-6 pb-6 border-b border-black/10 last:border-b-0">
                    <div className="w-24 h-32 relative border-2 border-black bg-gray-100 shrink-0 overflow-hidden group">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="100px"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <Link 
                            href={`/product/${item.slug}`} 
                            onClick={closeCart}
                            className="font-display font-black text-lg uppercase leading-tight truncate mr-2 hover:line-through transition-all"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-black/50 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {item.color} // {item.size}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black/40">QTY:</span>
                          <div className="flex items-center border-2 border-black h-9">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="w-10 h-full flex items-center justify-center text-[13px] font-black border-x-2 border-black tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                        <p className="font-display font-black text-lg">
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
              <div className="border-t-4 border-black p-6 bg-white space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-display font-black text-xl uppercase italic">
                    <span>Subtotal</span>
                    <span>৳{Math.round(total).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    TAXES AND SHIPPING CALCULATED AT CHECKOUT
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-between px-8 group border-2 border-black transition-all hover:bg-white hover:text-black"
                  >
                    <span>CHECKOUT NOW</span>
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-2 border-black hover:bg-gray-50 transition-all"
                  >
                    VIEW FULL BASKET
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
