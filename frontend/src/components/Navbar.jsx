/**
 * Navbar Component
 * Main navigation with cart badge and auth controls
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineViewGrid } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/menu', label: 'Thực đơn' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'glass-strong shadow-lg'
          : 'bg-transparent'
        }`}
    >
      <nav className="page-container flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:animate-bounce transition-transform">🍔</span>
          <span className="text-xl font-bold gradient-text hidden sm:block">
            Phong Yến Shop
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative font-medium transition-colors duration-300 hover:text-[var(--color-primary)] ${location.pathname === link.to
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
                }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full"
                />
              )}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/orders"
              className={`font-medium transition-colors duration-300 hover:text-[var(--color-primary)] ${location.pathname === '/orders' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                }`}
            >
              Đơn hàng của tôi
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
            id="nav-cart-btn"
          >
            <HiOutlineShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors"
                id="nav-user-btn"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl overflow-hidden shadow-xl"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm transition-colors">
                        <HiOutlineViewGrid className="w-4 h-4 text-[var(--color-primary)]" />
                        Trang quản trị
                      </Link>
                    )}
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm transition-colors">
                      <HiOutlineUser className="w-4 h-4" />
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm transition-colors w-full text-[var(--color-danger)]"
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary !py-2 !px-5 text-sm">
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/5"
          >
            {isMobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-strong border-t border-white/5 overflow-hidden"
          >
            <div className="page-container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="py-3 px-4 rounded-xl hover:bg-white/5 font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to="/orders" className="py-3 px-4 rounded-xl hover:bg-white/5 font-medium transition-colors">
                  Đơn hàng của tôi
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
