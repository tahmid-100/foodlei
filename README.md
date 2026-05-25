# 🍔 Foodeli — Food Ordering Backend API

A production-ready **NestJS** backend for a food ordering platform, featuring real-time order tracking, background job processing, Redis caching, and comprehensive security.

🔗 **Live API**: https://foodlei-production.up.railway.app/api/v1/restaurants  
📚 **Swagger Docs**: https://foodlei-production.up.railway.app/api/docs  
💻 **GitHub**: https://github.com/tahmid-100/foodlei

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS + TypeScript |
| Database | PostgreSQL + TypeORM |
| Cache | Redis (24× faster response) |
| Queue | BullMQ + Bull Board |
| Real-time | WebSockets (Socket.IO) |
| Auth | JWT + Refresh Token + OAuth2 |
| Docs | Swagger / OpenAPI |
| Deploy | Railway + Docker + GitHub Actions |

---

## Key Features

- **JWT Auth** — Access + refresh token rotation with revocation on logout
- **OAuth2** — Google login via Passport.js
- **RBAC** — Admin / Restaurant Owner / Customer roles
- **State Machine** — Order lifecycle: Pending → Confirmed → Preparing → Delivered
- **Real-time** — WebSocket order tracking via Socket.IO rooms
- **Job Queue** — BullMQ with exponential backoff retry (email, SMS, notifications)
- **Redis Caching** — 49ms → 2ms response time on restaurant endpoints
- **Webhook Security** — HMAC-SHA256 signature verification for payment callbacks
- **Security** — Helmet, CORS, rate limiting, input validation, global exception filter
- **API Versioning** — `/api/v1/` and `/api/v2/` side by side

---

## Project Structure

```
src/
├── common/                  # Shared utilities
│   ├── constants/           # Cache & queue keys
│   ├── decorators/          # @CurrentUser, @Roles
│   ├── filters/             # GlobalExceptionFilter
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   └── interceptors/        # CacheDebugInterceptor
├── config/                  # Database config
└── modules/
    ├── auth/                # JWT, OAuth2, Refresh token
    ├── users/               # User management
    ├── restaurants/         # CRUD + Redis caching
    ├── menus/               # Menu management
    ├── orders/              # State machine + WebSocket gateway + BullMQ
    └── payments/            # Webhook handler + payment records
```

---

## API Endpoints

### Auth
```
POST   /api/v1/auth/register        Register new user
POST   /api/v1/auth/login           Login
POST   /api/v1/auth/refresh         Refresh access token
POST   /api/v1/auth/logout          Logout + revoke token
GET    /api/v1/auth/me              Current user profile
GET    /api/v1/auth/google          Google OAuth login
```

### Restaurants
```
GET    /api/v1/restaurants          List (paginated, filtered, cached)
POST   /api/v1/restaurants          Create (Admin/Owner only)
GET    /api/v1/restaurants/:id      Details (cached)
PATCH  /api/v1/restaurants/:id      Update (Admin/Owner only)
DELETE /api/v1/restaurants/:id      Soft delete (Admin only)
```

### Orders
```
POST   /api/v1/orders               Place new order
GET    /api/v1/orders/my            My orders
GET    /api/v1/orders/:id           Order details
PATCH  /api/v1/orders/:id/status    Update status (Admin/Owner only)
WS     /orders                      Real-time tracking (Socket.IO)
```

### Payments
```
POST   /api/v1/payments/webhook     Payment gateway webhook (HMAC verified)
GET    /api/v1/payments/order/:id   Order payment history
```

---

## Getting Started

### Prerequisites
- Node.js >= 20
- PostgreSQL
- Redis

### Installation

```bash
git clone https://github.com/tahmid-100/foodlei.git
cd foodlei
npm install
cp .env.example .env   # Fill in your values
npm run start:dev
```

### Docker (recommended)

```bash
docker compose up --build
```

Access points:
- API: http://localhost/api/v1
- Swagger: http://localhost/api/docs
- Bull Board: http://localhost/queues

### Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=foodeli_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Security
WEBHOOK_SECRET=your_webhook_secret
ALLOWED_ORIGINS=http://localhost:3001
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

---

## CI/CD

Every push to `main` triggers GitHub Actions:
1. Install dependencies
2. TypeScript build check
3. Auto-deploy to Railway on success

---

## Security Highlights

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt (cost factor 12) |
| Token storage | Refresh token hashed in DB |
| Token revocation | Logout clears DB hash |
| HTTP headers | Helmet |
| Rate limiting | @nestjs/throttler |
| Webhook auth | HMAC-SHA256 signature |
| Input validation | class-validator + whitelist |
| Error exposure | Hidden in production |

---

## Order State Machine

```
PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
    ↘         ↘           ↘
           CANCELLED (from any non-terminal state)
```

Invalid transitions are rejected with a descriptive error.

---

## Author

**KH Tahmid Alam**  
[github.com/tahmid-100](https://github.com/tahmid-100) · [linkedin.com/in/tahmid-alam-093b21315](https://linkedin.com/in/tahmid-alam-093b21315)