import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/LoadingSpinner';
import useAuthStore from './store/authStore';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProducts = lazy(() => import('./pages/admin/ProductsPage'));
const AdminOrders = lazy(() => import('./pages/admin/OrdersPage'));
const AdminIngredients = lazy(() => import('./pages/admin/IngredientsPage'));

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#ff6b35', secondary: '#fff' } },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Guest only */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Protected */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/ingredients" element={<AdminRoute><AdminIngredients /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="pt-24 pb-16 min-h-[60vh] flex items-center justify-center text-center">
                <div>
                  <span className="text-8xl block mb-4">🍕</span>
                  <h1 className="text-4xl font-black mb-2">404</h1>
                  <p className="text-[var(--color-text-muted)]">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
