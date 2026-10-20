# Intern Infotech — Software Engineering Coaching Institute Portal

> **System Lead & Architecture:** Built & Architected with precision by **`dev@nkkr`**  
> **Institute Operating Hours:** 7:00 AM – 7:00 PM Open Daily (Offline Engineering Campus, Indore)

An enterprise-grade, microservice-powered portal built for a premier offline technical coaching institute. The platform manages in-person admissions verification, supervised offline examinations, 35-mark technical mock interviews, batch scheduling, real-time notices, advertised tuition tracking, and a high-converting public course catalog.

---

## 1. Architectural Overview & System Design

The system is architected as high-performance **Node.js Express microservices** unified behind an **API Gateway**, backed by **Neon Serverless PostgreSQL (with Prisma ORM)** and **Upstash Serverless Redis** for ultra-fast sub-15ms cached API queries and background email queuing.

```
                              [ Public Web / Student / Admin ]
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          API Gateway / Reverse Proxy         │
                       │             (Port 5000 / Port 80)            │
                       └──────────────────────┬───────────────────────┘
                                              │
             ┌───────────────────┬────────────┴───────┬────────────────────┐
             │ /api/v1/auth/*    │ /api/v1/users/*    │ /api/v1/courses/*  │ /api/v1/announcements/*
             ▼                   ▼                    ▼                    ▼
   ┌───────────────────┐ ┌───────────────┐  ┌───────────────────┐  ┌───────────────────────┐
   │   Auth Service    │ │ User Service  │  │ Academic Service  │  │  Notification Service │
   │    (Port 5001)    │ │  (Port 5002)  │  │    (Port 5003)    │  │      (Port 5004)      │
   └─────────┬─────────┘ └───────┬───────┘  └─────────┬─────────┘  └───────────┬───────────┘
             │                   │                    │                        │
             └───────────────────┴──────────┬─────────┴────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
   ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
   │   Neon Serverless PostgreSQL    │             │  Upstash Serverless Redis       │
   │   (Relational Source of Truth)  │             │  Caching (30-min TTL, 250MB)    │
   │   Prisma ORM • Clean Schemas    │             │  Pub/Sub: email_channel         │
   └─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 2. Redis Caching & Performance Architecture (Constraints Aware)

Both public and authenticated dashboard queries are optimized with a strict Redis caching layer configured for **Upstash Serverless Redis**:

- **Available Memory Quota:** Capped and monitored within the **250 MB** storage limit.
- **Eviction / TTL Strategy:** Operates on a strict **30-minute wipeout window (`TTL = 1800s`)**.
- **Transparent Response Middleware:** Serves repeated read queries in `< 15ms` with `X-Cache: HIT` HTTP response headers.
- **Granular Key Namespaces:**
  - `cache:courses:*` — Public catalog and course modules (30m TTL).
  - `cache:batches:*` — Active cohort rosters and timings (30m TTL).
  - `cache:fees:student:<id>` — Per-student fee balance statements (30m TTL).
  - `cache:mock_interviews:student:<id>` — 35-mark mock interview scorecards (30m TTL).
  - `cache:announcements:*` — Batch and campus-wide notices (30m TTL).
  - `cache:stories:*` — Verified alumni placement testimonials (30m TTL).
- **Automated Cache Invalidation:** Write operations (`POST`, `PUT`, `DELETE`, `PATCH`) automatically invalidate matching key prefixes to prevent stale reads.
- **Admin Manual Wipe:** Admins can trigger a full instant cache flush via `POST /api/v1/courses/cache/purge` directly from the dashboard console.

---

## 3. Four Core Academic Programs (6 to 8 Months)

The academic catalog is streamlined to 4 core intensive offline programs designed for Tier-1 placements:

| # | Program Title | Duration | Advertised Fee | Focus Areas |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Full Stack Development** | 32 Weeks (8 Months) | ₹65,000 | React 18, Node.js microservices, TypeScript, PostgreSQL indexing, Redis caching, Docker deployments |
| **2** | **DevOps & Cloud Engineering** | 28 Weeks (7 Months) | ₹55,000 | Linux internals, Docker, Kubernetes orchestration, Terraform IaC, GitHub Actions CI/CD, AWS architecture |
| **3** | **Data Structures & Algorithms / Systems (DSE)** | 24 Weeks (6 Months) | ₹45,000 | Advanced graphs, dynamic programming, low-level concurrency, Raft consensus, Tier-1 system design |
| **4** | **Cybersecurity & Defense** | 24 Weeks (6 Months) | ₹50,000 | OWASP Top 10, penetration testing, cryptography (AES-GCM, TLS 1.3), network traffic analysis, SOC triage |

---

## 4. Technology Stack

### Frontend (`frontend/`)
- **React 18** + **Vite** (Plain JSX, fast HMR)
- **Tailwind CSS** (Custom curated dark theme, sleek glassmorphism, glowing accents)
- **TanStack Query v5** (Server state synchronization & Redis-aware caching)
- **React Router v6** (Role-guarded routes for Public, Student, Teacher, and Admin)
- **Lucide React** (Hardware-accelerated icons)
- **Sonner** (Lightweight toast notifications)

### Backend (`backend/`)
- **Node.js (v18+)** + **Express.js** (Microservices architecture)
- **Prisma ORM 5.22** + **Neon Serverless PostgreSQL**
- **Upstash Serverless Redis** + **ioredis** (30-minute caching layer + Pub/Sub email dispatcher)
- **JWT Authentication** stored strictly in **HTTP-only cookies** (`accessToken` 15m, rotating `refreshToken` 7d)
- **bcryptjs** (Password hashing with 10 salt rounds)
- **Nodemailer** (Branded responsive HTML templates for verification, approvals, and notices)

---

## 5. Clean, Production-Grade Seed Accounts

Run `npm run db:seed` to populate the trimmed, verified database:

| Role | Account Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@infotech.edu` | `SecurePass@2026` | Full administrative operations gateway |
| **Lead Faculty** | `prof.sharma@infotech.edu` | `SecurePass@2026` | Prof. Vikram Sharma (M.Tech IIT Madras, Ex-Uber & Stripe) |
| **Active Student 1** | `student@infotech.edu` | `SecurePass@2026` | Rahul Sharma (Roll: `R-1001` • Full Stack Cohort) |
| **Active Student 2** | `kavita.iyer@infotech.edu` | `SecurePass@2026` | Kavita Iyer (Roll: `R-1002` • DevOps & Cloud Sprint) |

---

## 6. Local Development Setup

### Prerequisites
- Node.js 18+ (tested with v20 & v24)
- npm 9+
- A Neon Serverless PostgreSQL database (`DATABASE_URL`)
- An Upstash Redis database (`REDIS_URL`)

### Step 1: Clone and Configure Environment
```bash
git checkout naman_branch
cp .env.example .env
```
Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/infotech?sslmode=require"
REDIS_URL="rediss://default:token@xyz.upstash.io:6379"
CLIENT_ORIGIN="http://localhost:5173"
JWT_ACCESS_SECRET="your-32-char-access-secret-here"
JWT_REFRESH_SECRET="your-32-char-refresh-secret-here"
JWT_VERIFY_SECRET="your-32-char-verify-secret-here"
JWT_RESET_SECRET="your-32-char-reset-secret-here"
```

### Step 2: Install Monorepo Dependencies
```bash
npm install
```

### Step 3: Run Database Migrations & Clean Seed
```bash
# Push Prisma schema to Neon
npm run db:push

# Generate Prisma Client
npm run db:generate

# Populate clean, lean test data (1 Admin, 1 Teacher, 2 Students, 4 Core Programs)
npm run db:seed
```

### Step 4: Run Locally
```bash
# Start all microservices concurrently + Vite frontend
npm run dev
```

Visit the app in your browser:
- **Public Portal:** `http://localhost:5173`
- **Student Dashboard:** `http://localhost:5173/student`
- **Admin Console:** `http://localhost:5173/admin`
- **API Gateway:** `http://localhost:5000/api/v1`

---

## 7. Key Features & Highlights

1. **Campus Operational Schedule:** Open daily **7:00 AM – 7:00 PM** for physical laboratory access, 1-on-1 code reviews, and offline examinations.
2. **Interactive Lead Faculty Showcase:** Highlighted on the public landing page with domain specializations, M.Tech IIT Madras background, and Tier-1 industry credentials.
3. **Developer Branding & Flex:** Integrated **`dev@nkkr`** signature badges in the navigation, dashboard headers, and an interactive terminal credits modal.
4. **Resolved Dynamic Origin Resolution:** `getClientOrigin(req)` automatically eliminates backend port leakage in password reset and verification emails.
5. **Strict Auditing:** Every sensitive administrative action (marks modification, approval, status change) is logged in an immutable `AuditLog` table.
