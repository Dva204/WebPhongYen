/**
 * Menu Page
 * All products with search, filter, and pagination
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/LoadingSpinner';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      setCategories(res.data.data.categories);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, page]);

  const fetchProducts = async (searchTerm = search) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort: sortBy };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;

      const { data } = await productAPI.getAll(params);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('-createdAt');
    setPriceRange({ min: '', max: '' });
    setPage(1);
    setSearchParams({});
    fetchProducts('');
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Mới nhất' },
    { value: 'price', label: 'Giá: Thấp → Cao' },
    { value: '-price', label: 'Giá: Cao → Thấp' },
    { value: '-rating.average', label: 'Đánh giá cao' },
    { value: 'name', label: 'Tên: A → Z' },
  ];

  const hasActiveFilters = search || selectedCategory || priceRange.min || priceRange.max;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title">Thực đơn <span className="gradient-text">Của Chúng Tôi</span></h1>
          <p className="section-subtitle !mb-0">Khám phá danh sách món ăn ngon miệng</p>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Tìm kiếm hamburger, pizza, gà..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-12 !pr-4"
              id="menu-search"
            />
          </form>

          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="input-field !w-auto min-w-[180px] cursor-pointer"
              id="menu-sort"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[var(--color-bg-secondary)]">
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost !px-4 ${showFilters ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : ''}`}
            >
              <HiOutlineAdjustments className="w-5 h-5" />
              <span className="hidden sm:inline">Bộ lọc</span>
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-ghost !px-4 text-[var(--color-danger)]">
                <HiOutlineX className="w-5 h-5" />
                <span className="hidden sm:inline">Xoá lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8 p-6 glass rounded-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Danh mục</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-[var(--color-primary)] text-white' : 'bg-white/5 hover:bg-white/10'
                      }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat._id ? 'bg-[var(--color-primary)] text-white' : 'bg-white/5 hover:bg-white/10'
                        }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Mức giá</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="input-field !py-2 text-sm"
                    min="0"
                  />
                  <span className="text-[var(--color-text-muted)]">—</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="input-field !py-2 text-sm"
                    min="0"
                  />
                  <button onClick={() => { setPage(1); fetchProducts(); }} className="btn-primary !py-2 !px-4 text-sm">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Quick Filter (always visible) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'bg-white/5 hover:bg-white/10'
              }`}
          >
            🍽️ Tất cả món
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat._id ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'bg-white/5 hover:bg-white/10'
                }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-[var(--color-text-muted)] mb-6">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button onClick={clearFilters} className="btn-primary">Xoá bộ lọc</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="btn-ghost !px-4 disabled:opacity-30"
                >
                  Trang trước
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${p === pagination.currentPage
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white/5 hover:bg-white/10'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn-ghost !px-4 disabled:opacity-30"
                >
                  Trang sau
                </button>
              </div>
            )}

            {pagination && (
              <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                Đang hiển thị {products.length} trong số {pagination.total} sản phẩm
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
