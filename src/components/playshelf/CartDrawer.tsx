"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import QuantityStepper from "./QuantityStepper";

const FREE_SHIPPING_THRESHOLD = 2000; // ৳2000

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={closeCart} className="relative z-[1000]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={closeCart} />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transform transition duration-500 cubic-bezier(0.32, 0.72, 0, 1)"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition duration-300 cubic-bezier(0.32, 0.72, 0, 1)"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0A0A0A]/80 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col overflow-hidden">
            
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-8 py-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <ShoppingBag size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-white leading-none tracking-tight">Your Cart</h2>
                  <p className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
                    {count} {count === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* ─── Free Shipping Progress ─── */}
            <div className="px-8 pb-6">
              {remaining > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-neutral-400 flex justify-between tracking-wide">
                    <span>Add <strong className="text-white">৳{remaining.toLocaleString()}</strong> for free shipping</span>
                  </p>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sun to-coral rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(252,211,77,0.5)]"
                      style={{ width: `${Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/20 text-mint p-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(167,243,208,0.1)]">
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Free shipping unlocked</span>
                </div>
              )}
            </div>

            {/* ─── Cart Items ─── */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4 hide-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-600 mb-6">
                    <ShoppingBag size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-2 tracking-tight">Your cart is empty</h3>
                  <p className="text-sm text-neutral-400 mb-8 max-w-[220px] leading-relaxed">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button onClick={closeCart} className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-colors">
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 relative shrink-0 rounded-xl overflow-hidden bg-[#111]">
                      <Image
                         src={item.image}
                         alt={item.title}
                         fill
                         className="object-cover"
                         sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="space-y-1 pr-6">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-display font-semibold text-white hover:text-sun transition-colors line-clamp-1 leading-snug tracking-tight text-lg"
                        >
                          {item.title}
                        </Link>
                        {item.size !== "Default" && (
                           <p className="text-xs text-neutral-500 tracking-wide uppercase">{item.size}</p>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(val) => updateQuantity(item.id, val)}
                        />
                        <span className="font-display font-bold text-lg text-white tracking-tight">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 text-neutral-500 hover:text-coral transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* ─── Bottom Checkout ─── */}
            {items.length > 0 && (
              <div className="p-8 bg-black/40 backdrop-blur-md border-t border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-sm font-medium uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span className="font-display font-bold text-3xl text-white tracking-tight">
                    ৳{total.toLocaleString()}
                  </span>
                </div>

                <Link href="/checkout" onClick={closeCart} className="block w-full group">
                  <button className="w-full bg-white text-black hover:bg-neutral-200 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all">
                    Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <p className="text-xs font-medium text-neutral-500 text-center">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
