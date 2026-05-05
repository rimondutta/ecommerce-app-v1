"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

const menuItems = [
  { label: "Collections", href: "/products", subtitle: "All Archive" },
  { label: "New Arrivals", href: "/products?new=true", subtitle: "SS26 Season" },
  { label: "Editorial", href: "/blogs", subtitle: "Stories & Lookbooks" },
  { label: "Archive", href: "/shop", subtitle: "Past Seasons" },
  { label: "About", href: "/contact", subtitle: "The Bureau" },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  
  return (
    <Transition show={isMobileMenuOpen} as={Fragment}>
      <Dialog open={isMobileMenuOpen} onClose={closeMobileMenu} className="relative z-[1000]">
        <TransitionChild as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild as={Fragment} enter="transform transition ease-[0.16,1,0.3,1] duration-500" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transform transition ease-[0.16,1,0.3,1] duration-400" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
          <DialogPanel className="fixed inset-y-0 left-0 w-full sm:w-[450px] bg-[#0e0e0e] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-white/5">
              <span className="font-serif text-2xl text-white">AVANT</span>
              <button onClick={closeMobileMenu} className="w-10 h-10 flex items-center justify-center text-[#8e9192] hover:text-white transition-colors" aria-label="Close menu">
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
              {menuItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={closeMobileMenu} className="group flex flex-col px-8 py-8 border-b border-white/5 hover:bg-[#1a1a1a] transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-3xl text-white leading-none block mb-2 group-hover:translate-x-2 transition-transform duration-500">
                        {item.label}
                      </span>
                      <span className="label-tiny text-[#555]" style={{ fontSize: '8px' }}>
                        {item.subtitle}
                      </span>
                    </div>
                    <ArrowRight size={20} strokeWidth={1} className="text-[#333] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                </Link>
              ))}
            </nav>

            {/* Bottom */}
            <div className="p-8 space-y-6 bg-[#111]">
              <div className="flex justify-center gap-8">
                {["Instagram", "Twitter", "Archive"].map((s) => (
                  <a key={s} href="#" className="label-tiny text-[#555] hover:text-white transition-all">{s}</a>
                ))}
              </div>
              <div className="pt-6 border-t border-white/5 text-center">
                <a href="mailto:hello@avantgarde.com" className="label-tiny text-[#8e9192] hover:text-white transition-all">hello@avantgarde.com</a>
              </div>
            </div>

            <div className="px-8 py-4 bg-[#0a0a0a] flex justify-between">
              <span className="label-tiny text-[#333]" style={{ fontSize: '8px' }}>© AVANT GARDE 2026</span>
              <span className="label-tiny text-[#333]" style={{ fontSize: '8px' }}>All Rights Reserved</span>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
