# 🍔 FastFood Pro - Website Bán Đồ Ăn Nhanh Nhà Phong Yến

Hệ thống đặt hàng đồ ăn nhanh hiện đại, sẵn sàng cho môi trường Production, được xây dựng bằng React 18 + Node.js (Express) + MongoDB + Redis.

## 🚀 Tính năng nổi bật

- **Auth**: JWT Access + Refresh Token (HttpOnly cookies), phân quyền Admin/User.
- **Sản phẩm**: Tìm kiếm full-text, lọc theo danh mục, giá cả và gắn thẻ sản phẩm.
- **Giỏ hàng**: Quản lý giỏ hàng real-time, lưu trữ đồng bộ trong Database.
- **Đánh giá (Review)**: Hệ thống đánh giá sao và bình luận, tự động cập nhật Rating trung bình cho sản phẩm.
- **Đặt hàng**: Quy trình đặt hàng chuyên nghiệp, xử lý đơn hàng bất đồng bộ với BullMQ.
- **Real-time**: Thông báo trạng thái đơn hàng tức thì qua Socket.io.
- **UI/UX**: Giao diện Premium (Glassmorphism), thiết kế responsive, hiệu ứng mượt mà với Framer Motion.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), Zustand, TailwindCSS v4, Framer Motion, Axios |
| **Backend** | Node.js + Express, JWT, Joi Validation, Socket.io |
| **Database** | MongoDB + Mongoose |
| **Cache** | Redis (ioredis) |
| **Queue** | BullMQ |
| **DevOps** | Docker, Nginx, Winston Logging |

---

## 🏃 Chạy dự án (Development)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env    # Chỉnh sửa MONGODB_URI & REDIS_URL nếu cần
npm run seed            # Khởi tạo dữ liệu mẫu
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

## 🔗 Danh sách API chính

### 🛒 Giỏ hàng (Cart) - *Yêu cầu đăng nhập*
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart` | Lấy giỏ hàng của người dùng |
| POST | `/api/cart` | Thêm sản phẩm vào giỏ hàng |
| PUT | `/api/cart/:productId` | Cập nhật số lượng sản phẩm |
| DELETE | `/api/cart/:productId` | Xoá sản phẩm khỏi giỏ hàng |
| DELETE | `/api/cart` | Làm trống giỏ hàng |

### ⭐ Đánh giá (Reviews)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/products/:id/reviews` | No | Xem danh sách đánh giá của sản phẩm |
| POST | `/api/reviews` | Yes | Gửi đánh giá mới (1-5 sao) |
| PUT | `/api/reviews/:id` | Yes | Chỉnh sửa đánh giá cá nhân |
| DELETE | `/api/reviews/:id` | Yes | Xoá đánh giá cá nhân |

### 📦 Đơn hàng (Orders)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/orders` | User | Đặt hàng từ giỏ hàng |
| GET | `/api/orders` | User | Lịch sử đơn hàng cá nhân |
| GET | `/api/orders/admin/all` | Admin | Quản lý toàn bộ đơn hàng (Admin) |

---

## 📂 Kiến trúc Thư mục

```
fastfood-pro/
├── backend/src/
│   ├── controllers/    # Xử lý HTTP Request (CartController, ReviewController...)
│   ├── services/       # Business Logic & Recalculate Ratings
│   ├── repositories/   # Truy vấn Database (ReviewRepository...)
│   ├── models/         # Mongoose Schemas (Cart, Review, User...)
│   ├── routes/         # Khai báo API endpoints
│   ├── jobs/           # BullMQ Workers (Xử lý đơn hàng ngầm)
│   └── sockets/        # Real-time event handlers
├── frontend/src/
│   ├── components/     # UI Reusable (StarRating, ReviewSection...)
│   ├── store/          # Quản lý State (AuthStore, ShopStore...)
│   └── services/       # Tầng gọi API (api.js)
```

## 🔐 Bảo mật
- ✅ Hashing mật khẩu với **Bcrypt**.
- ✅ Chống injection với **mongoSanitize** & **HPP**.
- ✅ Bảo mật Header với **Helmet**.
- ✅ Giới hạn lưu lượng (Rate Limiting).
- ✅ Validation dữ liệu đầu vào chặt chẽ với **Joi**.

---

## 📄 License
Dự án được bảo trì bởi **Phong Yến Shop**. MIT License.
