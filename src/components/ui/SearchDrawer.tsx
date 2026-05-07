"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import CartoonButton from "@/components/ui/CartoonButton";
import { cn } from "@/lib/utils";

export interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickTags = ["T-Shirts", "Hoodies", "Sneakers", "Jackets", "Accessories"];

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/store/products?limit=4")
      .then((r) => r.json())
      .then((d) => setFeatured(d.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/store/products?search=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.products || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-[1000]">
        <TransitionChild as={Fragment}
          enter="transition-opacity duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="transition-opacity duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild as={Fragment}
          enter="transform transition duration-300 ease-out" enterFrom="translate-x-full" enterTo="translate-x-0"
          leave="transform transition duration-200 ease-in" leaveFrom="translate-x-0" leaveTo="translate-x-full">
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-paper border-l-4 border-ink flex flex-col shadow-[-10px_0_0px_rgba(0,0,0,1)]">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b-4 border-ink bg-white">
               <div className="flex items-center gap-4">
                <div className="p-3 bg-ink text-paper border-3 border-ink cartoon-shadow-sm">
                  <Search size={24} />
                </div>
                <h2 className="font-bangers text-4xl tracking-tight leading-none uppercase">SEARCH</h2>
              </div>
              <button onClick={onClose} className="p-3 border-3 border-ink hover:bg-surface cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Search Input Area */}
            <div className="px-8 py-8 bg-white border-b-4 border-ink space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  className="w-full bg-paper border-3 border-ink p-5 pl-14 font-comic font-bold text-xl italic cartoon-shadow-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 outline-none transition-all"
                  autoFocus
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/40" size={24} />
                {query && (
                  <button 
                    onClick={() => setQuery("")} 
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-surface border-2 border-ink"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="font-bebas text-lg tracking-widest bg-white border-2 border-ink px-4 py-1.5 hover:bg-ink hover:text-paper transition-all cartoon-shadow-xs active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {query.trim() === "" ? (
                <div className="space-y-8">
                  <h3 className="font-bebas text-2xl tracking-widest text-ink/60 border-b-2 border-ink/10 pb-2">// FEATURED DROPS</h3>
                  <div className="space-y-6">
                    {featured.map((product) => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product.slug}`} 
                        onClick={onClose} 
                        className="flex items-center gap-6 group bg-white border-3 border-ink p-4 cartoon-shadow-sm hover:translate-x-1 transition-all"
                      >
                        <div className="w-16 h-20 relative overflow-hidden bg-surface border-2 border-ink shrink-0">
                          <Image
                            src={(product.images?.[0]?.url) ? product.images[0].url : "/placeholder.jpg"}
                            alt={product.title} fill className="object-cover" sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bangers text-xl text-ink truncate group-hover:text-secondary transition-colors uppercase tracking-tight">{product.title}</p>
                          <p className="font-bebas text-2xl text-ink">৳{Math.round(product.price).toLocaleString()}</p>
                        </div>
                        <ArrowRight size={20} className="text-ink/20 group-hover:text-ink transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-8">
                  <h3 className="font-bebas text-2xl tracking-widest text-ink/60 border-b-2 border-ink/10 pb-2 uppercase">
                    // {results.length} INTEL FOUND FOR &quot;{query}&quot;
                  </h3>
                  <div className="space-y-6">
                    {results.map((product) => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product.slug}`} 
                        onClick={onClose} 
                        className="flex items-center gap-6 p-4 bg-white border-3 border-ink cartoon-shadow-sm group transition-all"
                      >
                        <div className="w-16 h-20 relative overflow-hidden border-2 border-ink shrink-0 bg-surface">
                          <Image
                            src={(product.images?.[0]?.url) ? product.images[0].url : "/placeholder.jpg"}
                            alt={product.title} fill className="object-cover" sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bangers text-xl text-ink truncate group-hover:text-secondary transition-colors uppercase tracking-tight">{product.title}</p>
                          <p className="font-bebas text-2xl text-ink">৳{Math.round(product.price).toLocaleString()}</p>
                        </div>
                        <ArrowRight size={20} className="text-ink/20 group-hover:text-ink" />
                      </Link>
                    ))}
                  </div>
                  <Link href={`/products?search=${query}`} onClick={onClose} className="block w-full">
                    <CartoonButton variant="outline" className="w-full">VIEW ALL RESULTS</CartoonButton>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="text-8xl text-ink/10 rotate-12">?</div>
                  <div className="space-y-2">
                    <h3 className="font-bangers text-4xl text-ink">NO INTEL FOUND</h3>
                    <p className="font-comic font-bold italic text-secondary text-xl">Try different coordinates, agent.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t-4 border-ink bg-white">
              <Link href="/products" onClick={onClose} className="block">
                <CartoonButton variant="secondary" className="w-full">BROWSE THE ARCHIVE</CartoonButton>
              </Link>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
