"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight, Instagram, Twitter, MessageSquare, Heart, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import AnimatedLogo from "@/components/ui/AnimatedLogo";

const menuItems = [
  { label: "Home", href: "/", icon: <ArrowRight size={18} /> },
  { label: "Shop", href: "/products", icon: <ShoppingBag size={18} /> },
  { label: "Stories", href: "/blogs", icon: <MessageSquare size={18} /> },
  { label: "Wishlist", href: "/wishlist", icon: <Heart size={18} /> },
  { label: "Account", href: "/account", icon: <User size={18} /> },
  { label: "Contact", href: "/contact", icon: <ArrowRight size={18} /> },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  
  return (
    <Transition show={isMobileMenuOpen} as={Fragment}>
      <Dialog open={isMobileMenuOpen} onClose={closeMobileMenu} className="relative z-[1000]">
        {/* Backdrop with soft blur */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md" 
            aria-hidden="true" 
          />
        </TransitionChild>

        {/* Menu Panel */}
        <TransitionChild
          as={Fragment}
          enter="transform transition ease-[0.16,1,0.3,1] duration-700"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-[0.16,1,0.3,1] duration-500"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 left-0 w-full max-w-[400px] bg-white flex flex-col shadow-soft-2xl overflow-hidden rounded-r-[2rem]">
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 relative z-10">
              <Link href="/" onClick={closeMobileMenu}>
                <AnimatedLogo size="md" />
              </Link>
              <button
                onClick={closeMobileMenu}
                className="w-12 h-12 bg-zinc-50 text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors flex items-center justify-center group relative border border-zinc-200/50"
                aria-label="Close menu"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto px-6 py-4 relative z-10" aria-label="Mobile navigation">
              <div className="space-y-2">
                {menuItems.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.5 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all duration-300 border border-transparent hover:border-zinc-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:text-zinc-900 transition-colors shadow-sm">
                          {item.icon}
                        </div>
                        <span className="font-display font-bold text-2xl text-zinc-900 tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight size={20} className="text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </nav>

            {/* Bottom Content */}
            <div className="p-8 space-y-8 bg-zinc-50/50 relative z-10 border-t border-zinc-100 mt-auto">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-soft">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-soft">
                    <Twitter size={20} />
                  </a>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Get in Touch</p>
                  <a 
                    href="mailto:hello@flexwear.com" 
                    className="text-lg font-bold text-zinc-900 hover:text-zinc-600 transition-colors"
                  >
                    hello@flexwear.com
                  </a>
                </div>
              </div>
              
              <div className="pt-6 border-t border-zinc-200/50 flex justify-between items-center">
                <span className="text-xs font-medium text-zinc-500">© 2024 Flex Wear</span>
                <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Store Online
                </span>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

