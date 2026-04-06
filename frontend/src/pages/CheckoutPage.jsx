/**
 * Checkout Page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineCreditCard, HiOutlineCash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { formatPrice } from '../utils/formatPrice';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    paymentMethod: 'cash',
    note: '',
  });

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 250000 ? 0 : 30000;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + deliveryFee + tax;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Cart is empty');
    if (!form.street || !form.city) return toast.error('Please fill in delivery address');

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
        paymentMethod: form.paymentMethod,
        note: form.note,
      };

      const { data } = await orderAPI.create(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">Thanh toán</h1>
          <p className="section-subtitle">Hoàn tất thông tin đơn hàng</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HiOutlineLocationMarker className="w-5 h-5 text-[var(--color-primary)]" />
                  Địa chỉ giao hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Địa chỉ đường *</label>
                    <input name="street" value={form.street} onChange={handleChange} className="input-field" placeholder="123 Main Street" required />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Thành phố *</label>
                    <input name="city" value={form.city} onChange={handleChange} className="input-field" placeholder="New York" required />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Tỉnh / Bang</label>
                    <input name="state" value={form.state} onChange={handleChange} className="input-field" placeholder="NY" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Mã bưu chính</label>
                    <input name="zipCode" value={form.zipCode} onChange={handleChange} className="input-field" placeholder="10001" />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HiOutlineCreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'cash', label: 'Thanh toán khi nhận hàng', icon: <HiOutlineCash className="w-6 h-6" />, desc: 'Kiểm tra và thanh toán lúc nhận hàng' },
                    { value: 'card', label: 'Thẻ tín dụng', icon: <HiOutlineCreditCard className="w-6 h-6" />, desc: 'Visa, Mastercard, v.v' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                        form.paymentMethod === method.value
                          ? 'bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]'
                          : 'bg-white/5 border-2 border-transparent hover:border-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="text-[var(--color-primary)]">{method.icon}</div>
                      <div>
                        <p className="font-semibold">{method.label}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Note */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-2xl p-6">
                <label className="text-sm text-[var(--color-text-muted)] mb-2 block">Ghi chú (tuỳ chọn)</label>
                <textarea name="note" value={form.note} onChange={handleChange} className="input-field min-h-[100px] resize-none" placeholder="Yêu cầu đặc biệt..." />
              </motion.div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="glass-strong rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h3>
                
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)] truncate mr-2">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Tạm tính</span><span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Phí giao hàng</span>
                    <span className={deliveryFee === 0 ? 'text-[var(--color-success)]' : ''}>{deliveryFee === 0 ? 'Miễn phí' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Thuế (8%)</span><span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold">
                    <span>Tổng cộng</span>
                    <span className="gradient-text">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-lg !py-4 mt-6"
                  id="place-order-btn"
                >
                  {loading ? 'Đang xác nhận...' : `Đặt hàng • ${formatPrice(grandTotal)}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
