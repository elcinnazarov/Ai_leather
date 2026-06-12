// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalCartItem {
  cartItemId: string;
  productModelId: number;
  productModelName: string;
  leatherId: number;
  leatherName: string;
  quantity: number;
  seenPrice: number;
  currency: string;
  customRenderUrl?: string;
  image?: string;
}

interface CartStore {
  items: LocalCartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;  // ✅ ShopLayout bunu gözləyir
  addItem: (item: LocalCartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSeenPrice: (cartItemId: string, newPrice: number) => void;
  clearCart: () => void;
  getItemCount: () => number;  // ✅ Badge üçün
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,  // ✅ Default bağlı olmalıdır
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.cartItemId === item.cartItemId);
        if (existing) {
          return {
            items: state.items.map(i => 
              i.cartItemId === item.cartItemId 
                ? { ...i, quantity: i.quantity + item.quantity } 
                : i
            ),
            isOpen: true  // ✅ Əlavə edəndə səbəti aç
          };
        }
        return { items: [...state.items, item], isOpen: true };
      }),
      
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(i => i.cartItemId !== cartItemId)
      })),
      
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i
        )
      })),

      updateSeenPrice: (cartItemId, newPrice) => set((state) => ({
        items: state.items.map(i => 
          i.cartItemId === cartItemId ? { ...i, seenPrice: newPrice } : i
        )
      })),

      clearCart: () => set({ items: [] }),
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    { name: 'atelier-cart-storage' }
  )
);