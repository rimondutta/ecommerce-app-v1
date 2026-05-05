"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, Search as SearchIcon, ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const quickLinks = ["Archive", "Uniforms", "Outerwear", "Technical", "Bags"];

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/store/products?limit=4');
        const data = await res.json();
        setFeatured(data.products || []);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(`/api/store/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-[700]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transform transition ease-[0.16,1,0.3,1] duration-700"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-[0.16,1,0.3,1] duration-500"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[550px] bg-[#111111] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-10 border-b border-white/5">
              <div className="flex flex-col gap-2">
                <span className="label-tiny text-[#555]">Bureau Inquiry</span>
                <h2 className="font-serif text-4xl text-white tracking-[-0.02em] leading-none">
                  Search <span className="text-[#555] ml-2">Archive</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="group w-12 h-12 flex items-center justify-center text-[#8e9192] hover:text-white transition-all duration-500"
                aria-label="Close search"
              >
                <X size={24} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Search Input Section */}
            <div className="px-10 py-12 bg-[#0e0e0e] border-b border-white/5">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Query parameters..."
                  className="w-full bg-[#1a1a1a] border border-white/5 px-8 py-6 text-xl font-light text-white placeholder:text-[#333] outline-none focus:border-white/20 transition-all rounded-none"
                  autoFocus
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setQuery("")}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#555] hover:text-white transition-colors"
                    >
                      <X size={18} strokeWidth={1} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={14} strokeWidth={1} className="text-[#333]" />
                  <p className="label-tiny text-[#555]">Active Parameters</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {quickLinks.map((link) => (
                    <button
                      key={link}
                      onClick={() => setQuery(link)}
                      className="px-6 py-3 text-[9px] uppercase tracking-[0.2em] bg-[#1a1a1a] text-[#8e9192] border border-white/5 hover:border-white/20 hover:text-white transition-all rounded-none"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto px-10 py-10 scrollbar-hide">
              {query.trim() === "" ? (
                /* Empty / Suggestions State */
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-2xl text-white tracking-tight">Curated Selection</h4>
                    <Link href="/products" onClick={onClose} className="label-tiny text-[#555] hover:text-white transition-colors">Observe All</Link>
                  </div>
                  <div className="grid grid-cols-1 gap-10">
                    {featured.map((product) => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product.slug}`} 
                        onClick={onClose}
                        className="flex items-center gap-8 group"
                      >
                        <div className="w-24 h-32 relative overflow-hidden bg-[#1a1a1a] shrink-0">
                          <Image
                            src={(product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1 border-b border-white/5 pb-6 group-hover:border-white/10 transition-colors">
                          <h5 className="font-serif text-lg text-white group-hover:text-[#8e9192] transition-colors leading-tight mb-2 tracking-tight">{product.title}</h5>
                          <p className="label-tiny text-white">৳{Math.round(product.price || 0).toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                /* Search Results */
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                    <h4 className="font-serif text-2xl text-white tracking-tight">
                      {results.length} Found for <span className="italic text-[#555]">"{query}"</span>
                    </h4>
                  </div>

                   {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-10">
                      {results.map((product) => (
                        <Link 
                          key={product._id} 
                          href={`/products/${product.slug}`} 
                          onClick={onClose}
                          className="flex items-center gap-8 group"
                        >
                          <div className="w-24 h-32 relative overflow-hidden bg-[#1a1a1a] shrink-0">
                            <Image
                              src={(product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"}
                              alt={product.title}
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                              sizes="96px"
                            />
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-6 border-b border-white/5 pb-6 group-hover:border-white/10 transition-colors">
                            <div>
                              <h5 className="font-serif text-lg text-white group-hover:text-[#8e9192] transition-colors leading-tight mb-2 tracking-tight">{product.title}</h5>
                              <p className="label-tiny text-white">৳{Math.round(product.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center text-[#333] group-hover:text-white transition-all">
                              <ArrowRight size={20} strokeWidth={1} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      <Link
                        href={`/products?search=${query}`}
                        onClick={onClose}
                        className="flex items-center justify-center w-full py-6 bg-[#1a1a1a] text-[#8e9192] label-tiny hover:bg-[#222] hover:text-white transition-all mt-4 rounded-none border border-white/5"
                      >
                        Explore comprehensive results
                      </Link>
                    </div>
                  ) : (
                    <div className="py-24 text-center">
                      <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[#333] mx-auto mb-10">
                        <SearchIcon size={40} strokeWidth={1} />
                      </div>
                      <p className="font-serif text-3xl text-white mb-4 tracking-tight">No Archive Found</p>
                      <p className="label-tiny text-[#555] max-w-[280px] mx-auto">The query did not yield any archival specimens.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Promo / Footer */}
            <div className="p-10 bg-[#0e0e0e] border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-2xl text-white tracking-tight mb-2">SS26 Archive</p>
                  <p className="label-tiny text-[#555]">SYSTEM 01 NOW ACCESSIBLE</p>
                </div>
                <Link 
                  href="/products" 
                  onClick={onClose} 
                  className="btn-pill-primary"
                >
                  Observe
                </Link>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
