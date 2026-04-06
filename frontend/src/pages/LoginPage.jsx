import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login({ email, password });
    setLoading(false);
    if (success) navigate(from, { replace: true });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-3">🍔</span>
            <h1 className="text-3xl font-black">Chào Mừng Trở Lại</h1>
            <p className="text-[var(--color-text-muted)] mt-2">Đăng nhập để đặt đồ ăn ngon</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field !pl-12" placeholder="you@example.com" required id="login-email" />
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Mật khẩu</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field !pl-12 !pr-12" placeholder="••••••••" required id="login-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-lg" id="login-submit">
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-[var(--color-primary)] font-semibold hover:underline">Đăng Ký</Link>
          </p>
          <div className="mt-4 p-3 rounded-xl bg-white/5 text-xs text-[var(--color-text-muted)]">
            <p className="font-semibold mb-1">Tài khoản Demo:</p>
            <p>Admin: admin@gmail.com / admin123</p>
            <p>User: phong@gmail.com / password123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
