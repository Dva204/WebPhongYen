/**
 * Cart Page
 */
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineArrowRight, HiOutlineShoppingCart } from 'react-icons/hi';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl mb-6">🛒</motion.div>
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-[var(--color-text-muted)] mb-8">Hãy thêm vài món ăn ngon để bắt đầu!</p>
          <Link to="/menu" className="btn-primary text-lg !px-8">Xem thực đơn</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Giỏ <span className="gradient-text">Hàng</span></h1>
            <p className="text-[var(--color-text-muted)]">{totalItems} sản phẩm trong giỏ</p>
          </div>
          <button onClick={clearCart} className="btn-ghost text-[var(--color-danger)] text-sm">
            <HiOutlineTrash className="w-4 h-4" /> Xoá tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="flex gap-4 p-4 glass rounded-2xl"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{item.name}</h3>
                    <p className="text-[var(--color-primary)] font-bold text-lg">{formatPrice(item.price)}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-1">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 hover:text-[var(--color-primary)] disabled:opacity-30">
                          <HiOutlineMinus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 hover:text-[var(--color-primary)]">
                          <HiOutlinePlus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--color-danger)] transition-colors">
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Tạm tính ({totalItems} món)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Phí giao hàng</span>
                  <span className="text-[var(--color-success)]">{totalPrice >= 250000 ? 'Miễn phí' : formatPrice(30000)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Thuế (8%)</span>
                  <span>{formatPrice(totalPrice * 0.08)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold">
                  <span>Tổng cộng</span>
                  <span className="gradient-text">
                    {formatPrice(totalPrice + (totalPrice < 250000 ? 30000 : 0) + totalPrice * 0.08)}
                  </span>
                </div>
              </div>

              {totalPrice < 250000 && (
                <p className="text-xs text-[var(--color-warning)] mb-4 p-3 rounded-xl bg-yellow-500/10">
                  💡 Thêm {formatPrice(250000 - totalPrice)} để được miễn phí giao hàng!
                </p>
              )}

              <Link to="/checkout" className="btn-primary w-full text-lg !py-4 mb-3">
                Thanh toán <HiOutlineArrowRight />
              </Link>
              <Link to="/menu" className="btn-ghost w-full justify-center">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
