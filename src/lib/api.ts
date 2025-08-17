/**
 * API Configuration for PHP Backend
 */

// API Base URL - Update this to match your backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/BookCommerce/backend/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    VERIFY: '/auth/verify',
  },
  
  // Books
  BOOKS: {
    LIST: '/books',
    FEATURED: '/books/featured',
    DETAIL: (id: string | number) => `/books/${id}`,
    CREATE: '/books',
    UPDATE: (id: string | number) => `/books/${id}`,
    DELETE: (id: string | number) => `/books/${id}`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
  },
  
  // Cart
  CART: {
    LIST: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
    TOTAL: '/cart/total',
  },
  
  // Wishlist (to be implemented)
  WISHLIST: {
    LIST: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Get authorization header with JWT token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
