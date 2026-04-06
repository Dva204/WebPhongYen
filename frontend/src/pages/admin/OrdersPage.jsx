import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import AdminNav from '../../components/AdminNav';
import { formatPrice } from '../../utils/formatPrice';

const statusConfig = {
  pending: { color: 'badge-warning', next: 'confirmed' },
  confirmed: { color: 'badge-info', next: 'preparing' },
  preparing: { color: 'badge-info', next: 'ready' },
  ready: { color: 'badge-success', next: 'delivered' },
  delivered: { color: 'badge-success', next: null },
  cancelled: { color: 'badge-danger', next: null },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const { data } = await orderAPI.getAllAdmin(params);
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success(`Order updated to ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <h1 className="section-title">Quản Lý <span className="gradient-text">Đơn Hàng</span></h1>
        
        <AdminNav />

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-[var(--color-primary)] text-white' : 'bg-white/5 hover:bg-white/10'}`}>
              {s || 'Tất cả'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-text-muted)]">Không tìm thấy đơn hàng</div>
          ) : orders.map((order, i) => {
            const sc = statusConfig[order.status] || statusConfig.pending;
            return (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="glass-strong rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold">#{order.orderNumber || order._id.slice(-6)}</span>
                      <span className={`badge ${sc.color}`}>{order.status}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {order.user?.name || 'Unknown'} • {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm mt-1">{order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold gradient-text">{formatPrice(order.totalPrice)}</span>
                    <div className="flex gap-2">
                      {sc.next && (
                        <button onClick={() => updateStatus(order._id, sc.next)}
                          className="btn-primary !py-2 !px-4 text-xs">
                          → {sc.next}
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button onClick={() => updateStatus(order._id, 'cancelled')}
                          className="btn-ghost !py-2 !px-4 text-xs text-[var(--color-danger)]">
                          Huỷ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
