import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import toast from 'react-hot-toast';

import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import AdminNav from '../../components/AdminNav';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminAPI.getFinance();
        setStats(data.data);
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <div className="text-center pt-20">Không có dữ liệu</div>;

  const cards = [
    {
      title: 'Doanh Thu',
      value: formatPrice(stats.revenue),
      icon: <HiOutlineCurrencyDollar className="w-8 h-8" />,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Giá Vốn (COGS)',
      value: formatPrice(stats.cogs),
      icon: <HiOutlineCube className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Lợi Nhuận Gộp',
      value: formatPrice(stats.profit),
      icon: <HiOutlineTrendingUp className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Tổng Đơn Hàng',
      value: stats.orderCount,
      icon: <HiOutlineShoppingBag className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
    }
  ];

  const margin = stats.revenue ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <h1 className="section-title">
          Tổng Quan <span className="gradient-text">Tài Chính</span>
        </h1>
        
        <AdminNav />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-strong rounded-2xl p-6 relative overflow-hidden"
            >
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${card.color} opacity-20 blur-2xl rounded-full`} />
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-[var(--color-text-muted)]">{card.title}</h3>
              </div>
              <p className="text-2xl font-black">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-strong rounded-2xl p-6 max-w-2xl">
           <h3 className="text-xl font-bold mb-4">Phân tích biên lợi nhuận</h3>
           <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-8 border-[var(--color-primary)] border-t-transparent border-r-transparent -rotate-45" style={{ opacity: margin / 100 }} />
                 <span className="text-2xl font-black">{margin}%</span>
              </div>
              <div>
                 <p className="text-[var(--color-text-muted)] mb-2">Tỷ suất lợi nhuận gộp (Gross Margin)</p>
                 <p className="font-bold text-lg text-[var(--color-primary)]">
                    {margin > 30 ? 'Tuyệt vời! 🚀' : margin > 15 ? 'Khá tốt 👍' : 'Cần tối ưu chi phí nguyên liệu ⚠️'}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
