/**
 * Product Card Component
 * Displays product with image, price, and add-to-cart
 */
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineStar, HiOutlineShoppingCart } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';

export default function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart(product._id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card group"
    >
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.isFeatured && (
          <span className="absolute top-3 left-3 badge badge-primary">
            ⭐ Nổi bật
          </span>
        )}

        {product.rating?.average > 0 && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg">
            <HiOutlineStar className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] md:text-xs font-semibold text-white">{product.rating.average}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 md:p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-base md:text-lg mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-[var(--color-text-muted)] text-[10px] md:text-sm mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base md:text-2xl font-bold gradient-text whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 flex-shrink-0 ${
              isInCart
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                : 'bg-white/5 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/30'
            } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            id={`add-to-cart-${product._id}`}
          >
            {isInCart ? (
              <HiOutlineShoppingCart className="w-4 h-4 md:w-5 h-5" />
            ) : (
              <HiOutlinePlus className="w-4 h-4 md:w-5 h-5" />
            )}
          </button>
        </div>

        {product.stock === 0 && (
          <p className="text-xs text-[var(--color-danger)] mt-2 font-medium">Hết hàng</p>
        )}
      </div>
    </motion.div>
  );
}
