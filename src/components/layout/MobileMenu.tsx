"use client";

import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { useCart } from "@/components/providers/CartProvider";
import { X, ArrowRight, User, ShoppingBag, Home, Search, Heart } from "lucide-react";
import CartoonButton from "@/components/ui/CartoonButton";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "HOME", href: "/", icon: Home },
  { label: "THE SHOP", href: "/products", icon: ShoppingBag },
  { label: "FRESH DROPS", href: "/products?badge=New", icon: Search },
  { label: "WISHLIST", href: "/wishlist", icon: Heart },
  { label: "ACCOUNT", href: "/account", icon: User },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { count: cartCount } = useCart();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-paper">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-crosshatch opacity-5 pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-8 h-20 border-b-4 border-ink bg-white relative z-10">
        <h2 className="font-bangers text-4xl tracking-tight leading-none uppercase">MENU</h2>
        <button
          onClick={closeMobileMenu}
          className="p-3 border-3 border-ink hover:bg-surface cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          <X size={28} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col justify-center px-8 gap-4 relative z-10">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeMobileMenu}
              className="group flex items-center gap-6 py-6 px-6 bg-white border-3 border-ink cartoon-shadow hover:translate-x-2 transition-all"
            >
              <div className="p-3 bg-ink text-paper border-2 border-ink">
                <Icon size={24} />
              </div>
              <span className="font-bangers text-4xl text-ink group-hover:text-secondary transition-colors uppercase tracking-tight">
                {item.label}
              </span>
              <ArrowRight size={24} className="ml-auto text-ink/20 group-hover:text-ink transition-colors" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-8 py-10 bg-white border-t-4 border-ink relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-paper border-3 border-ink p-4 cartoon-shadow-sm">
            <span className="font-bebas text-2xl tracking-widest text-secondary">BAG COUNT:</span>
            <span className="font-bebas text-4xl text-ink">{String(cartCount).padStart(2, "0")}</span>
          </div>
          
          <div className="flex gap-4">
             <Link href="/products" className="flex-1" onClick={closeMobileMenu}>
               <CartoonButton size="lg" className="w-full">SHOP ALL</CartoonButton>
             </Link>
             <button className="flex-1 font-bebas text-2xl text-secondary" onClick={closeMobileMenu}>
               LOGOUT
             </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Doodles */}
      <div className="absolute top-1/4 -right-10 text-9xl text-ink/5 -rotate-12 pointer-events-none">★</div>
      <div className="absolute bottom-1/4 -left-10 text-9xl text-ink/5 rotate-12 pointer-events-none">✸</div>
    </div>
  );
}
