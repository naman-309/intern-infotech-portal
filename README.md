# Intern Infotech — Software Engineering Coaching Institute Portal

A full-stack, enterprise-grade educational platform built for an elite offline technical coaching institute. The system powers in-person admissions verification, supervised offline examination grading, batch rostering, targeted notifications, advertised tuition tracking, and a public marketing catalog.

---

## 1. Architectural Overview & System Design

The platform is designed around **Node.js Express microservices**, an **Nginx API Gateway / Reverse Proxy**, **Neon Serverless PostgreSQL with Prisma ORM**, **Upstash Serverless Redis Pub/Sub** for asynchronous email jobs, and a **React + Vite** frontend.

```
                              [ Public Web Clients ]  /  [ Dashboards ]
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │       Nginx API Gateway / Reverse Proxy      │
                         │             (Port 80 / 443 HTTPS)            │
                         └──────────────────────┬───────────────────────┘
                                                │
               ┌───────────────────┬────────────┴───────┬────────────────────┐
               │ /api/v1/auth/*    │ /api/v1/users/*    │ /api/v1/courses/*  │ /api/v1/announcements/*
               ▼                   ▼                    ▼                    ▼
     ┌───────────────────┐ ┌───────────────┐  ┌───────────────────┐  ┌───────────────────────┐
     │   Auth Service    │ │ User Service  │  │ Academic Service  │  │  Notification Service │
     │    (Port 5001)    │ │  (Port 5002)  │  │    (Port 5003)    │  │      (Port 5004)      │
     └─────────┬─────────┘ └───────┬───────┘  └─────────┬─────────┘  └───────────┬───────────┘
               │  PUBLISH          │  PUBLISH           │  PUBLISH               │  SUBSCRIBE
               └───────────────────┴──────────┬─────────┘               ─────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │   Neon Serverless PostgreSQL    │             │  Upstash Serverless Redis       │
     │   (Relational Source of Truth)  │             │  Pub/Sub: email_channel         │
     └─────────────────────────────────┘             └─────────────────────────────────┘
```

### Redis Pub/Sub Email Architecture

Email jobs use a **pure Redis Pub/Sub** pattern:

| Role | Connection | Description |
| :--- | :--- | :--- |
| **Publisher** | `publisherClient` (ioredis) | Auth, User & Academic services publish to `email_channel` |
| **Subscriber** | `subscriberClient` (ioredis) | Notification Service subscribes to `email_channel` and dispatches emails |

A graceful **direct async fallback** is built-in: if Upstash Redis is unreachable, emails fire directly via `setImmediate` so no HTTP response is ever blocked.

### Microservice Responsibilities & Data Boundaries

| Service | Port | Responsibilities & Data Ownership | Primary Routes |
| :--- | :--- | :--- | :--- |
| **Auth Service** | 5001 | Credential verification, rotating refresh tokens, JWT issuance, email verification tokens, password resets, registration intake. | `/api/v1/auth/*` |
| **User Service** | 5002 | Student & teacher profile management, account lifecycle (Active/Inactive/Suspended), authoritative offline student registry, registration approvals/rejections, audit logs. | `/api/v1/users/*`, `/api/v1/students/*`, `/api/v1/teachers/*`, `/api/v1/registrations/*`, `/api/v1/eligible-emails/*`, `/api/v1/audit-logs/*` |
| **Academic Service** | 5003 | Course publishing, batch scheduling, faculty assignments, offline examinations, marks recording with revision audit history, draft/published results, success stories CMS, fee records. | `/api/v1/courses/*`, `/api/v1/batches/*`, `/api/v1/exams/*`, `/api/v1/results/*`, `/api/v1/success-stories/*`, `/api/v1/fees/*`, `/api/v1/public/*` |
| **Notification Service** | 5004 | Multi-level targeted announcements (Institute, Course, Batch, Individual), priority handling, Nodemailer SMTP delivery. **Hosts the Redis Pub/Sub subscriber** that processes all email jobs. | `/api/v1/announcements/*` |
| **API Gateway / Nginx** | 5000 / 80 | Single public entrypoint routing requests to microservices, forwarding cookies, terminating SSL/TLS, and serving frontend build assets. | All routes |

---

## 2. Four Integrated Interfaces

1. **Public Website (`/`)**:
   - High-impact Hero section with live statistics and offline cohort badges.
   - Offline engineering laboratory pedagogy overview (3-hour practical exams, whiteboard design drills, workstation setups).
   - Interactive Course Catalog with search, filters, advertised fees, and curriculum syllabus modals.
   - Technologies curriculum breakdown (React, Node, PostgreSQL, Redis, Docker, System Design).
   - Graduate Success Stories with alumni placement details, employer logos, packages, and transparent non-guarantee disclosures.
   - Campus Location Map & Offline Visit Inquiry Form.
2. **Student Portal (`/student/*`)**:
   - Enrolled cohort schedules, classroom logistics, and faculty instructor details.
   - **Offline Exam Results**: Strictly published results only (marks obtained, max marks, percentage, feedback, status). Draft marks are never exposed to students.
   - Targeted notices and announcements.
   - Advertised tuition statements, payment records, and remaining balance tracking.
   - Permitted profile fields editing (phone, address, avatar, guardian contact) and secure password change.
3. **Teacher Dashboard (`/teacher/*`)**:
   - Assigned batch rosters with enrolled student contacts and capacity counters.
   - **Offline Examination Management**: Create in-person lab exams, enter student marks (strictly validated: `0 <= marks <= maxMarks`), save as draft, and publish results.
   - Automatic revision tracking in `ExamResultHistory` whenever marks on a published exam are edited.
   - Review pending student admission registration requests within the teacher's authorized batch scope.
   - Broadcast cohort announcements.
4. **Admin Dashboard (`/admin/*`)**:
   - Executive operations console with real-time counters and review queues.
   - **Registration Approval Flow**: Verify offline student eligibility against the authoritative registry, review teacher applicants, and approve/reject with reviewer notes.
   - **Authoritative Eligible Student Registry**: Add single or bulk-import offline admitted students via JSON to allow portal self-registration.
   - Student & Teacher directories with one-click activation, deactivation, and session revocation.
   - Course & Curriculum CMS (create, edit, publish/unpublish, feature, archive without losing historical records).
   - Batch scheduling, teacher assignments, and direct student enrollments.
   - Examination oversight with unpublish/revert capabilities.
   - Institute-wide announcements with Nodemailer email broadcast dispatch.
   - Graduate Success Stories CMS.
   - Student tuition fee ledger & installment recording.
   - **Security Audit Log Stream**: Searchable, immutable record of all state mutations (passwords and secrets strictly sanitized).

---

## 3. Technology Stack

### Frontend
- **React 18** + **Vite** (Strictly Plain JavaScript / JSX — No TypeScript)
- **Tailwind CSS** (Curated dark palette: Slate 950 base, Indigo/Emerald/Amber accents, Glassmorphism)
- **React Router v6** (Browser routing with role-based `ProtectedRoute` guards)
- **TanStack Query v5** (Server state management, caching, and background invalidation)
- **React Hook Form** + **Zod** (Accessible forms, real-time client validation)
- **Lucide React** (Modern developer icon set)
- **Sonner** (Toast notifications)

### Backend
- **Node.js (v18+)** + **Express.js** (Microservices architecture)
- **Prisma ORM** + **Neon Serverless PostgreSQL** (Normalized schema, relations, foreign keys, indexes)
- **Upstash Serverless Redis** + **ioredis Pub/Sub** (Asynchronous email jobs via `email_channel`, graceful direct fallback)
- **JWT Authentication** stored exclusively in **HTTP-only cookies** (`accessToken` 15m, rotating `refreshToken` 7d)
- **bcryptjs** (Password hashing with 12 salt rounds)
- **Nodemailer** (Branded responsive HTML templates for verification, approvals, rejections, results, and notices)
- **Cloudinary** (Secure image delivery for thumbnails, avatars, and alumni photos)
- **Nginx** (Reverse proxy, request limits, cookie passthrough, SSL termination)

### Cloud Infrastructure
- **Neon** — Serverless PostgreSQL (`DATABASE_URL` — no local Postgres required)
- **Upstash** — Serverless Redis (`REDIS_URL` — no local Redis required)

---

## 4. Local Development Setup (Quick Start)

### Prerequisites
- Node.js 18+ (tested on Node v20 & v24)
- npm 9+
- A **Neon** account with a PostgreSQL database → [console.neon.tech](https://console.neon.tech)
- An **Upstash** account with a Redis database → [console.upstash.com](https://console.upstash.com)

### Step 1: Clone and Configure Environment Variables
```bash
git clone https://github.com/sahilpatidar94/intern-infotech-portal.git
cd intern-infotech-portal

# Copy environment template
cp .env.example .env
```
Edit `.env` and fill in your **Neon `DATABASE_URL`**, **Upstash `REDIS_URL`**, JWT secrets, and optional SMTP / Cloudinary credentials.

### Step 2: Install Monorepo Dependencies
```bash
npm install
```

### Step 3: Initialize Database Schema & Seed Data
```bash
# Push schema to Neon PostgreSQL
npm run db:push

# Generate Prisma Client
npm run db:generate

# Populate comprehensive development seed data
npm run db:seed
```

### Step 4: Launch the Microservices and Frontend
```bash
# Concurrently starts API Gateway (5000), Auth (5001), User (5002), Academic (5003), Notification (5004), and Frontend (5173)
npm run dev
```

Visit the application at: **`http://localhost:5173`**

> **Note**: The Notification Service (port 5004) automatically starts the Redis Pub/Sub subscriber on startup. Email jobs published by auth-service, user-service, and academic-service will be consumed and dispatched here.

---

## 5. Seed Accounts & Credentials

The seed script (`npm run db:seed`) creates verified test accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@infotech.edu` | `SecurePass@2026` | `/admin` (Full System Console) |
| **Lead Faculty** | `prof.sharma@infotech.edu` | `SecurePass@2026` | `/teacher` (Cohorts, Exams, Reviews) |
| **Co-Instructor** | `dr.anita@infotech.edu` | `SecurePass@2026` | `/teacher` (Assigned Batches) |
| **Enrolled Student** | `student@infotech.edu` | `SecurePass@2026` | `/student` (Marks, Schedules, Fees) |
| **Pre-Registered Offline** | `priya.singh@gmail.com` | N/A | Can test `/register-student` flow |

---

## 6. Secure Initial Admin Bootstrap Procedure

In production environments, default credentials must never be committed to source control. Use the secure interactive bootstrap script:

```bash
npm run bootstrap:admin
```
The wizard will verify whether an administrator exists, securely prompt for an email and strong password, hash the credentials with bcrypt, and record an immutable event in the `AuditLog` table.

Alternatively, set `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` in your production environment variables before running the command in a non-interactive pipeline.

---

## 7. Containerized Deployment with Docker Compose

All microservices run in isolated containers. Neon PostgreSQL and Upstash Redis are consumed as external cloud services — no local database or Redis containers are needed.

```bash
# Build images and launch 4 microservices + Nginx proxy
docker-compose up -d --build

# Run Prisma schema push against Neon (only needed on first deploy)
docker-compose exec auth-service npx prisma db push --schema=backend/shared/prisma/schema.prisma

# Optional: seed development data
docker-compose exec auth-service npm run db:seed
```
Access the application through the Nginx gateway at `http://localhost`.

---

## 8. Production Deployment to AWS EC2

### EC2 Security Group Configuration
Restrict inbound network rules to only required ports:
- **Port 22 (SSH)**: Restrict to your static deployment IP address or AWS Systems Manager (SSM).
- **Port 80 (HTTP)**: Allow `0.0.0.0/0` (redirected to HTTPS).
- **Port 443 (HTTPS)**: Allow `0.0.0.0/0` (public web traffic).
- **Ports 5001-5004 (Services)**: Keep internal to the Docker bridge network (`internal-net`). **Never expose directly to 0.0.0.0/0.**

> Since Neon and Upstash are cloud-managed services, ports 5432 (Postgres) and 6379 (Redis) no longer need to be considered in EC2 security group rules.

### Automated CI/CD with GitHub Actions
A complete workflow is provided in `.github/workflows/deploy.yml`. Configure the following repository secrets:
- `EC2_HOST`: Elastic IP address of your EC2 instance.
- `EC2_USERNAME`: `ubuntu` (or appropriate AMI user).
- `EC2_SSH_KEY`: Private SSH deployment key.
- `PROD_DATABASE_URL`: Your Neon PostgreSQL connection string.
- `PROD_REDIS_URL`: Your Upstash Redis connection string (`rediss://...`).
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_VERIFY_SECRET`, `JWT_RESET_SECRET`: Strong 32+ character keys.
- `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM_ADDRESS`: Production email credentials.

---

## 9. Rollback Procedure

If a deployed version encounters issues:

1. **Container Fleet Rollback**:
   ```bash
   # Revert Git repository on EC2 to previous stable commit tag
   git checkout <previous-stable-tag>

   # Rebuild and restart containers
   docker-compose down
   docker-compose up -d --build
   ```
2. **Database Rollback**:
   Since the project uses **Neon Serverless PostgreSQL**, you can use Neon's built-in **branching** feature to restore a point-in-time snapshot from the Neon Console — no manual backup scripts required.

---

## 10. Security & Compliance Highlights

- **HTTP-Only Cookies**: JWT access and refresh tokens are stored exclusively in HTTP-only, SameSite cookies. The browser never exposes raw tokens to JavaScript or localStorage.
- **Refresh Token Rotation**: Each token refresh revokes the prior token hash and writes a new random cryptographic seed to prevent replay attacks.
- **Rate Limiting**: Configured separately for authentication routes (login/register) to mitigate credential stuffing.
- **Account Enumeration Protection**: Password reset and admission inquiry endpoints return consistent, generic responses.
- **Secret Sanitization**: Centralized audit logger systematically redacts passwords, tokens, cookies, and credentials before writing to the database.
