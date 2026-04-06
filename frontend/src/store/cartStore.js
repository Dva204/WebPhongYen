/**
 * Cart Store (Zustand)
 * Manages shopping cart with localStorage persistence
 */
import { create } from 'zustand';
import toast from 'react-hot-toast';

const CART_STORAGE_KEY = 'fastfood-cart';

// Load cart from localStorage
const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage
const saveCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const useCartStore = create((set, get) => ({
  items: loadCart(),
  
  // Get total items count
  get totalItems() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Get total price
  get totalPrice() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  // Computed getters (since Zustand doesn't have getters natively)
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  // Add item to cart
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item._id === product._id
      );

      let newItems;
      if (existingIndex >= 0) {
        newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
      } else {
        newItems = [...state.items, {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }];
      }

      saveCart(newItems);
      return { items: newItems };
    });
    toast.success(`${product.name} added to cart! 🛒`);
  },

  // Update item quantity
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set((state) => {
      const newItems = state.items.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },

  // Remove item from cart
  removeItem: (productId) => {
    set((state) => {
      const item = state.items.find((i) => i._id === productId);
      const newItems = state.items.filter((i) => i._id !== productId);
      saveCart(newItems);
      if (item) toast.success(`${item.name} removed from cart`);
      return { items: newItems };
    });
  },

  // Clear entire cart
  clearCart: () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    set({ items: [] });
  },

  // Check if item is in cart
  isInCart: (productId) => {
    return get().items.some((item) => item._id === productId);
  },

  // Get item quantity in cart
  getItemQuantity: (productId) => {
    const item = get().items.find((i) => i._id === productId);
    return item ? item.quantity : 0;
  },
}));

export default useCartStore;
