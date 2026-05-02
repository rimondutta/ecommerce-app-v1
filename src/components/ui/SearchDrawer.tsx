"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, Search as SearchIcon, ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const quickLinks = ["Fashion", "Men", "Women", "Shoes", "Accessories"];

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);

  // Fetch featured products for empty state
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
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md" aria-hidden="true" />
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
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[550px] bg-white flex flex-col shadow-soft-2xl rounded-l-[2rem] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <SearchIcon size={22} className="text-zinc-400" />
                <h2 className="font-display font-bold text-2xl text-zinc-900 tracking-tight">
                  Search <span className="text-zinc-400 font-medium ml-1">Products</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input Section */}
            <div className="px-8 py-10">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-5 text-lg font-medium text-zinc-900 placeholder:text-zinc-300 outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                  autoFocus
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-200 text-zinc-600 hover:bg-zinc-300 transition-colors"
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-zinc-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Popular Searches</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((link) => (
                    <button
                      key={link}
                      onClick={() => setQuery(link)}
                      className="px-5 py-2.5 text-sm font-semibold rounded-full bg-zinc-50 text-zinc-600 border border-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
              {query.trim() === "" ? (
                /* Empty / Suggestions State */
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-xl text-zinc-900">Featured Products</h4>
                    <Link href="/shop" onClick={onClose} className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors">View All</Link>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {featured.map((product) => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product.slug}`} 
                        onClick={onClose}
                        className="flex items-center gap-6 group"
                      >
                        <div className="w-20 h-24 relative rounded-2xl overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100">
                          <Image
                            src={(product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-display font-bold text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors leading-tight mb-1">{product.title}</h5>
                          <p className="font-bold text-zinc-900">৳{Math.round(product.price || 0).toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                /* Search Results */
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-xl text-zinc-900">
                      {results.length} results for "{query}"
                    </h4>
                  </div>

                   {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {results.map((product) => (
                        <Link 
                          key={product._id} 
                          href={`/products/${product.slug}`} 
                          onClick={onClose}
                          className="flex items-center gap-6 group"
                        >
                          <div className="w-20 h-24 relative rounded-2xl overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100">
                            <Image
                              src={(product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"}
                              alt={product.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-4">
                            <div>
                              <h5 className="font-display font-bold text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors leading-tight mb-1">{product.title}</h5>
                              <p className="font-bold text-zinc-900">৳{Math.round(product.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      <Link
                        href={`/shop?search=${query}`}
                        onClick={onClose}
                        className="flex items-center justify-center w-full py-4 bg-zinc-50 rounded-2xl font-bold text-sm text-zinc-900 hover:bg-zinc-100 transition-all mt-4"
                      >
                        View all results
                      </Link>
                    </div>
                  ) : (
                    <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mx-auto mb-6">
                        <SearchIcon size={40} />
                      </div>
                      <p className="font-display font-bold text-xl text-zinc-900 mb-2">No results found</p>
                      <p className="text-zinc-500 text-sm">We couldn't find anything matching "{query}". Try a different term or browse our collections.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Promo / Footer */}
            <div className="p-8 bg-zinc-900 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-xl tracking-tight mb-1">New Arrivals</p>
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Explore the 2024 Collection</p>
                </div>
                <Link 
                  href="/shop" 
                  onClick={onClose} 
                  className="px-6 py-3.5 bg-white text-zinc-900 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 transition-all shadow-soft"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
