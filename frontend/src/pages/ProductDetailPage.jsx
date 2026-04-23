/**
 * Product Detail Page
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlinePlus, HiOutlineMinus, HiOutlineStar, HiOutlineArrowLeft } from 'react-icons/hi';
import { productAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import { PageLoader } from '../components/LoadingSpinner';
import { formatPrice } from '../utils/formatPrice';
import ReviewSection from '../components/ReviewSection';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart(id));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productAPI.getById(id);
        setProduct(data.data.product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="pt-24 pb-16 text-center">
      <span className="text-6xl block mb-4">😕</span>
      <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
      <Link to="/menu" className="btn-primary mt-4">Quay lại thực đơn</Link>
    </div>
  );

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <Link to="/menu" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-8">
          <HiOutlineArrowLeft className="w-5 h-5" /> Quay lại thực đơn
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-3xl aspect-square"
          >
            <img
              src={product.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 badge badge-primary text-sm">⭐ Nổi bật</span>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {product.category && (
              <span className="text-sm text-[var(--color-primary)] font-semibold mb-2">
                {product.category.icon} {product.category.name}
              </span>
            )}

            <h1 className="text-4xl font-black mb-4">{product.name}</h1>

            {product.rating?.average > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <HiOutlineStar
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(product.rating.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {product.rating.average} ({product.rating.count} đánh giá)
                </span>
                <a href="#reviews" className="text-xs text-[var(--color-primary)] hover:underline ml-1">
                  Xem tất cả
                </a>
              </div>
            )}

            <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Nutrition */}
            {product.nutrition?.calories > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Calo', value: product.nutrition.calories },
                  { label: 'Chất đạm', value: product.nutrition.protein },
                  { label: 'Tinh bột', value: product.nutrition.carbs },
                  { label: 'Chất béo', value: product.nutrition.fat },
                ].map((n) => (
                  <div key={n.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-lg font-bold text-[var(--color-primary)]">{n.value}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{n.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-xs font-medium text-[var(--color-text-secondary)]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Price & Add to Cart */}
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black gradient-text">{formatPrice(product.price)}</span>
                <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>

              <div className="flex gap-4">
                {/* Quantity selector */}
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1 hover:text-[var(--color-primary)] transition-colors"
                  >
                    <HiOutlineMinus className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-1 hover:text-[var(--color-primary)] transition-colors"
                  >
                    <HiOutlinePlus className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => addItem(product, quantity)}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1 text-lg !py-4"
                  id="product-add-to-cart"
                >
                  <HiOutlineShoppingCart className="w-6 h-6" />
                  {isInCart ? 'Thêm nữa' : 'Thêm vào giỏ'}
                  <span className="text-sm opacity-70">({formatPrice(product.price * quantity)})</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Review Section ── */}
        <ReviewSection productId={id} />

      </div>
    </div>
  );
}
