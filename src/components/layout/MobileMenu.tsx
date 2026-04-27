"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { label: "HOME", href: "/", subtitle: "THE BEGINNING" },
  { label: "SHOP", href: "/products", subtitle: "ALL COLLECTIONS" },
  { label: "BLOG", href: "/blogs", subtitle: "THE JOURNAL" },
  { label: "ACCOUNT", href: "/profile", subtitle: "YOUR BUREAU" },
  { label: "WISHLIST", href: "/wishlist", subtitle: "ARCHIVED FAVORITES" },
  { label: "CONTACT US", href: "#contact", subtitle: "GET IN TOUCH" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[400]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            aria-hidden="true" 
            onClick={onClose}
          />
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
          <DialogPanel className="fixed inset-y-0 left-0 w-full sm:w-[450px] bg-white border-r-4 border-black flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)] pt-[100px]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b-2 border-black/5">
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter leading-none">
                EXPLORE<br />
                <span className="italic opacity-40 font-light">SYSTEM</span>
              </h2>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all flex items-center justify-center group"
                aria-label="Close menu"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto bg-white" aria-label="Mobile navigation">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="group flex flex-col px-8 py-10 border-b border-black/5 hover:bg-black hover:text-white transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <span className="font-display font-black text-5xl uppercase tracking-tighter leading-none block mb-3 group-hover:italic transition-all duration-300">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-100 transition-opacity">
                        {item.subtitle}
                      </span>
                    </div>
                    <ArrowRight size={24} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </Link>
              ))}
            </nav>

            {/* Bottom */}
            <div className="p-8 space-y-8 bg-gray-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 mb-4 text-center">CONNECT WITH US</p>
                <div className="flex justify-center gap-12 font-bold text-xs uppercase tracking-widest">
                  <a href="#" className="hover:line-through transition-all">INSTAGRAM</a>
                  <a href="#" className="hover:line-through transition-all">TWITTER</a>
                  <a href="#" className="hover:line-through transition-all">PINTEREST</a>
                </div>
              </div>
              
              <div className="pt-8 border-t-2 border-black/10 text-center">
                <a 
                  href="mailto:contact@flexwear.com" 
                  className="font-display font-black text-lg uppercase tracking-tight hover:italic transition-all"
                >
                  contact@flexwear.com
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
