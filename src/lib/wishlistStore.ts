import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WishlistItem {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_image: string | null;
  book_price: number;
  book_condition: string;
  created_at: string;
}

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string, book: any) => Promise<boolean>;
  removeFromWishlist: (userId: string, bookId: string) => Promise<boolean>;
  isInWishlist: (bookId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      set({ items: data || [] });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      set({ loading: false });
    }
  },

  addToWishlist: async (userId: string, book: any) => {
    try {
      const wishlistItem = {
        user_id: userId,
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_image: book.image,
        book_price: book.price,
        book_condition: book.condition
      };

      const { data, error } = await supabase
        .from('wishlists')
        .insert(wishlistItem)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return false; // Already in wishlist
        }
        console.error('Error adding to wishlist:', error);
        return false;
      }

      set(state => ({
        items: [data, ...state.items]
      }));

      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  },

  removeFromWishlist: async (userId: string, bookId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return false;
      }

      set(state => ({
        items: state.items.filter(item => item.book_id !== bookId)
      }));

      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  },

  isInWishlist: (bookId: string) => {
    return get().items.some(item => item.book_id === bookId);
  },

  clearWishlist: () => {
    set({ items: [] });
  }
}));