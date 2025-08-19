import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartLine, Product } from '@/types';
import { CartService } from '@/services/cyoda';

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  createCart: () => void;
  addItem: (product: Product, qty?: number) => Promise<void>;
  updateQty: (sku: string, qty: number) => Promise<void>;
  removeItem: (sku: string) => Promise<void>;
  openCheckout: () => void;
  cancelCheckout: () => void;
  convertCart: () => void;
  clearCart: () => void;
  syncWithCyoda: () => Promise<void>;
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
      loading: false,
      error: null,

      createCart: () => {
        const newCart: Cart = {
          cartId: generateCartId(),
          lines: [],
          totalItems: 0,
          grandTotal: 0,
          status: 'NEW'
        };
        
        set({ cart: newCart });
        
        // Optionally sync with Cyoda in background
        get().syncWithCyoda().catch(console.error);
      },

      addItem: async (product: Product, qty = 1) => {
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

        const updatedCart = {
          ...cart,
          lines: newLines,
          totalItems,
          grandTotal,
          status: 'ACTIVE' as const
        };

        set({ cart: updatedCart });
        
        // Sync with Cyoda
        try {
          await get().syncWithCyoda();
        } catch (error) {
          console.error('Failed to sync cart with Cyoda:', error);
        }
      },

      updateQty: async (sku: string, qty: number) => {
        const cart = get().cart;
        if (!cart) return;

        if (qty <= 0) {
          await get().removeItem(sku);
          return;
        }

        const newLines = cart.lines.map(line => 
          line.sku === sku 
            ? { ...line, qty, lineTotal: qty * line.price }
            : line
        );

        const { totalItems, grandTotal } = calculateTotals(newLines);

        const updatedCart = {
          ...cart,
          lines: newLines,
          totalItems,
          grandTotal
        };

        set({ cart: updatedCart });
        
        try {
          await get().syncWithCyoda();
        } catch (error) {
          console.error('Failed to sync cart with Cyoda:', error);
        }
      },

      removeItem: async (sku: string) => {
        const cart = get().cart;
        if (!cart) return;

        const newLines = cart.lines.filter(line => line.sku !== sku);
        const { totalItems, grandTotal } = calculateTotals(newLines);

        const updatedCart = {
          ...cart,
          lines: newLines,
          totalItems,
          grandTotal
        };

        set({ cart: updatedCart });
        
        try {
          await get().syncWithCyoda();
        } catch (error) {
          console.error('Failed to sync cart with Cyoda:', error);
        }
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
      },

      syncWithCyoda: async () => {
        const cart = get().cart;
        if (!cart) return;

        set({ loading: true, error: null });

        try {
          // Try to get existing cart first
          let existingCart;
          try {
            existingCart = await CartService.get(cart.cartId);
          } catch (error) {
            // Cart doesn't exist in Cyoda, create it
            existingCart = null;
          }

          if (existingCart) {
            // Update existing cart
            await CartService.update(cart.cartId, cart);
          } else {
            // Create new cart
            await CartService.create(cart);
          }

          set({ loading: false });
        } catch (error) {
          console.error('Failed to sync with Cyoda:', error);
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to sync with Cyoda'
          });
        }
      }
    }),
    {
      name: 'cyoda-cart-storage',
    }
  )
);