# Pending Push - Backend API Engine

High-performance, industry-standard REST API powering the **Pending Push** publishing platform. Built with **Fastify**, **TypeScript**, **PostgreSQL**, and **Drizzle ORM**.

---

## 🏗️ Architecture

The backend follows a strict **4-tier layered architecture** adhering to the Dependency Inversion Principle:

```
src/
├── config/             # Typed environment variables (Zod + dotenv)
├── errors/             # Standardized HTTP error hierarchy (AppError)
├── types/              # Domain models, DTOs & pagination contracts
├── validators/         # Zod request validation schemas
├── middleware/         # Fastify preHandler hooks (auth, admin, validation, global error handler)
├── repositories/       # Data Access Layer
│   ├── interfaces/     # Abstract repository contracts (IUserRepository, IPostRepository, etc.)
│   └── drizzle/        # PostgreSQL implementations via Drizzle ORM
├── services/           # Pure Business Logic (Auth, Post, Contact, Admin)
├── controllers/        # Fastify HTTP request handlers
├── routes/             # Fastify route plugins (Dual-routing: legacy /api/* and modern /api/v1/*)
├── db/                 # Drizzle schemas, relations, client connection & migrator
├── app.ts              # Fastify application factory & Dependency Injection container
└── server.ts           # Runtime startup listener
```

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (ES2022 Modules)
* **Language:** TypeScript 5+ (Strict mode)
* **Framework:** [Fastify](https://fastify.dev/) (Radix-Tree router + high-speed serialization)
* **Database:** PostgreSQL (Neon Cloud)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Validation:** [Zod](https://zod.dev/)
* **Security:** JWT (`jsonwebtoken`) + `bcrypt` password hashing
* **Documentation:** Swagger / OpenAPI via `@fastify/swagger` and `@fastify/swagger-ui`

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
* `PORT`: Server port (default: `2024`)
* `HOST`: Server host (default: `127.0.0.1`)
* `CLIENT_URL`: Allowed CORS origin (default: `http://localhost:5173`)
* `DATABASE_URL`: PostgreSQL connection string (Neon / local)
* `JWT_SECRET_KEY`: Secret key for JWT signing

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Migrations

Generate and run migrations using Drizzle:

```bash
# Generate SQL from schemas
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio to inspect data visually
npm run db:studio
```

### 4. Running the Server

```bash
# Development (with hot-reload via tsx)
npm run dev

# Typecheck & Build
npm run build

# Production start
npm run start
```

---

## 📖 API Documentation

Once the server is running, interactive Swagger/OpenAPI documentation is available at:

* **Swagger UI:** `http://localhost:2024/documentation`
* **Health Check:** `http://localhost:2024/health`
