/**
 * Auth Store (Zustand)
 * Manages authentication state
 */
import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Lazy import to avoid circular dependency
const syncCart = async () => {
  const { default: useCartStore } = await import('./cartStore');
  useCartStore.getState().fetchCart();
};

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,

  // Initialize auth from stored token
  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data } = await authAPI.getProfile();
      set({
        user: data.data.user,
        isAuthenticated: true,
        isAdmin: data.data.user.role === 'admin',
        isLoading: false,
      });
      syncCart(); // Load backend cart silently
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  },

  // Register
  register: async (userData) => {
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('accessToken', data.data.accessToken);
      set({
        user: data.data.user,
        isAuthenticated: true,
        isAdmin: data.data.user.role === 'admin',
      });
      toast.success('Registration successful! Welcome! 🎉');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return false;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('accessToken', data.data.accessToken);
      set({
        user: data.data.user,
        isAuthenticated: true,
        isAdmin: data.data.user.role === 'admin',
      });
      toast.success(`Chào mừng trở lại, ${data.data.user.name}! 👋`);
      syncCart(); // Sync backend cart
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(msg);
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false, isAdmin: false });
    toast.success('Logged out successfully');
  },
}));

export default useAuthStore;
