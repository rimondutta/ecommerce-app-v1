"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";

export default function MobileTabBar() {
  const pathname = usePathname();
  const { openCart, count: cartCount } = useCart();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/products", icon: Search },
    { name: "Cart", href: "#cart", icon: ShoppingBag, action: openCart },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Profile", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[100] md:hidden flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-joy-rule shadow-[0_10px_40px_-10px_rgba(26,31,58,0.15)] rounded-[32px] px-2 py-2">
        {tabs.map((tab) => {
          const isActive = tab.href !== "#cart" && pathname === tab.href;
          const Icon = tab.icon;

          return (
            <div key={tab.name} className="relative">
              {tab.action ? (
                <button
                  onClick={tab.action}
                  className="relative flex flex-col items-center justify-center w-[52px] h-[52px]"
                >
                  <Icon
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`relative z-10 w-[22px] h-[22px] transition-colors duration-300 ${
                      isActive ? "text-joy-cobalt" : "text-joy-muted"
                    }`}
                  />
                  {cartCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-joy-coral rounded-full" />
                  )}
                </button>
              ) : (
                <Link
                  href={tab.href}
                  className="relative flex flex-col items-center justify-center w-[52px] h-[52px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-joy-cobalt/10 rounded-[24px]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`relative z-10 w-[22px] h-[22px] transition-colors duration-300 ${
                      isActive ? "text-joy-cobalt" : "text-joy-muted"
                    }`}
                  />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
