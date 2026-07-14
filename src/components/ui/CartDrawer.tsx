"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import QuantityStepper from "@/components/playshelf/QuantityStepper";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 8000;

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
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden="true" onClick={closeCart} />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transform transition duration-300 ease-out"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition duration-200 ease-in"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-paper border-l-4 border-ink flex flex-col shadow-[-10px_0_0px_rgba(0,0,0,1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b-4 border-ink bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-ink text-paper border-3 border-ink cartoon-shadow-sm">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="font-bangers text-4xl tracking-tight leading-none">YOUR BAG</h2>
                  <p className="font-comic font-bold italic text-secondary text-lg">
                    {count} {count === 1 ? "ITEM" : "ITEMS"} IN COLLECTION
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-3 border-3 border-ink hover:bg-surface cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-8 py-6 bg-white border-b-4 border-ink">
              {remaining > 0 ? (
                <ProgressBar
                  value={total}
                  max={FREE_SHIPPING_THRESHOLD}
                  label={`ADD ৳${Math.round(remaining).toLocaleString()} FOR FREE SHIPPING ★`}
                />
              ) : (
                <div className="bg-ink text-paper p-4 border-3 border-ink cartoon-shadow-sm flex items-center justify-center gap-3 animate-bounce">
                   <span className="text-2xl">★</span>
                   <span className="font-bebas text-2xl tracking-widest uppercase">FREE SHIPPING UNLOCKED</span>
                   <span className="text-2xl">★</span>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                  <div className="text-8xl text-ink/10 rotate-12 animate-float">?</div>
                  <div className="space-y-4">
                    <h3 className="font-bangers text-4xl text-ink">BAG IS EMPTY!</h3>
                    <p className="font-comic font-bold italic text-secondary text-xl">
                      Your inventory is looking a bit light.<br />Go back and find some gear!
                    </p>
                  </div>
                  <Button onClick={closeCart}>BROWSE THE SHOP</Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="flex gap-6 p-4 bg-white border-3 border-ink cartoon-shadow-sm group relative"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-32 relative shrink-0 border-3 border-ink overflow-hidden bg-surface">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-bangers text-2xl text-ink hover:text-secondary transition-colors block leading-tight"
                        >
                          {item.title}
                        </Link>
                        <p className="font-comic font-bold italic text-lg text-secondary">
                          {item.color} // {item.size}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity */}
                        <QuantityStepper 
                          value={item.quantity} 
                          onChange={(val) => updateQuantity(item.id, val)} 
                          className="h-10"
                        />

                        <div className="text-right">
                          <span className="font-bebas text-3xl text-ink">
                            ৳{Math.round(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-ink text-paper border-2 border-ink cartoon-shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Total & Checkout */}
            {items.length > 0 && (
              <div className="border-t-4 border-ink p-8 bg-white space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bebas text-3xl tracking-widest text-secondary uppercase">
                      SUBTOTAL
                    </span>
                    <span className="font-bebas text-5xl text-ink">
                      ৳{Math.round(total).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-comic font-bold italic text-lg text-secondary text-right">
                    (Shipping & taxes calculated at checkout)
                  </p>
                </div>

                <div className="space-y-4">
                  <Link href="/checkout" onClick={closeCart} className="block w-full">
                    <Button size="xl" className="w-full">
                      PROCEED TO CHECKOUT →
                    </Button>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full font-bebas text-2xl text-secondary hover:text-ink transition-colors uppercase tracking-widest text-center"
                  >
                    CONTINUE BROWSING
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
