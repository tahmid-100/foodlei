# Foodeli Backend API

A modern **NestJS-based Food Ordering System backend** with JWT authentication, Google OAuth, and comprehensive API management.

## 📋 Project Overview

Foodeli is a production-ready backend for a food delivery/ordering platform. It provides REST APIs for user management, restaurant operations, order processing, menu management, and payments integration.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: TypeScript
- **Authentication**: JWT + Google OAuth
- **Database**: TypeORM (configured)
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS
- **Validation**: Class Validator & Transformer
- **Rate Limiting**: Throttler
- **Error Handling**: Global Exception Filter

## 📁 Project Structure

```
src/
├── app.controller.ts          # Main controller
├── app.module.ts              # Root module
├── app.service.ts             # Root service
├── main.ts                     # Bootstrap file
├── common/                     # Shared utilities
│   ├── decorators/            # Custom decorators (@CurrentUser, @Roles)
│   ├── filters/               # Exception filters (GlobalExceptionFilter)
│   ├── guards/                # Authentication guards (JWT, Google)
│   ├── interceptors/          # HTTP interceptors
│   ├── pipes/                 # Validation pipes (Sanitize)
│   └── interfaces/            # TypeScript interfaces
├── config/                    # Configuration files
│   └── database.config.ts     # Database configuration
├── database/                  # Database management
│   └── migrations/            # Database migrations
└── modules/                   # Feature modules
    ├── auth/                  # Authentication (JWT + Google)
    ├── users/                 # User management
    ├── restaurants/           # Restaurant management
    ├── menus/                 # Menu management
    ├── orders/                # Order processing
    └── payments/              # Payment processing
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

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Payment Gateway (if applicable)
PAYMENT_API_KEY=your_payment_api_key
```

## 💻 Running the Application

### Development Mode

```bash
npm run start:dev
```

Server will run on `http://localhost:3000`

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

### API Endpoints Structure

All endpoints follow this pattern:
```
/api/v1/{resource}/{operation}
```

### Key Endpoints

- **Auth**
  - `POST /api/v1/auth/register` - Register new user
  - `POST /api/v1/auth/login` - Login
  - `GET /api/v1/auth/google` - Google OAuth login
  - `POST /api/v1/auth/refresh` - Refresh JWT token

- **Restaurants**
  - `GET /api/v1/restaurants` - List all restaurants
  - `POST /api/v1/restaurants` - Create restaurant (Admin)
  - `GET /api/v1/restaurants/:id` - Get restaurant details
  - `PATCH /api/v1/restaurants/:id` - Update restaurant
  - `DELETE /api/v1/restaurants/:id` - Delete restaurant

- **Users**
  - `GET /api/v1/users/profile` - Get current user profile
  - `PATCH /api/v1/users/profile` - Update profile

- **Orders**
  - `GET /api/v1/orders` - List user orders
  - `POST /api/v1/orders` - Create new order
  - `GET /api/v1/orders/:id` - Order details

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
✅ **Role-Based Authorization** - Fine-grained access control
✅ **Global Error Handling** - Centralized exception management
✅ **Database Migrations** - Version control for database schema
✅ **API Documentation** - Auto-generated Swagger docs
✅ **Input Validation** - Request DTO validation
✅ **CORS & Security** - Production-ready security headers
✅ **Rate Limiting** - Protection against abuse

## 🐛 Error Handling

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

- `@nestjs/common` - NestJS core
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Passport integration
- `passport-google-oauth20` - Google OAuth strategy
- `typeorm` - ORM
- `class-validator` - DTO validation
- `helmet` - Security headers
- `@nestjs/swagger` - API documentation

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

**Last Updated**: May 3, 2026
