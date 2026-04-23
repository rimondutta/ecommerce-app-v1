"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, qty: number, color?: string, size?: string) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.color === item.color && i.size === item.size
          );
          const newItems = existing
            ? state.items.map((i) =>
                i.id === item.id && i.color === item.color && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.items, item];
          return { items: newItems, isOpen: true };
        });
      },

      removeItem: (id, color, size) => {
        set((state) => ({
          items: state.items.filter((i) => {
            if (color !== undefined && size !== undefined) {
              return !(i.id === id && i.color === color && i.size === size);
            }
            return i.id !== id;
          }),
        }));
      },

      updateQuantity: (id, qty, color, size) => {
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => {
                  if (color !== undefined && size !== undefined) {
                    return !(i.id === id && i.color === color && i.size === size);
                  }
                  return i.id !== id;
                })
              : state.items.map((i) => {
                  if (color !== undefined && size !== undefined) {
                    return i.id === id && i.color === color && i.size === size
                      ? { ...i, quantity: qty }
                      : i;
                  }
                  return i.id === id ? { ...i, quantity: qty } : i;
                }),
        }));
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [], isOpen: false }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen state
    }
  )
);

// ── Backward-compatible aliases (replaces useCart() from CartProvider) ──
export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    count: store.items.reduce((s, i) => s + i.quantity, 0),
    total: store.items.reduce((s, i) => s + i.price * i.quantity, 0),
    isOpen: store.isOpen,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    openCart: store.openCart,
    closeCart: store.closeCart,
    clearCart: store.clearCart,
  };
}
