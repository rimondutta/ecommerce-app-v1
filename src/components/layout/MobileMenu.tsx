"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { label: "HOME", href: "/", subtitle: "SYS_BEGIN" },
  { label: "SHOP", href: "/products", subtitle: "DIR_COLLECTION" },
  { label: "BLOG", href: "/blogs", subtitle: "DIR_JOURNAL" },
  { label: "ACCOUNT", href: "/profile", subtitle: "USR_BUREAU" },
  { label: "WISHLIST", href: "/wishlist", subtitle: "USR_ARCHIVE" },
  { label: "CONTACT", href: "#contact", subtitle: "SYS_COMMS" },
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
          <DialogPanel className="fixed inset-y-0 left-0 w-full sm:w-[450px] bg-[#f0ece5] border-r border-black/20 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-black/10 relative z-10 bg-[#f0ece5]">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                   <h4 className="font-mono font-black text-[10px] uppercase tracking-widest text-black/60">SYS_MENU</h4>
                </div>
                <h2 className="font-mono font-black text-2xl uppercase tracking-widest leading-none">
                  [ ROOT_DIR ]
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-transparent text-black border border-black hover:bg-black hover:text-white transition-all flex items-center justify-center group relative"
                aria-label="Close menu"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-500 relative z-10" />
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black group-hover:border-white transition-colors" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black group-hover:border-white transition-colors" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto bg-[#f0ece5] relative z-10" aria-label="Mobile navigation">
              {menuItems.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="group flex flex-col px-8 py-8 border-b border-black/5 hover:bg-black hover:text-white transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity mb-2">
                        {item.subtitle}
                      </span>
                      <span className="font-display font-black text-4xl uppercase tracking-tighter leading-none block group-hover:text-transparent transition-all duration-300" style={{ WebkitTextStroke: '1px currentColor' }}>
                        {item.label}
                      </span>
                    </div>
                    <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  {/* Hover Scanline */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-0 group-hover:opacity-20 group-hover:animate-scanline" />
                </Link>
              ))}
            </nav>

            {/* Bottom */}
            <div className="p-8 space-y-8 bg-[#e8e4db] relative z-10 border-t border-black/10">
              <div>
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/60 mb-4 text-center">NETWORK_NODES</p>
                <div className="flex justify-center gap-8 font-mono font-bold text-[9px] uppercase tracking-widest text-black/80">
                  <a href="#" className="hover:text-black hover:line-through transition-all">INSTAGRAM</a>
                  <a href="#" className="hover:text-black hover:line-through transition-all">TWITTER</a>
                  <a href="#" className="hover:text-black hover:line-through transition-all">PINTEREST</a>
                </div>
              </div>
              
              <div className="pt-8 border-t border-black/10 text-center">
                <a 
                  href="mailto:contact@flexwear.com" 
                  className="font-mono font-black text-xs uppercase tracking-widest hover:italic transition-all opacity-80 hover:opacity-100"
                >
                  &gt; contact@flexwear.com
                </a>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-black text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-white flex justify-between px-8 relative z-10">
              <span>SYS_ONLINE</span>
              <span className="opacity-50">LND/NYC/TKY</span>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
