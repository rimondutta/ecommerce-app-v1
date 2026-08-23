"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaSearch, FaShoppingBag, FaHeart, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";

export default function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: FaHome },
    { name: "Search", href: "/products", icon: FaSearch },
    { name: "Cart", href: "/cart", icon: FaShoppingBag },
    { name: "Wishlist", href: "/wishlist", icon: FaHeart },
    { name: "Profile", href: "/account", icon: FaUser },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[100] md:hidden flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between w-full max-w-sm bg-white/70 backdrop-blur-2xl border border-black/5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-[32px] px-2 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-[52px] h-[52px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-stamp-red/15 rounded-[24px]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={`relative z-10 w-[22px] h-[22px] transition-colors duration-300 ${
                  isActive ? "text-stamp-red" : "text-rule-grey"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
