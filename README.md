# 🍔 FastFood Pro - Website Bán Đồ Ăn Nhanh Nhà Phong Yến

Hệ thống đặt hàng đồ ăn nhanh hiện đại, sẵn sàng cho môi trường Production, được xây dựng bằng React 18 + Node.js (Express) + MongoDB + Redis.

## 🚀 Tính năng nổi bật

### 💎 Trải nghiệm người dùng
- **Auth**: JWT Access + Refresh Token (HttpOnly cookies), phân quyền Admin/User.
- **Sản phẩm**: Tìm kiếm full-text, lọc theo danh mục, giá cả và gắn thẻ sản phẩm.
- **Giỏ hàng & Đánh giá**: Quản lý giỏ hàng real-time, hệ thống review 5 sao kèm rating trung bình.
- **Real-time**: Thông báo trạng thái đơn hàng tức thì qua Socket.io.
- **UI/UX Premium**: Giao diện Glassmorphism hiện đại, hiệu ứng mượt mà với Framer Motion.

### 📊 Quản lý Tài chính & Kho (Mới)
- **Quản lý Nguyên Liệu**: Theo dõi kho tồn thực tế, đơn vị tính và giá vốn.
- **Giá Vốn Trung Bình (Weighted Average Cost)**: Tự động tính toán giá vốn khi nhập kho thêm để quản lý chi phí chính xác.
- **Quản lý Công Thức (Recipe)**: Thiết lập thành phần nguyên liệu cho từng món ăn.
- **Tồn Kho Động**: Tự động tính toán số lượng sản phẩm có thể bán dựa trên lượng nguyên liệu còn lại trong kho.
- **Báo Cáo Tài Chính**: Dashboard theo dõi Doanh thu, Chi phí giá vốn (COGS), Lợi nhuận gộp và Tỷ suất lợi nhuận (Margin) theo thời gian thực.
- **Dự báo Kho**: Cảnh báo khi nguyên liệu sắp hết dựa trên đơn hàng.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), Zustand, TailwindCSS v4, Framer Motion, Axios |
| **Backend** | Node.js + Express, JWT, Joi Validation, Socket.io |
| **Database** | MongoDB + Mongoose |
| **Cache** | Redis (ioredis) |
| **Queue** | BullMQ (Xử lý đơn hàng & Stock jobs) |
| **DevOps** | Docker, Nginx, Winston Logging |

---

## 🏃 Chạy dự án (Development)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env    # Chỉnh sửa MONGODB_URI & REDIS_URL nếu cần
npm run seed            # Khởi tạo dữ liệu cơ bản
node src/seeds/ingredient_seed.js # Khởi tạo nguyên liệu & công thức mẫu
npm run dev             # Chạy tại http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev             # Chạy tại http://localhost:5173
```

### 🔑 Tài khoản dùng thử (Demo)

| Vai trò | Email | Mật khẩu |
|------|-------|----------|
| **Admin** | `admin@fastfoodpro.com` | `admin123` |
| **User** | `john@example.com` | `password123` |

---

## 🔗 Danh sách API chính (Mở rộng)

### 📊 Dashboard & Tài chính
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/admin/dashboard` | Admin | Thống kê tổng quan đơn hàng/doanh thu |
| GET | `/api/dashboard/finance` | Admin | Báo cáo Doanh thu, COGS, Lợi nhuận |

### 🌿 Nguyên Liệu (Ingredients)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/ingredients` | Admin | Danh sách nguyên liệu & tồn kho |
| POST | `/api/ingredients/:id/import` | Admin | Nhập kho (Tự động tính lại Giá vốn trung bình) |
| POST/PUT | `/api/ingredients` | Admin | Tạo/Cập nhật nguyên liệu |

### 🛒 Giỏ hàng, Review & Orders (Existing)
... và các API chuẩn RESTful cho Product, Category và User khác.

---

## 📂 Kiến trúc Thư mục

```
fastfood-pro/
├── backend/src/
│   ├── controllers/    # Controller handling (Dashboard, Ingredient, Product...)
│   ├── services/       # Business Logic (CostService, ProductService, OrderService...)
│   ├── repositories/   # Data Access Layer
│   ├── models/         # Mongoose Schemas (Ingredient, IngredientImport, Product, Order...)
│   └── seeds/          # Scripts khởi tạo dữ liệu mẫu
├── frontend/src/
│   ├── pages/admin/    # Giao diện quản lý (IngredientsPage, ProductsPage, Dashboard...)
│   ├── components/     # UI Reusable components
│   └── services/       # Tầng gọi API (Axios instance)
```

## 🔐 Bảo mật
- ✅ Hashing mật khẩu với **Bcrypt**.
- ✅ Chống injection với **mongoSanitize** & **HPP**.
- ✅ Bảo mật Header với **Helmet**.
- ✅ Giới hạn lưu lượng (Rate Limiting).
- ✅ Validation dữ liệu đầu vào chặt chẽ với **Joi**.

---

## 📄 Thương hiệu & Đối tác
Hệ thống được phát triển và vận hành bởi **Phong Yến Shop**.
**Đối tác chiến lược:** DvaGroup

MIT License.
