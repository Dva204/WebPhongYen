import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock } from 'react-icons/hi';
import { orderAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import { formatPrice } from '../utils/formatPrice';

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'badge-warning', icon: '⏳' },
  confirmed: { label: 'Đã xác nhận', color: 'badge-info', icon: '✅' },
  preparing: { label: 'Đang chuẩn bị', color: 'badge-info', icon: '👨‍🍳' },
  ready: { label: 'Đã sẵn sàng', color: 'badge-success', icon: '🎉' },
  delivered: { label: 'Đã giao hàng', color: 'badge-success', icon: '🚀' },
  cancelled: { label: 'Đã huỷ', color: 'badge-danger', icon: '❌' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getUserOrders({ page: 1, limit: 20 }).then(({ data }) => {
      setOrders(data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container max-w-4xl">
        <h1 className="section-title">Đơn hàng <span className="gradient-text">Của Tôi</span></h1>
        <p className="section-subtitle">Theo dõi và xem lịch sử đơn hàng của bạn</p>
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📋</span>
            <h3 className="text-xl font-bold mb-2">Chưa có đơn hàng nào</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const st = statusConfig[order.status] || statusConfig.pending;
              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-strong rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                        <span className={`badge ${st.color}`}>{st.icon} {st.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mt-1">
                        <HiOutlineClock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-2xl font-bold gradient-text">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-sm">
                        {item.name} ×{item.quantity}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
