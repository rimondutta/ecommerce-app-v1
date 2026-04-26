"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { label: "HOME", href: "/", subtitle: "THE BEGINNING" },
  { label: "SHOP", href: "/products", subtitle: "ALL COLLECTIONS" },
  { label: "CONTACT US", href: "#contact", subtitle: "GET IN TOUCH" },
  { label: "BLOG", href: "/blogs", subtitle: "THE JOURNAL" },
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
            <div className="flex items-center justify-between px-8 py-6 border-b-2 border-black">
              <h2 className="font-display font-black text-3xl uppercase tracking-tighter">
                NAVIGATION
              </h2>
              <button
                onClick={onClose}
                className="group flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all transform active:scale-95 relative z-[200] pointer-events-auto"
                aria-label="Close menu"
              >
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">CLOSE</span>
                <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="group flex flex-col px-8 py-8 border-b-2 border-black hover:bg-black hover:text-white transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <span className="font-display font-black text-4xl uppercase tracking-tighter italic leading-none block mb-2 group-hover:translate-x-2 transition-transform duration-300">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">
                        {item.subtitle}
                      </span>
                    </div>
                    <ArrowRight size={32} className="opacity-0 group-hover:opacity-100 -translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  {/* Decorative background number or icon could go here */}
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
