# Foodeli Backend API

A modern **NestJS-based Food Ordering System backend** with JWT authentication, Google OAuth, and comprehensive API management.

## 📋 Project Overview

Foodeli is a production-ready backend for a food delivery/ordering platform. It provides REST APIs for user management, restaurant operations, order processing, menu management, and payments integration.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: TypeScript
- **Authentication**: JWT + Google OAuth
- **Database**: TypeORM + PostgreSQL
- **Caching**: Redis with cache-manager
- **Job Queue**: BullMQ with Bull Board
- **Real-time**: Socket.io for WebSocket support
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Signature verification
- **Validation**: Class Validator & Transformer
- **Rate Limiting**: Throttler
- **Error Handling**: Global Exception Filter
- **Monitoring**: Cache Debug Interceptor

## 📁 Project Structure

```
src/
├── app.controller.ts          # Main controller
├── app.module.ts              # Root module with Redis, BullMQ, Cache config
├── app.service.ts             # Root service
├── main.ts                     # Bootstrap file with middleware setup
├── common/                     # Shared utilities
│   ├── constants/             # Cache & Queue constants
│   ├── decorators/            # Custom decorators (@CurrentUser, @Roles)
│   ├── filters/               # Exception filters (GlobalExceptionFilter)
│   ├── guards/                # Authentication guards (JWT, Google)
│   ├── interceptors/          # HTTP interceptors (CacheDebugInterceptor)
│   ├── interfaces/            # TypeScript interfaces (PaginatedResponse)
│   ├── pipes/                 # Validation pipes (Sanitize)
│   └── dto/                   # Common DTOs (Pagination)
├── config/                    # Configuration files
│   └── database.config.ts     # Database configuration
├── database/                  # Database management
│   └── migrations/            # Database migrations
└── modules/                   # Feature modules
    ├── auth/                  # Authentication (JWT + Google OAuth)
    ├── users/                 # User management
    ├── restaurants/           # Restaurant CRUD + caching
    ├── menus/                 # Menu management
    ├── orders/                # Order processing with state machine
    │   ├── gateways/          # WebSocket gateways (Socket.io)
    │   └── processors/        # BullMQ job processors
    └── payments/              # Payment processing + webhook handlers
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL (or configured database)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=foodeli_db

# Redis (Caching & Job Queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=your_refresh_jwt_secret
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Throttling
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Payment Webhooks
WEBHOOK_SECRET=your_webhook_secret_key
```

## 💻 Running the Application

### Development Mode

```bash
npm run start:dev
```

Server will run on `http://localhost:3000`

**Access Points:**
- 🎨 **Swagger UI**: http://localhost:3000/api/docs
- 📊 **BullMQ Board**: http://localhost:3000/admin/queues (job queue management)
- 🔌 **WebSocket**: ws://localhost:3000/orders (real-time order updates)

### Production Mode

```bash
NODE_ENV=production npm run start
```

### Build for Production

```bash
npm run build
```

## 📚 API Documentation

Once the server is running, access the **Swagger UI** at:
```
http://localhost:3000/api/docs
```

### Admin Interfaces

- **BullMQ Dashboard**: http://localhost:3000/admin/queues
  - Monitor job queues
  - View failed jobs
  - Retry failed orders

### API Endpoints Structure

All endpoints follow this pattern:
```
/api/v1/{resource}/{operation}
```

### Key Endpoints

- **Auth** - User authentication & authorization
  - `POST /api/v1/auth/register` - Register new user
  - `POST /api/v1/auth/login` - Login with credentials
  - `GET /api/v1/auth/google` - Google OAuth login
  - `POST /api/v1/auth/refresh` - Refresh JWT token

- **Restaurants** - Restaurant management with caching
  - `GET /api/v1/restaurants` - List restaurants (paginated, cached)
  - `POST /api/v1/restaurants` - Create restaurant
  - `GET /api/v1/restaurants/:id` - Get restaurant details (cached)
  - `PATCH /api/v1/restaurants/:id` - Update restaurant
  - `DELETE /api/v1/restaurants/:id` - Soft delete restaurant

- **Users** - User profile management
  - `GET /api/v1/users/profile` - Get current user profile
  - `PATCH /api/v1/users/profile` - Update profile

- **Orders** - Order processing with real-time updates
  - `GET /api/v1/orders` - List user orders
  - `POST /api/v1/orders` - Create new order
  - `GET /api/v1/orders/:id` - Get order details
  - `PATCH /api/v1/orders/:id/status` - Update order status
  - 🔌 **WebSocket**: Subscribe to order updates via Socket.io

- **Payments** - Payment processing & webhooks
  - `POST /api/v1/payments/webhook` - Payment gateway webhook
  - `GET /api/v1/payments/order/:orderId` - Get order payment history


## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Third-party authentication
- **Role-Based Access Control (RBAC)**: Custom `@Roles()` decorator
- **Global Exception Filter**: Centralized error handling
  - Production mode: Hides sensitive error details
  - Development mode: Shows full error information
- **Helmet**: HTTP headers security
- **CORS**: Cross-Origin Resource Sharing protection
- **Rate Limiting**: Throttler for API protection
- **Input Validation**: DTO-based validation with transformers

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Key Features

✅ **JWT & OAuth Integration** - Secure authentication methods
✅ **Role-Based Authorization** - Fine-grained access control (@Roles decorator)
✅ **Redis Caching** - Performance optimization with smart cache invalidation
✅ **BullMQ Job Queue** - Async order processing & background tasks
✅ **WebSocket Support** - Real-time order updates via Socket.io
✅ **Payment Webhooks** - Secure payment gateway integration with signature verification
✅ **Order State Machine** - Complex order workflow management
✅ **Advanced Pagination** - Filterable, sortable paginated responses
✅ **Soft Deletes** - Data preservation with isActive flag
✅ **Global Error Handling** - Centralized exception management
✅ **Performance Monitoring** - Cache debug interceptor
✅ **Database Migrations** - Version control for database schema
✅ **API Documentation** - Auto-generated Swagger docs
✅ **Input Validation** - Request DTO validation
✅ **Security** - Helmet headers, CORS, signature verification
✅ **Rate Limiting** - Throttler for API protection

## � Infrastructure & Performance

### Redis Caching
- **Restaurant Caching**: Paginated restaurant lists cached per page/limit combination
- **Smart Invalidation**: Automatic cache invalidation on CREATE/UPDATE/DELETE operations
- **Monitoring**: Cache hit/miss logging for performance tracking

### BullMQ Job Queue
- **Order Processing**: Background order fulfillment jobs
- **Job Monitoring**: Access queue status via Bull Board dashboard
- **Retry Logic**: Failed jobs automatically retry with exponential backoff
- **Job Processors**: Dedicated processors for order, payment, and notification events

### WebSocket Real-time Updates
- **Order Gateway**: Socket.io gateway for real-time order status updates
- **Channel Rooms**: Organized by order ID for targeted broadcasts
- **Event Types**: Status changes, notifications, and system events

## �🐛 Error Handling

The application uses a **GlobalExceptionFilter** for centralized error handling:

**Development Response** (with full details):
```json
{
  "statusCode": 500,
  "timestamp": "2026-05-03T12:00:00.000Z",
  "path": "/api/v1/endpoint",
  "message": { "error": "Full error details" }
}
```

**Production Response** (sanitized):
```json
{
  "statusCode": 500,
  "timestamp": "2026-05-03T12:00:00.000Z",
  "path": "/api/v1/endpoint",
  "message": "Something went wrong"
}
```

## 📦 Dependencies

### Core Framework
- `@nestjs/common` - NestJS core
- `@nestjs/core` - NestJS runtime
- `@nestjs/config` - Environment configuration

### Authentication
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Passport integration
- `passport-google-oauth20` - Google OAuth strategy

### Database & ORM
- `typeorm` - Object-relational mapping
- `@nestjs/typeorm` - NestJS TypeORM integration
- `pg` - PostgreSQL client

### Caching & Job Queues
- `@nestjs/cache-manager` - Caching provider
- `cache-manager-redis-yet` - Redis cache store
- `@nestjs/bullmq` - BullMQ integration
- `@bull-board/nestjs` - Bull Board UI
- `bullmq` - Job queue library

### Real-time Communication
- `@nestjs/websockets` - WebSocket support
- `@nestjs/platform-socket.io` - Socket.io adapter
- `socket.io` - Real-time communication

### Security & Validation
- `helmet` - HTTP headers security
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `@nestjs/throttler` - Rate limiting

### API Documentation
- `@nestjs/swagger` - API documentation
- `swagger-ui-express` - Swagger UI

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues or questions, contact the development team.

---

**Last Updated**: May 18, 2026
