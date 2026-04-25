/**
 * Footer Component
 */
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[var(--color-bg-secondary)]">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🍔</span>
              <span className="text-xl font-bold gradient-text">Phong Yến Shop</span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-2">
              Thức ăn nhanh cao cấp giao tận cửa. Nguyên liệu tươi ngon, hương vị đậm đà, khó quên.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] opacity-80">
              Đối tác: <span className="text-[var(--color-text-primary)]">DvaGroup</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-text-primary)]">Liên kết</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Trang chủ</Link>
              <Link to="/menu" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Thực đơn</Link>
              <Link to="/cart" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Giỏ hàng</Link>
              <Link to="/orders" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Đơn hàng</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-text-primary)]">Liên hệ</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <HiOutlinePhone className="w-4 h-4 text-[var(--color-primary)]" />
                1111111111
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <HiOutlineMail className="w-4 h-4 text-[var(--color-primary)]" />
                phongyenshop@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <HiOutlineLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />
                123 Nam Định
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-text-primary)]">Giờ mở cửa</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
              <p>Thứ 2 - Thứ 6: 10:00 Sáng - 11:00 Tối</p>
              <p>Thứ 7: 11:00 Sáng - 12:00 Đêm</p>
              <p>Chủ nhật: 11:00 Sáng - 10:00 Tối</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} DvaGroup. Bản quyền thuộc về DvaGroup
        </div>
      </div>
    </footer>
  );
}
