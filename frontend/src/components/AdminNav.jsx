import { Link, useLocation } from 'react-router-dom';
import { HiOutlineChartPie, HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineDatabase } from 'react-icons/hi';

export default function AdminNav() {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: '/admin', label: 'Tổng Quan', icon: <HiOutlineChartPie className="w-5 h-5" /> },
    { to: '/admin/products', label: 'Sản Phẩm', icon: <HiOutlineShoppingBag className="w-5 h-5" /> },
    { to: '/admin/orders', label: 'Đơn Hàng', icon: <HiOutlineClipboardList className="w-5 h-5" /> },
    { to: '/admin/ingredients', label: 'Nguyên Liệu', icon: <HiOutlineDatabase className="w-5 h-5" /> },
  ];

  return (
    <div className="flex gap-2 mb-8 overflow-x-auto border-b border-white/10">
      {links.map((link) => {
        const isActive = path === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 px-6 py-4 transition-all whitespace-nowrap border-b-2 font-semibold ${
              isActive 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
