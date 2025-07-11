import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from './bookData';

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (book: Book) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (bookId: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (book: Book) => {
        const items = get().items;
        const existingItem = items.find(item => item.book.id === book.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.book.id === book.id
                ? { ...item, quantity: Math.min(item.quantity + 1, book.inStock) }
                : item
            )
          });
        } else {
          set({
            items: [...items, { book, quantity: 1 }]
          });
        }
      },
      
      removeItem: (bookId: string) => {
        set({
          items: get().items.filter(item => item.book.id !== bookId)
        });
      },
      
      updateQuantity: (bookId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(bookId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.book.id === bookId
              ? { ...item, quantity: Math.min(quantity, item.book.inStock) }
              : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.book.price * item.quantity), 0);
      },
      
      getItemQuantity: (bookId: string) => {
        const item = get().items.find(item => item.book.id === bookId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);