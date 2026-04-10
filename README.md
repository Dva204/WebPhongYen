# 🍔 WebSite bán đồ ăn nhanh nhà Phong Yến

Production-ready fast food ordering system with React + Node.js + MongoDB + Redis.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Zustand, TailwindCSS v4, React Router v6, Axios, Framer Motion |
| Backend | Node.js + Express, JWT Auth, Joi Validation, Socket.io |
| Database | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| Queue | BullMQ |
| Storage | Cloudinary (optional, local fallback) |
| DevOps | Docker, docker-compose, Nginx |

## Architecture

```
Controller → Service → Repository → Model (MongoDB)
                ↓
           Redis Cache
                ↓
           BullMQ Jobs → Email / WebSocket
```

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional - graceful fallback)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # Edit .env if needed
npm run seed            # Seed sample data
npm run dev             # Start on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # Start on port 5173
```

### 3. Open Browser

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin123 |
| User | phong@gmail.com | password123 |

## Docker Deployment

```bash
# Start all services
docker-compose up -d --build

# Seed database
docker-compose exec backend node src/seeds/seed.js

# Access at http://localhost
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/logout | Yes | Logout |
| POST | /api/auth/refresh | No | Refresh token |
| GET | /api/auth/me | Yes | Get profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | No | List (paginated, filterable) |
| GET | /api/products/featured | No | Featured products |
| GET | /api/products/:id | No | Product detail |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | User | Create order |
| GET | /api/orders | User | My orders |
| GET | /api/orders/:id | User | Order detail |
| GET | /api/orders/admin/all | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update status |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/categories | No | List categories |
| POST | /api/categories | Admin | Create category |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/dashboard | Admin | Dashboard stats |

## API Examples (cURL)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fastfoodpro.com","password":"admin123"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products?page=1&limit=12&sort=-createdAt

# With category filter
curl "http://localhost:5000/api/products?category=CATEGORY_ID"

# With search
curl "http://localhost:5000/api/products?search=burger"

# With price range
curl "http://localhost:5000/api/products?minPrice=5&maxPrice=15"
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [{"productId":"PRODUCT_ID","quantity":2}],
    "shippingAddress": {"street":"123 Main St","city":"NYC"},
    "paymentMethod": "cash"
  }'
```

## Folder Structure

```
fastfood-pro/
├── backend/
│   └── src/
│       ├── configs/        # DB, Redis, Cloudinary, env
│       ├── controllers/    # HTTP request handlers
│       ├── services/       # Business logic
│       ├── repositories/   # Data access layer
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routes
│       ├── middlewares/     # Auth, error, rate-limit
│       ├── validators/     # Joi schemas
│       ├── utils/          # Helpers
│       ├── jobs/           # BullMQ workers
│       ├── sockets/        # Socket.io handlers
│       ├── seeds/          # Sample data
│       ├── app.js          # Express setup
│       └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI
│       ├── pages/          # Page components
│       │   └── admin/      # Admin pages
│       ├── store/          # Zustand stores
│       ├── services/       # API layer
│       └── App.jsx         # Main app with routing
├── nginx/                  # Nginx reverse proxy
├── docker-compose.yml
└── README.md
```

## Features

### Security
- ✅ JWT Access + Refresh Token (HttpOnly cookies)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Rate limiting (per-route)
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ HPP (HTTP parameter pollution prevention)
- ✅ Input validation (Joi)

### Performance
- ✅ Redis caching (products, categories)
- ✅ Cache invalidation on mutations
- ✅ MongoDB indexes (text search, compound)
- ✅ Lazy loading (React code splitting)
- ✅ Gzip compression
- ✅ Static asset caching (Nginx)

### Bonus
- ✅ WebSocket real-time order updates (Socket.io)
- ✅ Email notifications (Nodemailer + Ethereal dev)
- ✅ BullMQ async order processing
- ✅ Structured logging (Winston + Morgan)
- ✅ Standardized API responses

## License

MIT
