import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartLine, Product } from '@/types';

interface CartStore {
  cart: Cart | null;
  createCart: () => void;
  addItem: (product: Product, qty?: number) => void;
  updateQty: (sku: string, qty: number) => void;
  removeItem: (sku: string) => void;
  openCheckout: () => void;
  cancelCheckout: () => void;
  convertCart: () => void;
  clearCart: () => void;
}

const generateCartId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const calculateTotals = (lines: CartLine[]) => {
  const totalItems = lines.reduce((sum, line) => sum + line.qty, 0);
  const grandTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { totalItems, grandTotal };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,

      createCart: () => {
        set({
          cart: {
            cartId: generateCartId(),
            lines: [],
            totalItems: 0,
            grandTotal: 0,
            status: 'NEW'
          }
        });
      },

      addItem: (product: Product, qty = 1) => {
        const state = get();
        
        if (!state.cart) {
          state.createCart();
        }

        const cart = get().cart!;
        const existingLineIndex = cart.lines.findIndex(line => line.sku === product.sku);
        
        let newLines: CartLine[];
        
        if (existingLineIndex >= 0) {
          // Update existing line
          newLines = [...cart.lines];
          const newQty = newLines[existingLineIndex].qty + qty;
          const lineTotal = newQty * product.price;
          newLines[existingLineIndex] = {
            ...newLines[existingLineIndex],
            qty: newQty,
            lineTotal
          };
        } else {
          // Add new line
          const newLine: CartLine = {
            sku: product.sku,
            name: product.name,
            price: product.price,
            qty,
            lineTotal: qty * product.price
          };
          newLines = [...cart.lines, newLine];
        }

        const { totalItems, grandTotal } = calculateTotals(newLines);

        set({
          cart: {
            ...cart,
            lines: newLines,
            totalItems,
            grandTotal,
            status: 'ACTIVE'
          }
        });
      },

      updateQty: (sku: string, qty: number) => {
        const cart = get().cart;
        if (!cart) return;

        if (qty <= 0) {
          get().removeItem(sku);
          return;
        }

        const newLines = cart.lines.map(line => 
          line.sku === sku 
            ? { ...line, qty, lineTotal: qty * line.price }
            : line
        );

        const { totalItems, grandTotal } = calculateTotals(newLines);

        set({
          cart: {
            ...cart,
            lines: newLines,
            totalItems,
            grandTotal
          }
        });
      },

      removeItem: (sku: string) => {
        const cart = get().cart;
        if (!cart) return;

        const newLines = cart.lines.filter(line => line.sku !== sku);
        const { totalItems, grandTotal } = calculateTotals(newLines);

        set({
          cart: {
            ...cart,
            lines: newLines,
            totalItems,
            grandTotal
          }
        });
      },

      openCheckout: () => {
        const cart = get().cart;
        if (!cart) return;

        set({
          cart: {
            ...cart,
            status: 'CHECKING_OUT'
          }
        });
      },

      cancelCheckout: () => {
        const cart = get().cart;
        if (!cart) return;

        set({
          cart: {
            ...cart,
            status: 'ACTIVE'
          }
        });
      },

      convertCart: () => {
        const cart = get().cart;
        if (!cart) return;

        set({
          cart: {
            ...cart,
            status: 'CONVERTED'
          }
        });
      },

      clearCart: () => {
        set({ cart: null });
      }
    }),
    {
      name: 'cyoda-cart-storage',
    }
  )
);