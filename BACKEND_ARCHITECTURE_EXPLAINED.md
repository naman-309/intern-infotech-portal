# 🚀 INTERN INFOTECH PORTAL — COMPLETE BACKEND & SYSTEM DESIGN GUIDE
*(Interview & Deep Understanding Guide in Simple Hinglish)*

---

## 📌 TABLE OF CONTENTS
1. **High-Level Overview (Project kya hai aur kaise bana hai?)**
2. **System Design & Request Lifecycle (Browser se Database tak ka pura safar)**
3. **Nginx API Gateway (Puri traffic ko guide karne wala Traffic Police)**
4. **Backend Microservices (Kaunsi service kya kaam karti hai?)**
   - Service 1: `auth-service` (Port 5001)
   - Service 2: `user-service` (Port 5002)
   - Service 3: `academic-service` (Port 5003)
   - Service 4: `notification-service` (Port 5004)
   - Shared Library: `@portal/shared`
5. **Database Architecture & Schema Relations (PostgreSQL + Prisma)**
6. **Redis Caching & Invalidation Strategy (Performance 10x kaise hui?)**
7. **Security, Authentication & Cookies (JWT token kaise securely travel karta hai?)**
8. **DevOps & Docker Networking (Containers aapas me kaise baat karte hain?)**
9. **Top 10 Interview Questions & Answers (Agar koi puche toh kya bolna hai?)**

---

## 1. HIGH-LEVEL OVERVIEW

Intern Infotech Portal ek **Enterprise-level Coaching/Institute Management System** hai.

### Monolith vs Microservices:
- **Normal Monolith:** Ek hi Node.js file/server me Auth, Users, Fees, Classes sab kuch mix hota hai. Agar fee calculation crash hua, toh pura website login band ho jata hai.
- **Humaara Microservices Design:** Har critical kaam ke liye alag independent Node.js server hai:
  - Auth ke liye alag (`auth-service`)
  - User/Teacher ke liye alag (`user-service`)
  - Batch, Fee, Exams ke liye alag (`academic-service`)
  - Emails/Announcements ke liye alag (`notification-service`)
  - Frontend aur sabhi services ke aage ek **Nginx API Gateway** baitha hai.

---

## 2. SYSTEM DESIGN & REQUEST LIFECYCLE (Step-by-Step Flow)

Jab ek student ya admin browser par click karta hai, toh backend me exactly kya hota hai?

```
[ USER BROWSER / REACT FRONTEND ]
              │
              │  HTTP Request (e.g. GET /api/v1/students)
              ▼
    [ NGINX API GATEWAY (Port 80) ]
              │
       Reverse Proxy Routing
              ├── /api/v1/auth/*          ──► [ Auth Service : 5001 ]
              ├── /api/v1/students, etc.  ──► [ User Service : 5002 ]
              ├── /api/v1/batches, fees   ──► [ Academic Service : 5003 ]
              └── /api/v1/announcements   ──► [ Notification Service : 5004 ]
                                                       │
                                  ┌────────────────────┴────────────────────┐
                                  ▼                                         ▼
                       [ UPSTASH REDIS CACHE ]                    [ NEON POSTGRESQL ]
                         (Super-fast RAM Cache)                  (Permanent Database)
```

### Ek Real Example (Student Profile Fetch):
1. **Frontend Request bhejta hai:** `GET http://localhost/api/v1/students/me` sath me HTTP-Only Cookie (`accessToken`).
2. **Nginx pakadta hai:** Nginx rule check karta hai: `^/api/v1/(students)`. Nginx request ko forward karta hai `http://user-service:5002/api/v1/students/me`.
3. **User Service Middleware:**
   - `authenticate` middleware cookie se JWT token read karta hai aur secret key se verify karta hai.
   - `cacheMiddleware` check karta hai: Kya Redis me `cache:users:...` key already exist karti hai?
4. **Cache Check:**
   - **Cache HIT:** Agar Redis me data hai, toh bina database ko touch kiye 5ms ke andar JSON response wapas bhej deta hai.
   - **Cache MISS:** Agar Redis me data nahi hai, toh Prisma ORM ke through Neon PostgreSQL se SQL query chalakar fresh data lata hai, usko Redis me 30 minutes ke liye save karta hai, aur client ko send karta hai.

---

## 3. NGINX API GATEWAY (Port 80)

Nginx pure project ka **Single Entry Point (Darwaza)** hai. Bahar ki duniya ko microservices ke internal ports (5001, 5002, 5003) pata nahi hote. Bahar se sirf **Port 80** dikhta hai.

### Nginx Config (`nginx/nginx.conf`):
1. **Upstream Definitions:**
   ```nginx
   upstream auth_service { server auth-service:5001; }
   upstream user_service { server user-service:5002; }
   upstream academic_service { server academic-service:5003; }
   upstream notification_service { server notification-service:5004; }
   ```
2. **Reverse Proxy Rules:**
   - `/api/v1/auth` -> `proxy_pass http://auth_service;`
   - `/api/v1/(users|students|teachers|registrations|eligible-emails)` -> `proxy_pass http://user_service;`
   - `/api/v1/(courses|batches|exams|results|fees)` -> `proxy_pass http://academic_service;`
   - `/api/v1/announcements` -> `proxy_pass http://notification_service;`
   - `/` -> React production build ke static HTML, CSS, JS files serve karta hai.

**Fayda:**
- Security (Internal services internet par exposed nahi hain).
- CORS ka jhanjhat khatam (Frontend aur Backend dono same origin `http://localhost:80` par hote hain).
- Load Balancing aur SSL/TLS termination yahi handle ho sakta hai.

---

## 4. BACKEND MICROSERVICES IN DETAIL

### 🔹 Service 1: `auth-service` (Port 5001)
**Main Responsibility:** Authentication & Identity
- **Endpoints:**
  - `POST /api/v1/auth/login`: Email aur password verify karta hai (Bcrypt hash check). Access Token (15 min) aur Refresh Token (7 days) generate karke HTTP-Only secure cookies me set karta hai.
  - `POST /api/v1/auth/logout`: Cookies clear karta hai aur session invalidate karta hai.
  - `POST /api/v1/auth/refresh`: Refresh token se naya access token banata hai (bina dubara login karaye).
  - `POST /api/v1/auth/register-request/student`: Naya student registration request submit karta hai.
    - *Special Rule:* Ye pehle check karta hai ki kya student ki email institute ke offline admission list (`eligibleStudentEmail`) me verified hai ya nahi!
    - *Redis Invalidation:* Submit hote hi `invalidateCache(['registrations'])` trigger hota hai, taaki admin ko turant request dikhe.
  - `POST /api/v1/auth/forgot-password` & `reset-password`: Secure crypto token email par bhejta hai.
  - `GET /api/v1/auth/me`: Current logged-in user ka pura profile + enrollments + batch details return karta hai.

---

### 🔹 Service 2: `user-service` (Port 5002)
**Main Responsibility:** User Profiles, Teacher Management, Approvals
- **Endpoints:**
  - `GET /api/v1/students` & `GET /api/v1/students/:id`: Enrolled students ki list aur detailed 360 view.
  - `PUT /api/v1/students/:id`: Admin student ki basic info, roll number, guardian details update karta hai.
  - `GET /api/v1/teachers`: Internal faculty management list (Admin only).
  - `GET /api/v1/teachers/public`: **Public API** — Sirf wahi teachers return karta hai jinka `showOnWebsite: true` aur `status: ACTIVE` ho (Landing page par show karne ke liye).
  - `POST /api/v1/teachers`: Admin direct naye teacher ka account create karta hai.
  - `PATCH /api/v1/teachers/:id/visibility`: Admin public website par teacher ko dikhana ya chupana (`ON / OFF`) toggle karta hai. Ye update hote hi `teachers_public` cache invalidate ho jata hai.
  - `GET /api/v1/registrations`: Pending registration requests ki list.
  - `POST /api/v1/registrations/:id/approve` & `reject`: Admin student ko approve karta hai.
    - Approve hote hi: User status ACTIVE banta hai, StudentProfile banti hai, batch assign hota hai, aur FeeRecord create hota hai.
  - `GET /api/v1/eligible-emails`: Offline admission whitelist management.

---

### 🔹 Service 3: `academic-service` (Port 5003)
**Main Responsibility:** Courses, Batches, Multi-Course Enrollment, Fee Management, Exams
- **Endpoints:**
  - `GET /api/v1/courses/public`: Published courses ki list (Syllabus, duration, published fee).
  - `GET /api/v1/batches` & `POST /api/v1/batches`: Batches create karna, timing set karna, lab workstations allocate karna.
  - `POST /api/v1/batches/:id/enrollments`: **Multi-Course Enrollment Engine**
    - Ek student ek sath multiple courses me enroll ho sakta hai (e.g. Full Stack + DevOps).
    - **Duplicate Prevention:** Check karta hai ki kya student usi course ke kisi active batch me already enrolled hai? Agar haan, toh HTTP 409 Conflict error return karta hai.
    - **Discount Calculation:**
      $$\text{Final Payable Amount} = \text{Original Course Fee} - \text{Discount Amount}$$
      $$\text{Remaining Balance} = \text{Final Payable Amount} - \text{Total Paid}$$
    - Independent `FeeRecord` create hota hai jo sirf is course ke sath linked hota hai.
  - `GET /api/v1/fees`: Admin ke liye all fee records ledger (Original, Discount, Payable, Paid, Due).
  - `POST /api/v1/fees/:id/payments`: Installment payment record karna (UPI, Cash, Bank Transfer) aur live balance recalculate karna.
  - `GET /api/v1/mock-interviews` & `Offline Exams`: Mock interview marks aur written exam results record aur publish karna.

---

### 🔹 Service 4: `notification-service` (Port 5004)
**Main Responsibility:** Broadcast Announcements & System Notifications
- **Endpoints:**
  - `GET /api/v1/announcements`: Student aur teachers ke liye notice board.
  - `POST /api/v1/announcements`: Admin notices create karta hai (Target audience: ALL, STUDENTS, TEACHERS, ya specific student).

---

### 🔹 Shared Library: `@portal/shared`
Har service me code duplicate na ho, isliye common logic ek shared npm package me hai:
- `prisma`: Database connection client.
- `redisClient`: Upstash Redis connection + helper methods.
- `cacheMiddleware(prefix, ttl)`: Har read endpoint ko Redis me cache karne wala reusable middleware.
- `invalidateCache([prefixes])`: Database change hone par stale cache keys ko delete karne wala master helper.
- `authenticate` & `requireRole('ADMIN', 'TEACHER', 'STUDENT')`: JWT authorization guards.
- `response.js`: Standard JSON response helpers (`successResponse`, `errorResponse`, `paginatedResponse`).

---

## 5. DATABASE ARCHITECTURE (PostgreSQL + Prisma)

Project ka database **Neon Serverless PostgreSQL** par hosted hai, aur hum **Prisma ORM** use karte hain.

### Key Models & Relationships:
1. **User Table:**
   - Columns: `id`, `email`, `passwordHash`, `role` (ADMIN, TEACHER, STUDENT), `status` (ACTIVE, INACTIVE).
   - Relations: Ek User ka ya toh ek `StudentProfile` hota hai ya ek `TeacherProfile`.
2. **StudentProfile Table:**
   - Columns: `enrollmentNumber`, `rollNumber`, `guardianName`, `guardianPhone`, `journeyStatus`.
   - Relations:
     - `enrollments`: 1 Student -> Many `Enrollment` records (Multi-course capability).
     - `feeRecords`: 1 Student -> Many `FeeRecord` records (Har course ki alag fee).
3. **TeacherProfile Table:**
   - Columns: `employeeId`, `specialization`, `qualifications`, `bio`, `showOnWebsite` (Boolean).
   - Relations: `assignments` (Batches where this teacher teaches).
4. **Course Table:**
   - Columns: `title`, `slug`, `advertisedFee`, `duration`, `published`.
5. **Batch Table:**
   - Columns: `batchCode`, `name`, `timing`, `startDate`, `courseId`.
6. **Enrollment Table:**
   - Linker Table: `studentId` + `batchId` + `courseId`.
   - Unique constraint: `@@unique([studentId, batchId])`
7. **FeeRecord Table:**
   - Columns:
     - `originalFee`: Published course fee (e.g. ₹30,000).
     - `discountAmount`: Concession/Scholarship (e.g. ₹5,000).
     - `totalFee`: Final Payable Amount = ₹25,000.
     - `paidAmount`: Student ne abhi tak kitna diya (e.g. ₹10,000).
     - `balanceAmount`: Baaki bachha amount = ₹15,000.
     - `paymentStatus`: PENDING, PARTIAL, ya PAID.
   - Relations: `payments` (Installment history).

---

## 6. REDIS CACHING & INVALIDATION STRATEGY

### Problem jo humne solve ki:
Pehle jab koi student register karta tha, toh PostgreSQL me save ho jata tha, lekin Admin panel Redis ki purani cached list padh raha hota tha. Jab tak Redis manual flush na karo, naya registration nahi dikhta tha.

### Solution (Smart Invalidation Pattern):
Humne **Cache Invalidation on Mutation** pattern implement kiya:

1. **Read Request (GET):**
   - Cache key format: `cache:<prefix>:<query_hash>` (e.g. `cache:registrations:all`, `cache:teachers_public:list`).
   - TTL: 1800 seconds (30 minutes).
2. **Write Request (POST / PUT / PATCH / DELETE):**
   - Step 1: Database me record safely commit hota hai (`prisma.create(...)` ya `prisma.update(...)`).
   - Step 2: Turant `await invalidateCache(['registrations'])` call hota hai.
   - Step 3: `invalidateCache` helper Redis me jakar us pattern ke saare keys ko delete kar deta hai.
   - Step 4: Agla read request aate hi fresh database data fetch hota hai aur Redis me automatically naya cache ban jata hai.
3. **Graceful Fallback:**
   - Agar Redis internet issue ya limit cross hone par down ho jaye, toh humara code crash nahi hota! Code try/catch me wrapped hai aur chupchaap PostgreSQL se direct fresh data le aata hai.

---

## 7. SECURITY & AUTHENTICATION FLOW

1. **Password Security:**
   - Passwords plain text me store nahi hote; `bcryptjs` se 10 salt rounds ke sath hash kiye jate hain.
2. **JWT in HTTP-Only Cookies:**
   - Tokens LocalStorage me store nahi hote (LocalStorage me XSS attacks ka khatra hota hai).
   - Tokens **HTTP-Only, Secure, SameSite=Lax** cookies me hote hain, jise JavaScript browser me read nahi kar sakti.
3. **Dual Token Flow:**
   - `accessToken`: 15 minutes validity (Short-lived, high security).
   - `refreshToken`: 7 days validity (Naya access token lene ke liye).
4. **Role-Based Access Control (RBAC):**
   - Middleware: `requireRole('ADMIN')` check karta hai. Agar student admin endpoint hit karega, toh 403 Forbidden milta hai.
5. **Rate Limiting:**
   - Express rate limiters brute-force login attempts aur spam registrations ko block karte hain.

---

## 8. DOCKER & DEVOPS NETWORKING

### Container Architecture:
Project me 5 Docker containers chalte hain:
1. `infotech-nginx-gateway` (Port 80)
2. `infotech-auth-service` (Port 5001)
3. `infotech-user-service` (Port 5002)
4. `infotech-academic-service` (Port 5003)
5. `infotech-notification-service` (Port 5004)

### Internal Docker Network:
- Sabhi containers ek private bridge network `internal-net` me judey hote hain.
- Nginx container directly service names se baat karta hai: `http://auth-service:5001`.
- Docker ka internal DNS (`127.0.0.11`) service names ko unke container IP par map karta hai.

---

## 9. TOP 10 INTERVIEW QUESTIONS & ANSWERS (Quick Cheat-Sheet)

**Q1: Aapka project Monolithic hai ya Microservices?**
> *"Hamara backend microservices architecture par based hai. Humne business domains ke basis par services ko divide kiya hai: Auth Service, User Service, Academic Service, aur Notification Service. Saare services Nginx API Gateway ke piche run hoti hain."*

**Q2: Nginx API Gateway ka kya role hai?**
> *"Nginx single public entry point (Port 80) ki tarah act karta hai. Ye incoming requests ke URL path ko inspect karke respect microservice (ports 5001-5004) par reverse-proxy karta hai, React SPA frontend ko serve karta hai, aur internal microservices ko internet se secure rakhta hai."*

**Q3: Redis cache stale data problem ko aapne kaise fix kiya?**
> *"Pehle read-heavy endpoints par data cache rehta tha aur mutation ke baad purana data serve hota tha. Humne event-driven cache invalidation pattern implement kiya. Jab bhi koi state-changing operation (like student registration, approval, ya fee update) database me commit hoti hai, humari `invalidateCache()` utility turant affected Redis keys ko invalidate karti hai, taaki agla read request direct database se fresh data fetch kare."*

**Q4: Agar Redis server down ho jaye toh kya application crash hoga?**
> *"Nahi. Humne fail-safe caching design ki hai. Redis commands try/catch block me wrapped hain. Agar Redis unreachable hota hai ya timeout hota hai, application smoothly fallback karta hai aur PostgreSQL database se direct query serve karta hai."*

**Q5: Ek student multiple courses me kaise enroll hota hai? Database schema bataiye.**
> *"Humne `StudentProfile` aur `Course` ke beech direct 1-to-1 relationship rakhne ke bajaye ek dedicated `Enrollment` junction table use kiya hai. Ek `StudentProfile` ke paas multiple `Enrollment` records ho sakte hain, har enrollment ek specific `Batch` aur `Course` se linked hota hai. Sath hi hum ensure karte hain ki student usi course me duplicate active enrollment na kar sake."*

**Q6: Fee discount calculation backend me kaise work karti hai?**
> *"Har student-course enrollment ke sath ek independent `FeeRecord` link hota hai. Isme `originalFee` aur `discountAmount` store hote hain. Formula: `Final Payable = originalFee - discountAmount`, aur `Remaining Balance = Final Payable - paidAmount`. Backend me Zod validation hai taaki discount kabhi original fee se bada na ho sake."*

**Q7: Teacher public visibility feature kaise kaam karta hai?**
> *"Teacher record me ek boolean flag hai `showOnWebsite`. Admin dashboard se isko ON/OFF toggle kiya ja sakta hai. Public website landing page sirf `/api/v1/teachers/public` endpoint hit karti hai jo sirf un teachers ko return karta hai jinka `showOnWebsite: true` aur `status: ACTIVE` ho. Toggle hote hi `teachers_public` cache invalidate ho jata hai."*

**Q8: Authentication kaise secure ki gayi hai?**
> *"Hum JWT (JSON Web Tokens) use karte hain. XSS attacks prevent karne ke liye tokens ko LocalStorage me nahi balki HTTP-Only, Secure cookies me transmit kiya jata hai. Short-lived access token (15 mins) aur long-lived refresh token (7 days) ka dual-token pattern use kiya gaya hai."*

**Q9: Database operations me ORM kaunsa use kiya hai aur kyu?**
> *"Humne Prisma ORM use kiya hai PostgreSQL ke sath. Prisma compile-time type safety, relation queries, declarative schema migrations, aur connection pooling provide karta hai."*

**Q10: CI/CD aur Deployment kaise set kiya gaya hai?**
> *"Humne GitHub Actions workflow setup kiya hai. Jab bhi `main` branch me changes merge hote hain, workflow automatically trigger hota hai, SSH ke through AWS EC2 instance se connect karta hai, repository pull karta hai, aur `docker compose up -d --build` run karke zero manual effort ke sath production me deploy kar deta hai."*

---
*Created for Dev@nkkR — Intern Infotech Portal Project Reference*
