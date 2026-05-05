"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { useEffect, useRef, useState } from "react";
import MagneticElement from "@/components/ui/MagneticElement";

const menuItems = [
  { label: "Collections", href: "/products", subtitle: "All Archive", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop" },
  { label: "New Arrivals", href: "/products?new=true", subtitle: "SS26 Season", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" },
  { label: "Editorial", href: "/blogs", subtitle: "Stories & Lookbooks", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop" },
  { label: "Archive", href: "/shop", subtitle: "Past Seasons", image: "https://images.unsplash.com/photo-1539109132381-31a1ecbfad2b?q=80&w=1200&auto=format&fit=crop" },
  { label: "About", href: "/contact", subtitle: "The Bureau", image: "https://images.unsplash.com/photo-1515347619252-60a4bdad8560?q=80&w=1200&auto=format&fit=crop" },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const initGsap = async () => {
        const { gsap } = await import("@/lib/gsap");
        if (linksRef.current) {
          gsap.from(linksRef.current.children, {
            y: 100,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: "expo.out",
            delay: 0.3
          });
        }
      };
      initGsap();
    }
  }, [isMobileMenuOpen]);
  
  return (
    <Transition show={isMobileMenuOpen} as={Fragment}>
      <Dialog open={isMobileMenuOpen} onClose={closeMobileMenu} className="relative z-[1000]">
        <TransitionChild as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-[#0a0a0a]" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild as={Fragment} enter="transform transition ease-[0.16,1,0.3,1] duration-700" enterFrom="translate-y-full" enterTo="translate-y-0" leave="transform transition ease-[0.16,1,0.3,1] duration-500" leaveFrom="translate-y-0" leaveTo="translate-y-full">
          <DialogPanel className="fixed inset-0 bg-transparent flex flex-col z-[1001]">
            
            {/* Background Image Preview */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 transition-opacity duration-700">
                {menuItems.map((item) => (
                    <img 
                        key={item.label}
                        src={item.image}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-700 ${hoveredImage === item.image ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-white/5">
              <span className="font-serif text-2xl text-white">AVANT</span>
              <button onClick={closeMobileMenu} className="w-10 h-10 flex items-center justify-center text-[#8e9192] hover:text-white transition-colors" aria-label="Close menu">
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Nav Links */}
            <nav 
                ref={linksRef}
                className="flex-1 flex flex-col justify-center px-8 lg:px-24 z-10" 
                aria-label="Mobile navigation"
            >
              {menuItems.map((item) => (
                <MagneticElement key={item.label} strength={0.1}>
                  <Link 
                      href={item.href} 
                      onClick={closeMobileMenu}
                      onMouseEnter={() => setHoveredImage(item.image)}
                      onMouseLeave={() => setHoveredImage(null)}
                      className="group py-4 lg:py-6 border-b border-white/5 transition-all overflow-hidden block"
                  >
                    <div className="flex items-center gap-8">
                      <span className="label-tiny text-[#333] group-hover:text-white transition-colors">0{menuItems.indexOf(item) + 1}</span>
                      <div className="relative">
                        <span className="font-serif text-5xl lg:text-8xl text-white leading-none block group-hover:italic transition-all duration-500">
                          {item.label}
                        </span>
                        <span className="absolute -bottom-2 right-0 label-tiny text-[#555] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                  </Link>
                </MagneticElement>
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
