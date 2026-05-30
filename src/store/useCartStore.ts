import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocalCartItem } from '../types/cart';

interface CartState {
  cartItems: LocalCartItem[];
  isCartOpen: boolean;
  addItem: (item: LocalCartItem) => void;
  removeItem: (productModelId: number, leatherId: number) => void;
  updateQuantity: (productModelId: number, leatherId: number, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartItems: [],
      isCartOpen: false,

      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.cartItems.findIndex(
          (item) => item.productModelId === newItem.productModelId && item.leatherId === newItem.leatherId
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item already exists in the cart
          const updatedItems = [...state.cartItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          return { cartItems: updatedItems, isCartOpen: true };
        }

        // Add new item and open cart
        return { cartItems: [...state.cartItems, newItem], isCartOpen: true };
      }),

      removeItem: (productModelId, leatherId) => set((state) => ({
        cartItems: state.cartItems.filter(
          (item) => !(item.productModelId === productModelId && item.leatherId === leatherId)
        )
      })),

      updateQuantity: (productModelId, leatherId, quantity) => set((state) => ({
        cartItems: state.cartItems.map((item) => 
          item.productModelId === productModelId && item.leatherId === leatherId
            ? { ...item, quantity: Math.max(1, quantity) } // Ensure quantity is at least 1
            : item
        )
      })),

      clearCart: () => set({ cartItems: [] }),
      
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
    }),
    {
      name: 'atelier-cart-storage', // The key used in localStorage
      partialize: (state) => ({ cartItems: state.cartItems }), // Only persist cartItems, not isCartOpen
    }
  )
);
