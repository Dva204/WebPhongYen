/**
 * Home Page
 * Hero section, featured products, categories
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineShoppingCart, HiOutlineClock, HiOutlineTruck, HiOutlineShieldCheck } from 'react-icons/hi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/LoadingSpinner';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getFeatured(),
          categoryAPI.getAll(),
        ]);
        setFeatured(prodRes.data.data.products);
        setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: <HiOutlineClock className="w-8 h-8" />, title: 'Giao hàng nhanh', desc: 'Nhận hàng trong 30 phút' },
    { icon: <HiOutlineShieldCheck className="w-8 h-8" />, title: 'Tươi ngon & Chất lượng', desc: '100% nguyên liệu tươi' },
    { icon: <HiOutlineTruck className="w-8 h-8" />, title: 'Miễn phí giao hàng', desc: 'Cho đơn hàng trên 250.000đ' },
    { icon: <HiOutlineShoppingCart className="w-8 h-8" />, title: 'Dễ dàng đặt hàng', desc: 'Thanh toán đơn giản' },
  ];

  return (
    <div>
      {/* ==================== HERO ==================== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[150px] opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-[var(--color-secondary)] rounded-full blur-[120px] opacity-15" />

        <div className="page-container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block badge badge-primary mb-6 text-sm">
                🔥 #1 Giao Đồ Ăn Nhanh
              </span>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
                Thưởng thức{' '}
                <span className="gradient-text">Món Ngon</span>
                {' '}Nhất Phố
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-lg leading-relaxed">
                Từ hamburger giòn rụm đến pizza ngập phô mai, chúng tôi mang niềm vui lên từng đĩa ăn. 
                Đặt hàng ngay và trải nghiệm thức ăn nhanh cao cấp như chưa từng có.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/menu" className="btn-primary text-lg !px-8 !py-4">
                  Đặt hàng ngay <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/menu" className="btn-secondary text-lg !px-8 !py-4">
                  Xem thực đơn
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                {[
                  { value: '10K+', label: 'Khách hàng hài lòng' },
                  { value: '50+', label: 'Món ăn' },
                  { value: '4.9', label: 'Đánh giá' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/10 flex items-center justify-center animate-float">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
                    alt="Delicious burger"
                    className="w-[340px] h-[340px] object-cover rounded-full shadow-2xl"
                  />
                </div>
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-5 right-0 glass-strong rounded-2xl p-3 shadow-xl"
                >
                  <span className="text-3xl">🍕</span>
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-10 left-0 glass-strong rounded-2xl p-3 shadow-xl"
                >
                  <span className="text-3xl">🍟</span>
                </motion.div>
                <motion.div
                  animate={{ y: [-5, 15, -5] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute bottom-0 right-10 glass-strong rounded-2xl px-4 py-2 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="text-sm font-bold">4.9 Đánh giá</p>
                      <p className="text-xs text-[var(--color-text-muted)]">10K+ lượt</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="py-16 border-y border-white/5">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="inline-flex p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                  {feat.icon}
                </div>
                <h3 className="font-bold mb-1">{feat.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Duyệt theo <span className="gradient-text">Danh mục</span></h2>
            <p className="section-subtitle">Tìm danh mục thức ăn yêu thích của bạn</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/menu?category=${cat._id}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[var(--color-primary)]/30 hover:bg-white/[0.06] transition-all duration-300 group"
                >
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                    {cat.icon}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="py-20 bg-white/[0.01]">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="section-title">Món ăn <span className="gradient-text">Nổi bật</span></h2>
              <p className="section-subtitle !mb-0">Những món được mọi người yêu thích nhất</p>
            </div>
            <Link to="/menu" className="btn-ghost hidden md:inline-flex">
              Xem tất cả <HiOutlineArrowRight />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : featured.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))
            }
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/menu" className="btn-primary">
              Xem toàn bộ thực đơn <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Đói chưa? Đặt ngay! 🍔
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Giảm 20% cho đơn hàng đầu tiên. Sử dụng mã <span className="font-bold text-white">WELCOME20</span>
              </p>
              <Link to="/menu" className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-lg shadow-xl">
                Bắt đầu đặt hàng <HiOutlineArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
