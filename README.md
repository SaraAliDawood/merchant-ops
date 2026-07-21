# MerchantOps — Order Operations Platform

A full-stack merchant **order-operations** platform: authenticate, manage products,
create and track orders through a status workflow, and monitor revenue on a live
dashboard. Built to demonstrate **production-grade full-stack engineering** —
React + Next.js on the front, Node.js route handlers + Prisma on the back, with
auth, role-based access, tests, Docker and CI.

> Runs with **zero external services** — SQLite + a seeded database — so you can
> clone and be looking at 4,000 live orders in under a minute. Swap one line for
> Postgres in production.

```bash
git clone https://github.com/SaraAliDawood/merchant-ops.git
cd merchant-ops
cp .env.example .env
npm install
npm run db:setup          # migrate + seed (40 products · 300 customers · 4,000 orders)
npm run dev               # http://localhost:3000
```

**Demo login:** `admin@merchantops.dev` / `password123` (or register — the first account becomes ADMIN).

---

## Features

- 🔐 **Authentication & RBAC** — register / login / logout with **JWT sessions in httpOnly cookies**, bcrypt-hashed passwords, and `ADMIN` / `STAFF` roles enforced on the API.
- 📦 **Products** — listing + admin-only creation, prices stored in **minor units** (integer fils/cents) to eliminate floating-point money bugs.
- 🧾 **Orders** — create from customer + line items inside a **transaction**, with a per-year human reference (`ORD-2026-000042`), price snapshots, and a **status state machine** (`PENDING → PAID → FULFILLED`, cancellable) that rejects illegal transitions.
- 🔎 **Orders at scale** — server-side **pagination + debounced search + status filter** over thousands of rows, backed by indexed columns.
- 📊 **Dashboard** — revenue / order-count / average-order KPIs and a 7-day revenue chart (Recharts).
- ✅ **Tested & typed** — full TypeScript, Zod-validated inputs, and a Vitest unit suite for the money, order-logic and pagination modules.

## Architecture

```
src/
  app/
    (app)/            # authenticated shell — dashboard, orders, products
    api/              # Node.js route handlers = the REST backend
      auth/ products/ orders/ dashboard/
    login/            # public auth page
    middleware.ts     # route gate (redirects unauthenticated users)
  components/         # React UI (client + server components)
  lib/
    auth.ts           # JWT sign/verify, bcrypt, cookie session
    db.ts             # Prisma client singleton (hot-reload safe)
    money.ts          # minor-unit money helpers
    orders.ts         # totals + status state machine (pure, unit-tested)
    pagination.ts     # clamp/parse page params (pure, unit-tested)
    stats.ts          # dashboard aggregation (shared by page + API)
    validation.ts     # Zod schemas
prisma/               # schema, migration, scale seed
tests/                # Vitest unit tests
```

**Key decisions**

- **Money in integer minor units** everywhere — the single most common bug class in payment/e-commerce code, designed out.
- **Server Components** read data directly via Prisma; **client components** (orders search, forms, auth) talk to the **REST API** — both idiomatic Next.js patterns, shown deliberately.
- **Business logic is pure and isolated** (`lib/orders.ts`, `lib/money.ts`) so it's unit-testable without a database.

## Built for scale

This is a portfolio project, but it's engineered with the patterns a high-traffic
system needs — and each one is real in the code, not just described:

| Concern | How it's handled |
|---|---|
| **Large datasets** | All list endpoints are **paginated** (clamped page size) with **indexed** `status` / `createdAt` columns and DB-side filtering — never "load everything then filter". |
| **Horizontal scaling** | The API is **stateless** (JWT in a cookie, no server session store), so you can run N instances behind a load balancer. |
| **DB connections** | A single pooled Prisma client per instance (hot-reload-safe) avoids connection exhaustion. |
| **Consistency** | Order creation runs in a **transaction**; status changes go through a validated state machine. |
| **Efficient queries** | KPI tiles use SQL `aggregate` / `groupBy`, not in-memory reduction of full tables. |
| **Deployability** | Multi-stage **Dockerfile** (Next standalone) + **docker-compose** with Postgres; **GitHub Actions** CI runs typecheck + tests + build on every push. |
| **Portability** | SQLite for instant local dev; change the Prisma `provider` to `postgresql` for production — no model changes. |

## API

All endpoints require an authenticated session cookie (obtained via `/api/auth/login`).

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account (first user → ADMIN) |
| POST | `/api/auth/login` | Sign in, set session cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current session |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product (ADMIN) |
| GET | `/api/orders?query=&status=&page=&pageSize=` | Paginated, searchable orders |
| POST | `/api/orders` | Create order (transactional) |
| GET | `/api/orders/:id` | Order detail with items |
| PATCH | `/api/orders/:id` | Change status (validated transition) |
| GET | `/api/dashboard/stats` | KPIs + 7-day revenue series |

## Testing

```bash
npm test          # Vitest unit suite
npx tsc --noEmit  # type check
```

## Production with Postgres

1. Set `provider = "postgresql"` in `prisma/schema.prisma`.
2. `docker compose up --build` (starts Postgres + the app).

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Prisma · SQLite/Postgres ·
Zod · jose (JWT) · bcrypt · Tailwind CSS · Recharts · Vitest · Docker · GitHub Actions.

---

Built by **Sara Dawood** — [portfolio](https://saraalidawood.github.io/PORTFOLIO/) · [GitHub](https://github.com/SaraAliDawood)
