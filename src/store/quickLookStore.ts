"use client";
import { create } from "zustand";

export interface QuickLookColor {
  name: string;
  hex?: string;
  class?: string;
}

export interface QuickLookProduct {
  _id?: string;
  id?: string | number;
  slug?: string;
  title: string;
  price?: number;
  priceNum?: number;
  oldPrice?: number;
  badge?: string;
  images?: Array<{ url?: string; src?: string } | string>;
  colors?: Array<QuickLookColor>;
  sizes?: string[];
  category?: { name?: string; title?: string };
}

interface QuickLookState {
  isOpen: boolean;
  product: QuickLookProduct | null;
  openQuickLook: (product: QuickLookProduct) => void;
  closeQuickLook: () => void;
}

export const useQuickLookStore = create<QuickLookState>()((set) => ({
  isOpen: false,
  product: null,
  openQuickLook: (product) => set({ isOpen: true, product }),
  closeQuickLook: () => set({ isOpen: false, product: null }),
}));

export function useQuickLook() {
  return useQuickLookStore();
}
