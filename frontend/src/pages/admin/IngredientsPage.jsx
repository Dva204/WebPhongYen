import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineArrowDown } from 'react-icons/hi';
import { ingredientAPI } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import AdminNav from '../../components/AdminNav';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminIngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [form, setForm] = useState({ name: '', unit: '' });
  const [importForm, setImportForm] = useState({ quantity: '', unitPrice: '', note: '' });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const { data } = await ingredientAPI.getAll();
      setIngredients(data.data);
    } catch (err) {
      toast.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', unit: '' });
    setSelectedIngredient(null);
  };

  const resetImportForm = () => {
    setImportForm({ quantity: '', unitPrice: '', note: '' });
    setSelectedIngredient(null);
  };

  const handleEdit = (ingredient) => {
    setSelectedIngredient(ingredient);
    setForm({ name: ingredient.name, unit: ingredient.unit });
    setShowModal(true);
  };

  const handleImport = (ingredient) => {
    setSelectedIngredient(ingredient);
    setShowImportModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedIngredient) {
        await ingredientAPI.update(selectedIngredient._id, form);
        toast.success('Đã cập nhật nguyên liệu');
      } else {
        await ingredientAPI.create(form);
        toast.success('Đã thêm nguyên liệu');
      }
      setShowModal(false);
      resetForm();
      fetchIngredients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      await ingredientAPI.recordImport(selectedIngredient._id, importForm);
      toast.success('Đã nhập kho thành công');
      setShowImportModal(false);
      resetImportForm();
      fetchIngredients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Nhập kho thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xoá nguyên liệu này?')) return;
    try {
      await ingredientAPI.delete(id);
      toast.success('Đã xoá nguyên liệu');
      fetchIngredients();
    } catch (err) {
      toast.error('Xoá thất bại');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Quản Lý <span className="gradient-text">Nguyên Liệu</span></h1>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="btn-primary"
          >
            <HiOutlinePlus className="w-5 h-5" /> Thêm Nguyên Liệu
          </button>
        </div>

        <AdminNav />

        <div className="glass-strong rounded-2xl overflow-hidden shadow-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 font-bold uppercase tracking-wider">Tên Nguyên Liệu</th>
                  <th className="text-center py-4 px-4 font-bold uppercase tracking-wider">Đơn Vị</th>
                  <th className="text-right py-4 px-4 font-bold uppercase tracking-wider">Tồn Kho</th>
                  <th className="text-right py-4 px-4 font-bold uppercase tracking-wider">Giá Trung Bình</th>
                  <th className="text-right py-4 px-6 font-bold uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-[var(--color-text-muted)] italic">
                      Chưa có nguyên liệu nào. Hãy thêm mới!
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => (
                    <tr key={ing._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-white">{ing.name}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded bg-white/10 text-xs">{ing.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-mono ${ing.stock < 10 ? 'text-[var(--color-danger)] font-bold' : ''}`}>
                          {ing.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-[var(--color-primary)] font-bold">
                        {formatPrice(ing.avgCost || 0)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleImport(ing)} 
                            title="Nhập kho"
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            <HiOutlineArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(ing)} 
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ing._id)} 
                            className="p-2 rounded-lg bg-red-500/10 text-[var(--color-danger)] hover:bg-red-500/20"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl" 
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  {selectedIngredient ? 'Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Tên nguyên liệu</label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                      className="input-field" 
                      placeholder="Ví dụ: Thịt bò, Bột mì..." 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Đơn vị tính</label>
                    <input 
                      value={form.unit} 
                      onChange={e => setForm({...form, unit: e.target.value})} 
                      className="input-field" 
                      placeholder="Ví dụ: kg, gram, lít, cái..." 
                      required 
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Huỷ</button>
                    <button type="submit" className="btn-primary flex-1">
                      {selectedIngredient ? 'Cập Nhật' : 'Tạo Mới'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Import Stock Modal */}
        <AnimatePresence>
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowImportModal(false)}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-strong rounded-2xl p-6 w-full max-w-md border border-green-500/20 shadow-2xl" 
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-500">
                  <HiOutlineArrowDown /> Nhập Kho
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">
                  Nhập thêm nguyên liệu: <span className="text-white font-bold">{selectedIngredient?.name}</span>
                </p>
                <form onSubmit={handleImportSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Số lượng ({selectedIngredient?.unit})</label>
                      <input 
                        type="number" 
                        step="0.001"
                        value={importForm.quantity} 
                        onChange={e => setImportForm({...importForm, quantity: e.target.value})} 
                        className="input-field" 
                        placeholder="0.00" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Đơn giá nhập</label>
                      <input 
                        type="number" 
                        value={importForm.unitPrice} 
                        onChange={e => setImportForm({...importForm, unitPrice: e.target.value})} 
                        className="input-field" 
                        placeholder="VND" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Ghi chú</label>
                    <textarea 
                      value={importForm.note} 
                      onChange={e => setImportForm({...importForm, note: e.target.value})} 
                      className="input-field min-h-[80px]" 
                      placeholder="Nhà cung cấp, hạn sử dụng..."
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[var(--color-text-muted)]">
                    <p>💡 Hệ thống sẽ tự động cập nhật Giá vốn trung bình (Weighted Average Cost) và tồn kho.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowImportModal(false)} className="btn-ghost flex-1">Huỷ</button>
                    <button type="submit" className="btn-primary flex-1 bg-green-600 hover:bg-green-700">Xác Nhận Nhập</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
