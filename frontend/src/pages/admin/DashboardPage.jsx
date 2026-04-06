import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCurrencyDollar, HiOutlineShoppingBag, HiOutlineUsers, HiOutlineTrendingUp } from 'react-icons/hi';
import { adminAPI, orderAPI } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import AdminNav from '../../components/AdminNav';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(({ data }) => {
      setStats(data.data.stats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <div className="pt-24 text-center">Failed to load dashboard</div>;

  const cards = [
    { label: 'Tổng đơn', value: stats.totalOrders, icon: <HiOutlineShoppingBag />, color: 'from-blue-500 to-blue-600' },
    { label: 'Doanh thu tháng', value: formatPrice(stats.monthlyRevenue), icon: <HiOutlineCurrencyDollar />, color: 'from-green-500 to-green-600' },
    { label: 'Đơn hôm nay', value: stats.dailyOrders, icon: <HiOutlineTrendingUp />, color: 'from-orange-500 to-orange-600' },
    { label: 'Đang chờ', value: stats.statusBreakdown?.pending || 0, icon: <HiOutlineUsers />, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <h1 className="section-title">Trang <span className="gradient-text">Quản Trị</span></h1>
        
        <AdminNav />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-2xl p-6 glass-strong">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-20 rounded-bl-full`} />
              <div className={`text-3xl mb-3 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>{card.icon}</div>
              <p className="text-3xl font-black">{card.value}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Products */}
        {stats.topProducts?.length > 0 && (
          <div className="glass-strong rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">🏆 Sản phẩm bán chạy</h3>
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[var(--color-text-muted)] w-6">#{i + 1}</span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-primary)]">{p.totalSold} đã bán</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatPrice(p.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {stats.recentOrders?.length > 0 && (
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">📋 Đơn hàng gần đây</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-[var(--color-text-muted)]">Đơn hàng</th>
                    <th className="text-left py-3 px-2 text-[var(--color-text-muted)]">Khách hàng</th>
                    <th className="text-left py-3 px-2 text-[var(--color-text-muted)]">Trạng thái</th>
                    <th className="text-right py-3 px-2 text-[var(--color-text-muted)]">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-white/5">
                      <td className="py-3 px-2 font-medium">#{order.orderNumber || order._id.slice(-6)}</td>
                      <td className="py-3 px-2">{order.user?.name || 'N/A'}</td>
                      <td className="py-3 px-2"><span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>{order.status}</span></td>
                      <td className="py-3 px-2 text-right font-bold">{formatPrice(order.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
