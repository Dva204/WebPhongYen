import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match');
    }
    setLoading(true);
    const success = await register({ name: form.name, email: form.email, password: form.password });
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-3">🍔</span>
            <h1 className="text-3xl font-black">Tạo Tài Khoản</h1>
            <p className="text-[var(--color-text-muted)] mt-2">Tham gia cùng chúng tôi để thưởng thức đồ ăn tuyệt vời!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Họ và tên</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input name="name" value={form.name} onChange={handleChange} className="input-field !pl-12" placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field !pl-12" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Mật khẩu</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field !pl-12 !pr-12" placeholder="Ít nhất 6 ký tự" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Xác nhận mật khẩu</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field !pl-12" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-lg">
              {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">Đăng Nhập</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
