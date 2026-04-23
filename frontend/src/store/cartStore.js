/**
 * Cart Store (Zustand)
 * - When user is authenticated → syncs with backend API
 * - When guest → uses localStorage (same UX as before)
 *
 * The store exposes the same interface as before so existing
 * CartPage, CheckoutPage, Navbar, etc. continue to work unchanged.
 */
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { cartAPI } from '../services/api';

const CART_STORAGE_KEY = 'fastfood-cart';

// ─── localStorage helpers ────────────────────────────────────────────────────
const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

// ─── Helper: is the user logged in? ─────────────────────────────────────────
const isLoggedIn = () => !!localStorage.getItem('accessToken');

// ─── Store ───────────────────────────────────────────────────────────────────
const useCartStore = create((set, get) => ({
  items: loadCart(),
  loading: false,

  // ── Computed helpers ───────────────────────────────────────────────────────
  getTotalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  getTotalPrice: () =>
    get().items.reduce((s, i) => s + i.price * i.quantity, 0),

  isInCart: (productId) =>
    get().items.some((item) => item._id === productId || item.productId === productId),

  getItemQuantity: (productId) => {
    const item = get().items.find(
      (i) => i._id === productId || i.productId === productId
    );
    return item ? item.quantity : 0;
  },

  // ── Fetch cart from backend (call after login) ─────────────────────────────
  fetchCart: async () => {
    if (!isLoggedIn()) return;
    try {
      set({ loading: true });
      const { data } = await cartAPI.getCart();
      const backendItems = (data.data.cart.items || []).map((item) => ({
        _id: item.productId?._id || item.productId,
        productId: item.productId?._id || item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }));
      set({ items: backendItems, loading: false });
      saveCart(backendItems);
    } catch {
      set({ loading: false });
    }
  },

  // ── Add item to cart ───────────────────────────────────────────────────────
  addItem: async (product, quantity = 1) => {
    if (isLoggedIn()) {
      try {
        const { data } = await cartAPI.addItem(product._id, quantity);
        const backendItems = (data.data.cart.items || []).map((item) => ({
          _id: item.productId?._id || item.productId,
          productId: item.productId?._id || item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        }));
        set({ items: backendItems });
        saveCart(backendItems);
        toast.success(`${product.name} đã thêm vào giỏ! 🛒`);
      } catch (err) {
        const msg =
          err.response?.data?.message || 'Không thể thêm vào giỏ hàng';
        toast.error(msg);
      }
    } else {
      // Guest — localStorage only
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
          newItems = [
            ...state.items,
            {
              _id: product._id,
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity,
            },
          ];
        }
        saveCart(newItems);
        return { items: newItems };
      });
      toast.success(`${product.name} đã thêm vào giỏ! 🛒`);
    }
  },

  // ── Update quantity ────────────────────────────────────────────────────────
  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) return;

    if (isLoggedIn()) {
      try {
        const { data } = await cartAPI.updateItem(productId, quantity);
        const backendItems = (data.data.cart.items || []).map((item) => ({
          _id: item.productId?._id || item.productId,
          productId: item.productId?._id || item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        }));
        set({ items: backendItems });
        saveCart(backendItems);
      } catch (err) {
        const msg = err.response?.data?.message || 'Cập nhật thất bại';
        toast.error(msg);
      }
    } else {
      set((state) => {
        const newItems = state.items.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        );
        saveCart(newItems);
        return { items: newItems };
      });
    }
  },

  // ── Remove item ────────────────────────────────────────────────────────────
  removeItem: async (productId) => {
    if (isLoggedIn()) {
      try {
        const { data } = await cartAPI.removeItem(productId);
        const backendItems = (data.data.cart.items || []).map((item) => ({
          _id: item.productId?._id || item.productId,
          productId: item.productId?._id || item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        }));
        set({ items: backendItems });
        saveCart(backendItems);
        toast.success('Đã xoá sản phẩm khỏi giỏ');
      } catch (err) {
        toast.error('Không thể xoá sản phẩm');
      }
    } else {
      set((state) => {
        const item = state.items.find((i) => i._id === productId);
        const newItems = state.items.filter((i) => i._id !== productId);
        saveCart(newItems);
        if (item) toast.success(`${item.name} đã được xoá`);
        return { items: newItems };
      });
    }
  },

  // ── Clear cart ─────────────────────────────────────────────────────────────
  clearCart: async () => {
    if (isLoggedIn()) {
      try {
        await cartAPI.clearCart();
      } catch {
        // Silently continue — clear locally anyway
      }
    }
    localStorage.removeItem(CART_STORAGE_KEY);
    set({ items: [] });
  },
}));

export default useCartStore;
