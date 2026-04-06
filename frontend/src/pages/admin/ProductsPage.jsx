import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import { productAPI, categoryAPI } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import AdminNav from '../../components/AdminNav';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: 100, isFeatured: false, image: null });

  useEffect(() => {
    Promise.all([
      productAPI.getAll({ limit: 100 }),
      categoryAPI.getAll(),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data.categories);
    }).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', stock: 100, isFeatured: false, image: null });
    setEditProduct(null);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name, description: product.description, price: product.price,
      category: product.category?._id || product.category, stock: product.stock, isFeatured: product.isFeatured, image: null
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'image' && !form[key]) return;
      formData.append(key, form[key]);
    });

    try {
      if (editProduct) {
        await productAPI.update(editProduct._id, formData);
        toast.success('Product updated');
      } else {
        await productAPI.create(formData);
        toast.success('Product created');
      }
      setShowModal(false);
      resetForm();
      const { data } = await productAPI.getAll({ limit: 100 });
      setProducts(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Quản Lý <span className="gradient-text">Sản Phẩm</span></h1>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
            <HiOutlinePlus className="w-5 h-5" /> Thêm Sản Phẩm
          </button>
        </div>

        <AdminNav />

        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4">Sản Phẩm</th>
                  <th className="text-left py-4 px-4">Danh Mục</th>
                  <th className="text-right py-4 px-4">Giá</th>
                  <th className="text-right py-4 px-4">Tồn Kho</th>
                  <th className="text-center py-4 px-4">Nổi Bật</th>
                  <th className="text-right py-4 px-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">{p.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-right font-bold">{formatPrice(p.price)}</td>
                    <td className="py-3 px-4 text-right">{p.stock}</td>
                    <td className="py-3 px-4 text-center">{p.isFeatured ? '⭐' : '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-danger)]"><HiOutlineTrash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-strong rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-6">{editProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Tên sản phẩm" required />
                <textarea name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field min-h-[80px]" placeholder="Mô tả (ít nhất 10 ký tự)" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" placeholder="Giá tiền" required />
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" placeholder="Tồn kho" />
                </div>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" required>
                  <option value="">Chọn Danh Mục</option>
                  {categories.map(c => <option key={c._id} value={c._id} className="bg-[var(--color-bg-secondary)]">{c.icon} {c.name}</option>)}
                </select>
                <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary)]/80" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Sản phẩm nổi bật</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Huỷ</button>
                  <button type="submit" className="btn-primary flex-1">{editProduct ? 'Cập Nhật' : 'Tạo Mới'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
