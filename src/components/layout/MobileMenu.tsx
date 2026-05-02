"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

const menuItems = [
  { label: "EXPLORE SHOP", href: "/products", subtitle: "ALL COLLECTIONS" },
  { label: "NEW ARRIVALS", href: "/products?new=true", subtitle: "SEASON 2024" },
  { label: "MEN'S WEAR", href: "/products?category=Men", subtitle: "TAILORED & STREET" },
  { label: "WOMEN'S WEAR", href: "/products?category=Women", subtitle: "ELEVATED BASICS" },
  { label: "ACCESSORIES", href: "/products?category=Accessories", subtitle: "THE FINISHING TOUCH" },
  { label: "OUR STORY", href: "/about", subtitle: "REDEFINING DESIGN" },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  
  return (
    <Transition show={isMobileMenuOpen} as={Fragment}>
      <Dialog open={isMobileMenuOpen} onClose={closeMobileMenu} className="relative z-[1000]">
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
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 left-0 w-full sm:w-[450px] bg-white border-r-4 border-black flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b-2 border-black">
              <h2 className="font-display font-black text-3xl uppercase tracking-tighter">
                NAVIGATION
              </h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="group flex flex-col px-8 py-8 border-b-2 border-black hover:bg-black hover:text-white transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <span className="font-display font-black text-4xl uppercase tracking-tighter italic leading-none block mb-2 group-hover:translate-x-2 transition-transform duration-300">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
                        {item.subtitle}
                      </span>
                    </div>
                    <ArrowRight size={32} className="opacity-0 group-hover:opacity-100 -translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </Link>
              ))}
            </nav>

            {/* Bottom */}
            <div className="p-8 space-y-8 bg-gray-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-4 text-center">CONNECT WITH US</p>
                <div className="flex justify-center gap-12 font-bold text-xs uppercase tracking-widest">
                  <a href="#" className="hover:line-through transition-all">INSTAGRAM</a>
                  <a href="#" className="hover:line-through transition-all">TWITTER</a>
                  <a href="#" className="hover:line-through transition-all">PINTEREST</a>
                </div>
              </div>
              
              <div className="pt-8 border-t-2 border-black/10 text-center">
                <a 
                  href="mailto:hello@flexwear.com" 
                  className="font-display font-black text-lg uppercase tracking-tight hover:italic transition-all"
                >
                  hello@flexwear.com
                </a>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-black text-[9px] font-bold uppercase tracking-[0.3em] text-white flex justify-between px-8">
              <span>© Flex Wear 2024</span>
              <span>ALL RIGHTS RESERVED</span>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
