const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding comprehensive development database (10+ units per entity) for Intern Infotech Portal...');

  // 1. Clear existing seedable data in proper foreign key dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.examResultHistory.deleteMany({});
  await prisma.examResult.deleteMany({});
  await prisma.offlineExam.deleteMany({});
  await prisma.mockResult.deleteMany({});
  await prisma.mockInterview.deleteMany({});
  await prisma.feePayment.deleteMany({});
  await prisma.feeRecord.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.teacherAssignment.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.studentSuccessStory.deleteMany({});
  await prisma.registrationRequest.deleteMany({});
  await prisma.eligibleStudentEmail.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.course.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('SecurePass@2026', 10);

  // 2. Create Administrator
  const admin = await prisma.user.create({
    data: {
      email: 'admin@infotech.edu',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'Chief',
      lastName: 'Administrator',
      phone: '+91 98765 00001',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 3. Create 10 Faculty / Teachers
  console.log('Creating 10 Faculty members...');
  const teachersData = [
    {
      email: 'prof.sharma@infotech.edu',
      firstName: 'Vikram',
      lastName: 'Sharma',
      phone: '+91 98765 00002',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T101',
      specialization: 'Distributed Systems & Database Internals',
      qualifications: 'M.Tech (IIT Madras), Ex-Staff Engineer at Uber',
      bio: '12+ years of experience designing high-throughput distributed systems and teaching systems engineering.',
    },
    {
      email: 'dr.anita@infotech.edu',
      firstName: 'Anita',
      lastName: 'Deshmukh',
      phone: '+91 98765 00003',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T102',
      specialization: 'Full-Stack Architecture & Cloud Native Systems',
      qualifications: 'Ph.D. in Computer Science (IISc), Ex-Principal Architect',
      bio: 'Specialist in reactive UI architectures, micro-frontends, and enterprise cloud migrations.',
    },
    {
      email: 'dr.rajesh.verma@infotech.edu',
      firstName: 'Rajesh',
      lastName: 'Verma',
      phone: '+91 98765 00004',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T103',
      specialization: 'Advanced Algorithms & Computational Geometry',
      qualifications: 'Ph.D. in Algorithms (IIT Bombay), ICPC World Finals Coach',
      bio: 'Competitive programming mentor having trained 50+ students placed into FAANG core algorithms roles.',
    },
    {
      email: 'prof.meera.nair@infotech.edu',
      firstName: 'Meera',
      lastName: 'Nair',
      phone: '+91 98765 00005',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T104',
      specialization: 'Applied Machine Learning & GenAI Infrastructure',
      qualifications: 'M.S. in AI (Stanford University), Ex-Senior Research Scientist',
      bio: 'Focuses on deep neural architectures, LLM fine-tuning, and scalable inference pipelines.',
    },
    {
      email: 'prof.siddharth.roy@infotech.edu',
      firstName: 'Siddharth',
      lastName: 'Roy',
      phone: '+91 98765 00006',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T105',
      specialization: 'DevOps, SRE & Kubernetes Operations',
      qualifications: 'B.Tech (IIT Kharagpur), CKA / CKS Certified Architect',
      bio: 'Automated multi-region Kubernetes clusters handling 500k RPS for top fintech unicorns.',
    },
    {
      email: 'dr.kavita.rao@infotech.edu',
      firstName: 'Kavita',
      lastName: 'Rao',
      phone: '+91 98765 00007',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T106',
      specialization: 'Cybersecurity, Cryptography & Threat Modeling',
      qualifications: 'Ph.D. in Cyber Defense (IIT Delhi), CISSP & OSCP',
      bio: 'White-hat security researcher specializing in API security audits and zero-trust perimeter design.',
    },
    {
      email: 'prof.arun.kumar@infotech.edu',
      firstName: 'Arun',
      lastName: 'Kumar',
      phone: '+91 98765 00008',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T107',
      specialization: 'Mobile Systems Engineering & Cross-Platform UI',
      qualifications: 'M.S. in Software Systems (BITS Pilani), Ex-Meta Tech Lead',
      bio: 'Expert in high-performance React Native, native bridges, and offline-first mobile synchronization.',
    },
    {
      email: 'dr.sunita.patel@infotech.edu',
      firstName: 'Sunita',
      lastName: 'Patel',
      phone: '+91 98765 00009',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T108',
      specialization: 'Data Engineering, Spark & Real-time Kafka',
      qualifications: 'Ph.D. in Data Systems (CMU), Ex-Data Platform Lead at Grab',
      bio: 'Passionate about distributed streaming pipelines, Delta Lake architecture, and columnar storage.',
    },
    {
      email: 'prof.deepak.joshi@infotech.edu',
      firstName: 'Deepak',
      lastName: 'Joshi',
      phone: '+91 98765 00010',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T109',
      specialization: 'System Design & High-Scalability Architectures',
      qualifications: 'B.Tech (IIT Roorkee), 15+ years Enterprise Architect at Cisco',
      bio: 'Expert in multi-datacenter replication, caching hierarchies, and fault-tolerant microservice meshes.',
    },
    {
      email: 'prof.ananya.sen@infotech.edu',
      firstName: 'Ananya',
      lastName: 'Sen',
      phone: '+91 98765 00011',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
      employeeId: 'IIT-T110',
      specialization: 'Low-Latency Systems & Rust Concurrency',
      qualifications: 'M.Tech (IIT Kanpur), Ex-High Frequency Trading Infrastructure Dev',
      bio: 'Teaches memory safety, asynchronous runtimes (Tokio), and sub-millisecond query engines.',
    },
  ];

  const teachers = [];
  for (const t of teachersData) {
    const teacherUser = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash: defaultPasswordHash,
        role: 'TEACHER',
        status: 'ACTIVE',
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        avatarUrl: t.avatarUrl,
        teacherProfile: {
          create: {
            employeeId: t.employeeId,
            specialization: t.specialization,
            qualifications: t.qualifications,
            bio: t.bio,
          },
        },
      },
      include: { teacherProfile: true },
    });
    teachers.push(teacherUser);
  }

  // 4. Create 10 Enrolled Students
  console.log('Creating 10 Enrolled Students...');
  const studentsData = [
    {
      email: 'student@infotech.edu',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 98765 11111',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1001',
      rollNumber: 'R-1001',
      address: '42 Silicon Avenue, Koramangala 4th Block, Bengaluru',
      guardianName: 'Ramesh Sharma',
      guardianPhone: '+91 98765 99991',
    },
    {
      email: 'kavita.iyer@infotech.edu',
      firstName: 'Kavita',
      lastName: 'Iyer',
      phone: '+91 98765 11112',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1002',
      rollNumber: 'R-1002',
      address: '108 Indiranagar 100ft Road, Bengaluru',
      guardianName: 'S. Iyer',
      guardianPhone: '+91 98765 99992',
    },
    {
      email: 'arjun.nair@infotech.edu',
      firstName: 'Arjun',
      lastName: 'Nair',
      phone: '+91 98765 11113',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1003',
      rollNumber: 'R-1003',
      address: '55 HSR Layout Sector 2, Bengaluru',
      guardianName: 'Gopinath Nair',
      guardianPhone: '+91 98765 99993',
    },
    {
      email: 'sneha.patel@infotech.edu',
      firstName: 'Sneha',
      lastName: 'Patel',
      phone: '+91 98765 11114',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1004',
      rollNumber: 'R-1004',
      address: '12 Whitefield Main Road, Bengaluru',
      guardianName: 'Jayant Patel',
      guardianPhone: '+91 98765 99994',
    },
    {
      email: 'rohit.verma@infotech.edu',
      firstName: 'Rohit',
      lastName: 'Verma',
      phone: '+91 98765 11115',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1005',
      rollNumber: 'R-1005',
      address: '89 Malleshwaram 8th Cross, Bengaluru',
      guardianName: 'Anil Verma',
      guardianPhone: '+91 98765 99995',
    },
    {
      email: 'divya.menon@infotech.edu',
      firstName: 'Divya',
      lastName: 'Menon',
      phone: '+91 98765 11116',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1006',
      rollNumber: 'R-1006',
      address: '302 JP Nagar Phase 6, Bengaluru',
      guardianName: 'Pradeep Menon',
      guardianPhone: '+91 98765 99996',
    },
    {
      email: 'vikas.gupta@infotech.edu',
      firstName: 'Vikas',
      lastName: 'Gupta',
      phone: '+91 98765 11117',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1007',
      rollNumber: 'R-1007',
      address: '74 Bellandur Outer Ring Road, Bengaluru',
      guardianName: 'Sanjay Gupta',
      guardianPhone: '+91 98765 99997',
    },
    {
      email: 'ananya.joshi@infotech.edu',
      firstName: 'Ananya',
      lastName: 'Joshi',
      phone: '+91 98765 11118',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1008',
      rollNumber: 'R-1008',
      address: '15 Jayanagar 4th Block, Bengaluru',
      guardianName: 'Naveen Joshi',
      guardianPhone: '+91 98765 99998',
    },
    {
      email: 'manish.tiwari@infotech.edu',
      firstName: 'Manish',
      lastName: 'Tiwari',
      phone: '+91 98765 11119',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1009',
      rollNumber: 'R-1009',
      address: '99 Electronic City Phase 1, Bengaluru',
      guardianName: 'R. K. Tiwari',
      guardianPhone: '+91 98765 99999',
    },
    {
      email: 'pooja.deshmukh@infotech.edu',
      firstName: 'Pooja',
      lastName: 'Deshmukh',
      phone: '+91 98765 11120',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      enrollmentNumber: 'IIT-2026-S1010',
      rollNumber: 'R-1010',
      address: '21 BTM Layout 2nd Stage, Bengaluru',
      guardianName: 'Sharad Deshmukh',
      guardianPhone: '+91 98765 99900',
    },
  ];

  const students = [];
  for (const s of studentsData) {
    const studentUser = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        studentProfile: {
          create: {
            enrollmentNumber: s.enrollmentNumber,
            rollNumber: s.rollNumber,
            address: s.address,
            guardianName: s.guardianName,
            guardianPhone: s.guardianPhone,
          },
        },
      },
      include: { studentProfile: true },
    });
    students.push(studentUser);
  }

  // 5. Create 10 Authoritative Courses
  console.log('Creating 10 Courses...');
  const coursesData = [
    {
      title: 'Full-Stack Software Engineering',
      slug: 'full-stack-software-engineering',
      description: 'Master production software engineering from high-scale React interfaces and Node.js microservices to PostgreSQL schema optimization and Docker containerization.',
      duration: '24 Weeks (6 Months)',
      advertisedFee: 65000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 1,
      curriculum: [
        { module: 'Module 1: Advanced JavaScript Internals', topics: ['Event Loop', 'Prototypes', 'V8 Engine Optimization', 'Memory Leaks'] },
        { module: 'Module 2: Production React Architecture', topics: ['Custom Hooks', 'TanStack Query State', 'Performance Profiling', 'Tailwind Design Systems'] },
        { module: 'Module 3: Enterprise Express Microservices', topics: ['API Gateway', 'JWT & Cookie Security', 'RBAC Middleware', 'Rate Limiting'] },
        { module: 'Module 4: PostgreSQL & Prisma ORM', topics: ['Indexing Strategies', 'ACID Transactions', 'Connection Pooling', 'Prisma Migrations'] },
        { module: 'Module 5: Caching & Asynchronous Queues', topics: ['Redis Invalidation', 'BullMQ Worker Clusters', 'Idempotency'] },
        { module: 'Module 6: Cloud Deployment & Containers', topics: ['Docker Multi-stage Builds', 'Nginx Reverse Proxy', 'AWS EC2 Production Setup'] },
      ],
    },
    {
      title: 'Distributed Systems & Backend Engineering',
      slug: 'distributed-systems-backend-engineering',
      description: 'Deep dive into distributed systems fundamentals, consensus algorithms, event-driven architectures, Kafka pipelines, and low-latency database design.',
      duration: '16 Weeks (4 Months)',
      advertisedFee: 55000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 2,
      curriculum: [
        { module: 'Module 1: Network Protocols & RPC', topics: ['TCP/IP', 'gRPC', 'HTTP/2 & HTTP/3', 'Binary Serialization'] },
        { module: 'Module 2: Consensus & Partitioning', topics: ['Raft Algorithm', 'Consistent Hashing', 'CAP Theorem in Practice'] },
        { module: 'Module 3: Message Brokers & Streams', topics: ['Apache Kafka', 'Event Sourcing', 'Dead Letter Queues'] },
        { module: 'Module 4: High Availability Datastores', topics: ['Read Replicas', 'Sharding', 'Write-Ahead Logging'] },
      ],
    },
    {
      title: 'Advanced Data Structures & Algorithms',
      slug: 'advanced-data-structures-algorithms',
      description: 'Rigorous whiteboard and offline laboratory problem solving covering graphs, dynamic programming, segment trees, and system design interviews.',
      duration: '12 Weeks (3 Months)',
      advertisedFee: 40000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc66747d10e?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 3,
      curriculum: [
        { module: 'Module 1: Graphs & Trees', topics: ['Dijkstra', 'Tarjan SCC', 'Trie Structures', 'Segment Trees'] },
        { module: 'Module 2: Dynamic Programming', topics: ['Bitmask DP', 'Digit DP', 'Knapsack Variations', 'State Space Optimization'] },
        { module: 'Module 3: System Design Fundamentals', topics: ['Rate Limiters', 'Distributed Cache', 'URL Shortener at Scale'] },
      ],
    },
    {
      title: 'Cloud Native Engineering & DevOps',
      slug: 'cloud-native-devops',
      description: 'Hands-on offline mastery of Docker containerization, Kubernetes cluster orchestration, GitOps with ArgoCD, and Terraform infrastructure as code.',
      duration: '16 Weeks (4 Months)',
      advertisedFee: 50000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 4,
      curriculum: [
        { module: 'Module 1: Container Runtime & Docker', topics: ['Namespaces & Cgroups', 'Multi-stage builds', 'Rootless containers'] },
        { module: 'Module 2: Kubernetes In Depth', topics: ['Pod Scheduling', 'Ingress Controllers', 'StatefulSets & PVs'] },
        { module: 'Module 3: CI/CD & GitOps', topics: ['GitHub Actions Workflows', 'ArgoCD Sync', 'Helm Packaging'] },
      ],
    },
    {
      title: 'High-Scale System Design & Architecture',
      slug: 'system-design-architecture',
      description: 'Learn to architect systems handling 100M+ DAU: CDN topologies, write-behind caching, event sourcing, CQRS, and disaster recovery replication.',
      duration: '10 Weeks (2.5 Months)',
      advertisedFee: 45000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 5,
      curriculum: [
        { module: 'Module 1: Scalability Primitives', topics: ['Load Balancers', 'Consistent Hashing', 'Stateless Tier Scaling'] },
        { module: 'Module 2: Real-World Case Studies', topics: ['Designing WhatsApp Messaging', 'Netflix Video Streaming CDN', 'Uber Geohashing Dispatch'] },
      ],
    },
    {
      title: 'AI Systems & Applied Machine Learning',
      slug: 'ai-systems-machine-learning',
      description: 'Build enterprise GenAI and machine learning applications with PyTorch, LangChain, vector databases (Pinecone/pgvector), and low-latency LLM serving.',
      duration: '20 Weeks (5 Months)',
      advertisedFee: 70000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 6,
      curriculum: [
        { module: 'Module 1: Neural Networks Foundations', topics: ['Backpropagation', 'Embeddings', 'Transformers Architecture'] },
        { module: 'Module 2: Retrieval-Augmented Generation (RAG)', topics: ['Vector Embeddings', 'Chunking Strategies', 'Hybrid Search'] },
        { module: 'Module 3: Model Serving & Optimization', topics: ['vLLM', 'Quantization (AWQ/GGUF)', 'Model Fine-tuning LoRA'] },
      ],
    },
    {
      title: 'Production Cybersecurity & Network Defense',
      slug: 'cybersecurity-network-defense',
      description: 'Defensive and offensive engineering: web application penetration testing, zero-trust network architectures, cryptanalysis, and SOC incident triage.',
      duration: '14 Weeks (3.5 Months)',
      advertisedFee: 48000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      featured: false,
      published: true,
      displayOrder: 7,
      curriculum: [
        { module: 'Module 1: OWASP Top 10 Exploitation & Remediation', topics: ['SQL Injection', 'SSRF', 'IDOR', 'CSRF Tokens'] },
        { module: 'Module 2: Cryptographic Implementations', topics: ['AES-GCM', 'RSA & ECC', 'TLS Handshake Validation'] },
      ],
    },
    {
      title: 'Modern Mobile App Engineering with React Native',
      slug: 'mobile-app-engineering',
      description: 'Cross-platform native mobile engineering for iOS and Android with React Native, Reanimated 3, native modules, and offline SQLite synchronization.',
      duration: '12 Weeks (3 Months)',
      advertisedFee: 42000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      featured: false,
      published: true,
      displayOrder: 8,
      curriculum: [
        { module: 'Module 1: React Native Core & JSI', topics: ['TurboModules', 'Fabric Renderer', 'Gesture Handler'] },
        { module: 'Module 2: Offline-First Data', topics: ['WatermelonDB', 'Background Fetch', 'Push Notification Services'] },
      ],
    },
    {
      title: 'Low-Latency Database Internals & Performance',
      slug: 'database-internals-performance',
      description: 'Explore the internal engine mechanics of LSM-Trees, B+ Trees, WAL, buffer pools, query execution plans, and lock-free concurrency structures.',
      duration: '10 Weeks (2.5 Months)',
      advertisedFee: 45000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
      featured: false,
      published: true,
      displayOrder: 9,
      curriculum: [
        { module: 'Module 1: Storage Engine Internals', topics: ['Page Buffers', 'B+ Tree Splitting', 'LSM Compaction'] },
        { module: 'Module 2: Query Optimization', topics: ['Cost-based Optimizers', 'Bitmap Scans', 'Vacuuming & MVCC'] },
      ],
    },
    {
      title: 'Site Reliability Engineering & Observability',
      slug: 'sre-observability',
      description: 'Master SLOs, error budgets, distributed tracing with OpenTelemetry, Prometheus metrics, and automated chaos engineering with Gremlin.',
      duration: '12 Weeks (3 Months)',
      advertisedFee: 46000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      featured: false,
      published: true,
      displayOrder: 10,
      curriculum: [
        { module: 'Module 1: Telemetry & Tracing', topics: ['OpenTelemetry Collectors', 'Jaeger Tracing', 'PromQL Queries'] },
        { module: 'Module 2: Incident Management', topics: ['Post-mortem Runbooks', 'Chaos Mesh Tests', 'Automated Rollbacks'] },
      ],
    },
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({ data: c });
    courses.push(course);
  }

  // 6. Create 10 Batches
  console.log('Creating 10 Batches...');
  const batchesData = [
    {
      name: 'Full Stack Cohort 2026-Alpha',
      batchCode: 'FS-2026-A',
      courseIndex: 0,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-07-31'),
      timing: 'Monday – Friday | 9:30 AM – 1:30 PM (Offline Lab)',
      capacity: 35,
      status: 'ONGOING',
    },
    {
      name: 'Full Stack Evening Cohort 2026-Beta',
      batchCode: 'FS-2026-B',
      courseIndex: 0,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      timing: 'Monday – Friday | 5:30 PM – 8:30 PM (Lab & Lecture)',
      capacity: 30,
      status: 'UPCOMING',
    },
    {
      name: 'Distributed Systems Weekend 2026',
      batchCode: 'DS-2026-W1',
      courseIndex: 1,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-30'),
      timing: 'Saturday & Sunday | 10:00 AM – 4:00 PM',
      capacity: 25,
      status: 'ONGOING',
    },
    {
      name: 'DSA Masters Offline Bootcamp',
      batchCode: 'DSA-2026-M1',
      courseIndex: 2,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-04-15'),
      timing: 'Tuesday, Thursday, Saturday | 2:00 PM – 6:00 PM',
      capacity: 40,
      status: 'COMPLETED',
    },
    {
      name: 'Cloud Native & Kubernetes Spring 2026',
      batchCode: 'CN-2026-A',
      courseIndex: 3,
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-07-15'),
      timing: 'Mon, Wed, Fri | 10:00 AM – 2:00 PM',
      capacity: 30,
      status: 'ONGOING',
    },
    {
      name: 'High-Scale System Design Executive',
      batchCode: 'SD-2026-E1',
      courseIndex: 4,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-07-15'),
      timing: 'Sunday | 9:00 AM – 5:00 PM (Intensive Lab)',
      capacity: 25,
      status: 'UPCOMING',
    },
    {
      name: 'AI Engineering & LLMOps Alpha',
      batchCode: 'AI-2026-A',
      courseIndex: 5,
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-07-15'),
      timing: 'Mon – Fri | 2:30 PM – 6:30 PM (GPU Lab)',
      capacity: 28,
      status: 'ONGOING',
    },
    {
      name: 'Cybersecurity Blue/Red Team Lab',
      batchCode: 'SEC-2026-W1',
      courseIndex: 6,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-07-25'),
      timing: 'Saturday & Sunday | 9:30 AM – 3:30 PM',
      capacity: 20,
      status: 'UPCOMING',
    },
    {
      name: 'React Native Mobile Developers 2026',
      batchCode: 'MOB-2026-S1',
      courseIndex: 7,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-30'),
      timing: 'Mon, Wed, Fri | 3:00 PM – 7:00 PM',
      capacity: 30,
      status: 'ONGOING',
    },
    {
      name: 'Database Engine Internals Masterclass',
      batchCode: 'DB-2026-A',
      courseIndex: 8,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-15'),
      timing: 'Tuesday & Thursday | 6:00 PM – 9:00 PM',
      capacity: 25,
      status: 'UPCOMING',
    },
  ];

  const batches = [];
  for (const b of batchesData) {
    const batch = await prisma.batch.create({
      data: {
        name: b.name,
        batchCode: b.batchCode,
        courseId: courses[b.courseIndex].id,
        startDate: b.startDate,
        endDate: b.endDate,
        timing: b.timing,
        capacity: b.capacity,
        status: b.status,
      },
    });
    batches.push(batch);
  }

  // 7. Assign Teachers to Batches (10+ assignments)
  console.log('Creating Teacher Assignments...');
  const teacherAssignmentsData = [
    { teacherIndex: 0, batchIndex: 0, roleTitle: 'Lead Instructor (Backend & Architecture)' },
    { teacherIndex: 1, batchIndex: 0, roleTitle: 'Co-Instructor (Frontend & Cloud)' },
    { teacherIndex: 0, batchIndex: 2, roleTitle: 'Primary Systems Instructor' },
    { teacherIndex: 2, batchIndex: 3, roleTitle: 'Head Coach (DSA & Competitive Programming)' },
    { teacherIndex: 4, batchIndex: 4, roleTitle: 'Lead DevOps Mentor' },
    { teacherIndex: 8, batchIndex: 5, roleTitle: 'Distinguished Architect' },
    { teacherIndex: 3, batchIndex: 6, roleTitle: 'Lead AI & Machine Learning Scientist' },
    { teacherIndex: 5, batchIndex: 7, roleTitle: 'Chief Security Officer in Residence' },
    { teacherIndex: 6, batchIndex: 8, roleTitle: 'Lead Mobile Architect' },
    { teacherIndex: 9, batchIndex: 9, roleTitle: 'Low-Latency Engine Specialist' },
    { teacherIndex: 7, batchIndex: 2, roleTitle: 'Distributed Streaming Guest Faculty' },
  ];

  for (const ta of teacherAssignmentsData) {
    await prisma.teacherAssignment.create({
      data: {
        teacherId: teachers[ta.teacherIndex].teacherProfile.id,
        batchId: batches[ta.batchIndex].id,
        roleTitle: ta.roleTitle,
      },
    });
  }

  // 8. Enroll Students into Batches (12+ enrollments across all 10 students)
  console.log('Creating Student Enrollments...');
  const enrollmentsData = [
    { studentIndex: 0, batchIndex: 0, courseIndex: 0 }, // Rahul Sharma -> FS-2026-A
    { studentIndex: 1, batchIndex: 0, courseIndex: 0 }, // Kavita Iyer -> FS-2026-A
    { studentIndex: 2, batchIndex: 0, courseIndex: 0 }, // Arjun Nair -> FS-2026-A
    { studentIndex: 3, batchIndex: 0, courseIndex: 0 }, // Sneha Patel -> FS-2026-A
    { studentIndex: 4, batchIndex: 2, courseIndex: 1 }, // Rohit Verma -> DS-2026-W1
    { studentIndex: 5, batchIndex: 2, courseIndex: 1 }, // Divya Menon -> DS-2026-W1
    { studentIndex: 6, batchIndex: 4, courseIndex: 3 }, // Vikas Gupta -> CN-2026-A
    { studentIndex: 7, batchIndex: 4, courseIndex: 3 }, // Ananya Joshi -> CN-2026-A
    { studentIndex: 8, batchIndex: 6, courseIndex: 5 }, // Manish Tiwari -> AI-2026-A
    { studentIndex: 9, batchIndex: 8, courseIndex: 7 }, // Pooja Deshmukh -> MOB-2026-S1
    { studentIndex: 0, batchIndex: 3, courseIndex: 2 }, // Rahul Sharma -> also enrolled in DSA Bootcamp (completed)
    { studentIndex: 1, batchIndex: 3, courseIndex: 2 }, // Kavita Iyer -> also enrolled in DSA Bootcamp (completed)
  ];

  for (const e of enrollmentsData) {
    await prisma.enrollment.create({
      data: {
        studentId: students[e.studentIndex].studentProfile.id,
        batchId: batches[e.batchIndex].id,
        courseId: courses[e.courseIndex].id,
        status: 'ACTIVE',
      },
    });
  }

  // 9. Create 10 Fee Records
  console.log('Creating 10 Fee Records...');
  const feeRecordsData = [
    {
      studentIndex: 0,
      courseIndex: 0,
      batchIndex: 0,
      totalFee: 65000.0,
      paidAmount: 40000.0,
      balanceAmount: 25000.0,
      paymentStatus: 'PARTIAL',
      notes: 'Initial offline installment of ₹40,000 received via DD #4892. Balance due mid-term.',
      dueDate: new Date('2026-04-15'),
    },
    {
      studentIndex: 1,
      courseIndex: 0,
      batchIndex: 0,
      totalFee: 65000.0,
      paidAmount: 65000.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      notes: 'Full tuition fee paid in single settlement via NEFT #9938210. 5% merit discount applied.',
      dueDate: null,
    },
    {
      studentIndex: 2,
      courseIndex: 0,
      batchIndex: 0,
      totalFee: 65000.0,
      paidAmount: 35000.0,
      balanceAmount: 30000.0,
      paymentStatus: 'PARTIAL',
      notes: 'First installment cleared. Second installment due before final lab evaluations.',
      dueDate: new Date('2026-05-10'),
    },
    {
      studentIndex: 3,
      courseIndex: 0,
      batchIndex: 0,
      totalFee: 65000.0,
      paidAmount: 0.0,
      balanceAmount: 65000.0,
      paymentStatus: 'PENDING',
      notes: 'Provisional offline admission. Fee settlement pending guardian sanction.',
      dueDate: new Date('2026-03-30'),
    },
    {
      studentIndex: 4,
      courseIndex: 1,
      batchIndex: 2,
      totalFee: 55000.0,
      paidAmount: 55000.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      notes: 'Full corporate sponsorship payment cleared.',
      dueDate: null,
    },
    {
      studentIndex: 5,
      courseIndex: 1,
      batchIndex: 2,
      totalFee: 55000.0,
      paidAmount: 30000.0,
      balanceAmount: 25000.0,
      paymentStatus: 'PARTIAL',
      notes: 'Installment 1 of 2 settled offline at admissions desk.',
      dueDate: new Date('2026-04-20'),
    },
    {
      studentIndex: 6,
      courseIndex: 3,
      batchIndex: 4,
      totalFee: 50000.0,
      paidAmount: 50000.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      notes: 'UPI Transaction Ref: UPI-2026-448291. Fully cleared.',
      dueDate: null,
    },
    {
      studentIndex: 7,
      courseIndex: 3,
      batchIndex: 4,
      totalFee: 50000.0,
      paidAmount: 25000.0,
      balanceAmount: 25000.0,
      paymentStatus: 'PARTIAL',
      notes: 'Second installment pending next month.',
      dueDate: new Date('2026-05-01'),
    },
    {
      studentIndex: 8,
      courseIndex: 5,
      batchIndex: 6,
      totalFee: 70000.0,
      paidAmount: 70000.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      notes: 'Advanced AI GPU lab fee included and fully settled.',
      dueDate: null,
    },
    {
      studentIndex: 9,
      courseIndex: 7,
      batchIndex: 8,
      totalFee: 42000.0,
      paidAmount: 21000.0,
      balanceAmount: 21000.0,
      paymentStatus: 'PARTIAL',
      notes: 'Initial registration token received. Balance payable on module 2 start.',
      dueDate: new Date('2026-04-05'),
    },
  ];

  for (const fr of feeRecordsData) {
    const feeRec = await prisma.feeRecord.create({
      data: {
        studentId: students[fr.studentIndex].studentProfile.id,
        courseId: courses[fr.courseIndex].id,
        batchId: batches[fr.batchIndex].id,
        totalFee: fr.totalFee,
        paidAmount: fr.paidAmount,
        balanceAmount: fr.balanceAmount,
        paymentStatus: fr.paymentStatus,
        notes: fr.notes,
        dueDate: fr.dueDate,
      },
    });

    // Create realistic chronological FeePayment installments
    if (fr.paidAmount > 0) {
      if (fr.paidAmount >= 40000) {
        const half = fr.paidAmount / 2;
        await prisma.feePayment.create({
          data: {
            feeRecordId: feeRec.id,
            amount: half,
            paymentMethod: 'UPI',
            transactionRef: `UPI-2026-${Math.floor(100000 + Math.random() * 900000)}`,
            receiptNumber: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
            remarks: 'First installment paid at admission desk',
            paidAt: new Date('2026-01-15T10:30:00Z'),
            recordedById: admin.id,
          },
        });
        await prisma.feePayment.create({
          data: {
            feeRecordId: feeRec.id,
            amount: half,
            paymentMethod: 'BANK_TRANSFER',
            transactionRef: `NEFT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
            receiptNumber: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
            remarks: 'Second installment paid via online bank transfer',
            paidAt: new Date('2026-02-20T14:15:00Z'),
            recordedById: admin.id,
          },
        });
      } else {
        await prisma.feePayment.create({
          data: {
            feeRecordId: feeRec.id,
            amount: fr.paidAmount,
            paymentMethod: 'UPI',
            transactionRef: `UPI-2026-${Math.floor(100000 + Math.random() * 900000)}`,
            receiptNumber: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
            remarks: 'Initial course installment received',
            paidAt: new Date('2026-02-10T11:00:00Z'),
            recordedById: admin.id,
          },
        });
      }
    }
  }

  // 10. Create 10 Offline Examinations
  console.log('Creating 10 Offline Examinations...');
  const examsData = [
    {
      title: 'Full-Stack Mid-Term Lab Exam',
      subject: 'React Architecture & Express Microservices',
      courseIndex: 0,
      batchIndex: 0,
      examDate: new Date('2026-03-10'),
      maxMarks: 100.0,
      description: '3-hour offline supervised laboratory test requiring full implementation of an authenticated microservice and reactive UI component.',
      status: 'PUBLISHED',
      teacherIndex: 0,
      publishedAt: new Date('2026-03-12'),
    },
    {
      title: 'PostgreSQL Database Design & Query Tuning Quiz',
      subject: 'Relational Database Internals',
      courseIndex: 0,
      batchIndex: 0,
      examDate: new Date('2026-04-05'),
      maxMarks: 50.0,
      description: 'Offline written evaluation on schema normalization, index selection, and transaction isolation levels.',
      status: 'PUBLISHED',
      teacherIndex: 1,
      publishedAt: new Date('2026-04-07'),
    },
    {
      title: 'Distributed Consensus & Raft Implementation Lab',
      subject: 'Distributed Systems & Replication',
      courseIndex: 1,
      batchIndex: 2,
      examDate: new Date('2026-03-25'),
      maxMarks: 100.0,
      description: 'Laboratory practical: implement leader election and log replication with simulated network partitions.',
      status: 'PUBLISHED',
      teacherIndex: 0,
      publishedAt: new Date('2026-03-27'),
    },
    {
      title: 'DSA Comprehensive Graph & DP Final Examination',
      subject: 'Data Structures & Algorithms',
      courseIndex: 2,
      batchIndex: 3,
      examDate: new Date('2026-04-10'),
      maxMarks: 100.0,
      description: 'Supervised offline algorithmic test covering Tarjan SCC, max-flow, and multi-dimensional dynamic programming.',
      status: 'PUBLISHED',
      teacherIndex: 2,
      publishedAt: new Date('2026-04-12'),
    },
    {
      title: 'Kubernetes Cluster Deployment Practical Test',
      subject: 'Cloud Native Operations',
      courseIndex: 3,
      batchIndex: 4,
      examDate: new Date('2026-04-18'),
      maxMarks: 75.0,
      description: 'Debug failing pods, configure ingress SSL termination, and mount persistent volume claims on offline lab nodes.',
      status: 'PUBLISHED',
      teacherIndex: 4,
      publishedAt: new Date('2026-04-20'),
    },
    {
      title: 'High-Throughput Microservice Load Test Challenge',
      subject: 'System Scalability & Caching',
      courseIndex: 0,
      batchIndex: 0,
      examDate: new Date('2026-04-28'),
      maxMarks: 50.0,
      description: 'Benchmark and optimize a Node.js endpoint under 10,000 req/sec load using Redis and clustering.',
      status: 'PUBLISHED',
      teacherIndex: 0,
      publishedAt: new Date('2026-04-30'),
    },
    {
      title: 'RAG Pipeline & Embeddings Evaluation',
      subject: 'Applied Artificial Intelligence',
      courseIndex: 5,
      batchIndex: 6,
      examDate: new Date('2026-04-22'),
      maxMarks: 100.0,
      description: 'Construct a semantic search pipeline with reranking and evaluate hallucination rates against benchmark queries.',
      status: 'PUBLISHED',
      teacherIndex: 3,
      publishedAt: new Date('2026-04-24'),
    },
    {
      title: 'Mobile Architecture & Offline Sync Lab',
      subject: 'React Native & Mobile Systems',
      courseIndex: 7,
      batchIndex: 8,
      examDate: new Date('2026-03-28'),
      maxMarks: 50.0,
      description: 'Build an offline-first task tracker with background sync and SQLite storage.',
      status: 'PUBLISHED',
      teacherIndex: 6,
      publishedAt: new Date('2026-03-30'),
    },
    {
      title: 'Upcoming: Full-Stack Capstone Defense & Code Review',
      subject: 'Production Engineering Project',
      courseIndex: 0,
      batchIndex: 0,
      examDate: new Date('2026-05-15'),
      maxMarks: 100.0,
      description: 'Final viva, architecture presentation, and live demonstration before industry panel.',
      status: 'DRAFT',
      teacherIndex: 0,
      publishedAt: null,
    },
    {
      title: 'Upcoming: Kafka Stream Processing Offline Assessment',
      subject: 'Distributed Streaming & Event Sourcing',
      courseIndex: 1,
      batchIndex: 2,
      examDate: new Date('2026-05-20'),
      maxMarks: 75.0,
      description: 'Offline laboratory challenge implementing windowed aggregation and exactly-once processing semantics.',
      status: 'DRAFT',
      teacherIndex: 0,
      publishedAt: null,
    },
  ];

  const exams = [];
  for (const ex of examsData) {
    const exam = await prisma.offlineExam.create({
      data: {
        title: ex.title,
        subject: ex.subject,
        courseId: courses[ex.courseIndex].id,
        batchId: batches[ex.batchIndex].id,
        examDate: ex.examDate,
        maxMarks: ex.maxMarks,
        description: ex.description,
        status: ex.status,
        createdById: teachers[ex.teacherIndex].id,
        publishedById: ex.status === 'PUBLISHED' ? teachers[ex.teacherIndex].id : null,
        publishedAt: ex.publishedAt,
      },
    });
    exams.push(exam);
  }

  // 11. Create 15+ Exam Results (Rich data for charts & dashboards)
  console.log('Creating Exam Results & Performance Records...');
  const examResultsData = [
    // Rahul Sharma (studentIndex: 0) results across multiple exams
    { examIndex: 0, studentIndex: 0, marks: 94.0, max: 100.0, teacherIndex: 0, remarks: 'Outstanding implementation of JWT cookies, clean error handlers, and responsive Tailwind UI.' },
    { examIndex: 1, studentIndex: 0, marks: 47.0, max: 50.0, teacherIndex: 1, remarks: 'Flawless execution on indexing strategies and query explain plans.' },
    { examIndex: 3, studentIndex: 0, marks: 91.5, max: 100.0, teacherIndex: 2, remarks: 'Excellent grasp of topological sort and dynamic programming state transitions.' },
    { examIndex: 5, studentIndex: 0, marks: 48.0, max: 50.0, teacherIndex: 0, remarks: 'Sub-millisecond p99 latency achieved under high concurrency load.' },

    // Kavita Iyer (studentIndex: 1)
    { examIndex: 0, studentIndex: 1, marks: 88.5, max: 100.0, teacherIndex: 0, remarks: 'Very solid backend code. UI transitions can be optimized slightly.' },
    { examIndex: 1, studentIndex: 1, marks: 45.0, max: 50.0, teacherIndex: 1, remarks: 'Great answers on composite indexing and partial index tradeoffs.' },
    { examIndex: 3, studentIndex: 1, marks: 96.0, max: 100.0, teacherIndex: 2, remarks: 'Top score in cohort! Code structure was exceptionally clean.' },
    { examIndex: 5, studentIndex: 1, marks: 44.0, max: 50.0, teacherIndex: 0, remarks: 'Good optimization using memory caching and cluster worker processes.' },

    // Arjun Nair (studentIndex: 2)
    { examIndex: 0, studentIndex: 2, marks: 82.0, max: 100.0, teacherIndex: 0, remarks: 'Good architecture; ensure error boundary captures all async rejects.' },
    { examIndex: 1, studentIndex: 2, marks: 39.0, max: 50.0, teacherIndex: 1, remarks: 'Review B+ Tree depth calculations and foreign key constraints.' },
    { examIndex: 5, studentIndex: 2, marks: 41.5, max: 50.0, teacherIndex: 0, remarks: 'Handled 5,000 req/sec smoothly without dropouts.' },

    // Sneha Patel (studentIndex: 3)
    { examIndex: 0, studentIndex: 3, marks: 91.0, max: 100.0, teacherIndex: 0, remarks: 'Exceptional UI elegance and well-structured React hooks.' },
    { examIndex: 1, studentIndex: 3, marks: 46.5, max: 50.0, teacherIndex: 1, remarks: 'Clear understanding of ACID isolation levels.' },

    // Rohit Verma (studentIndex: 4)
    { examIndex: 2, studentIndex: 4, marks: 89.0, max: 100.0, teacherIndex: 0, remarks: 'Raft election timeouts and heartbeat handling were flawlessly tested.' },

    // Divya Menon (studentIndex: 5)
    { examIndex: 2, studentIndex: 5, marks: 93.5, max: 100.0, teacherIndex: 0, remarks: 'Exemplary distributed state machine implementation.' },

    // Vikas Gupta (studentIndex: 6)
    { examIndex: 4, studentIndex: 6, marks: 71.0, max: 75.0, teacherIndex: 4, remarks: 'Fastest pod troubleshooting in the entire laboratory cohort.' },

    // Ananya Joshi (studentIndex: 7)
    { examIndex: 4, studentIndex: 7, marks: 68.5, max: 75.0, teacherIndex: 4, remarks: 'Very methodical ingress debugging and certificate setup.' },

    // Manish Tiwari (studentIndex: 8)
    { examIndex: 6, studentIndex: 8, marks: 92.0, max: 100.0, teacherIndex: 3, remarks: 'Semantic hybrid search achieved 98% relevant recall on test dataset.' },

    // Pooja Deshmukh (studentIndex: 9)
    { examIndex: 7, studentIndex: 9, marks: 46.0, max: 50.0, teacherIndex: 6, remarks: 'Fluid animations and zero dropped frames during sqlite batch transactions.' },
  ];

  for (const r of examResultsData) {
    const percentage = Number(((r.marks / r.max) * 100).toFixed(1));
    await prisma.examResult.create({
      data: {
        examId: exams[r.examIndex].id,
        studentId: students[r.studentIndex].studentProfile.id,
        marksObtained: r.marks,
        percentage: percentage,
        remarks: r.remarks,
        status: 'PUBLISHED',
        enteredById: teachers[r.teacherIndex].id,
      },
    });
  }

  // 11b. Create 10 Simplified Mock Interviews (Scored strictly out of 35 marks)
  console.log('Creating 10 Mock Interviews & Mock Results (out of 35 marks)...');
  const mockInterviewsData = [
    {
      title: 'Full-Stack Architecture & Microservices Mock',
      date: new Date('2026-10-15T10:00:00Z'),
      courseIndex: 0,
      batchIndex: 0,
      description: 'System design interview focusing on API Gateway routing, authentication tokens, and React render performance.',
    },
    {
      title: 'React Custom Hooks & Frontend State Mock',
      date: new Date('2026-10-08T14:30:00Z'),
      courseIndex: 0,
      batchIndex: 0,
      description: 'Live coding session evaluating debounce hooks, React Query caching, and Tailwind layout responsiveness.',
    },
    {
      title: 'Node.js Event Loop & Redis Pub/Sub Mock',
      date: new Date('2026-09-24T11:00:00Z'),
      courseIndex: 0,
      batchIndex: 0,
      description: 'Backend interview examining asynchronous event streams, message queuing, and connection pooling.',
    },
    {
      title: 'Distributed Consensus & Replication Mock',
      date: new Date('2026-09-18T10:00:00Z'),
      courseIndex: 1,
      batchIndex: 2,
      description: 'In-depth assessment of Raft leader election, WAL logs, and split-brain resolution strategies.',
    },
    {
      title: 'PostgreSQL Indexing & ACID Transactions Mock',
      date: new Date('2026-09-05T15:00:00Z'),
      courseIndex: 0,
      batchIndex: 0,
      description: 'Database mock interview testing query explain plans, composite indexes, and isolation anomalies.',
    },
    {
      title: 'Graph Traversal & Dynamic Programming Mock',
      date: new Date('2026-08-28T09:30:00Z'),
      courseIndex: 2,
      batchIndex: 3,
      description: 'Whiteboard algorithmic interview evaluating DAG shortest path and 2D dynamic programming memoization.',
    },
    {
      title: 'Kubernetes Pod Networking & SRE Mock',
      date: new Date('2026-08-14T11:30:00Z'),
      courseIndex: 3,
      batchIndex: 4,
      description: 'Production cluster triage: service discovery, ingress TLS, and crashlooping container remediation.',
    },
    {
      title: 'RESTful API Design & Security Defenses Mock',
      date: new Date('2026-07-28T14:00:00Z'),
      courseIndex: 0,
      batchIndex: 0,
      description: 'Comprehensive evaluation of JWT security, CORS policies, rate limiting, and HTTP error standards.',
    },
    {
      title: 'RAG Architecture & Semantic Search Mock',
      date: new Date('2026-07-15T16:00:00Z'),
      courseIndex: 5,
      batchIndex: 6,
      description: 'Evaluating vector embeddings, chunking strategies, and hybrid retrieval with cross-encoder rerankers.',
    },
    {
      title: 'Mobile State Management & Offline Cache Mock',
      date: new Date('2026-06-25T10:30:00Z'),
      courseIndex: 7,
      batchIndex: 8,
      description: 'Technical evaluation of SQLite local persistence, asynchronous background sync, and bundle optimization.',
    },
  ];

  const mockInterviews = [];
  for (const mi of mockInterviewsData) {
    const createdInterview = await prisma.mockInterview.create({
      data: {
        title: mi.title,
        date: mi.date,
        courseId: courses[mi.courseIndex].id,
        batchId: batches[mi.batchIndex].id,
        totalMarks: 35.0,
        description: mi.description,
        conductedById: teachers[0].id,
      },
    });
    mockInterviews.push(createdInterview);
  }

  // Student mock scores (strictly out of 35 marks)
  const mockScores = [
    // Rahul Sharma (studentIndex: 0) — multiple tests across months
    { mockIndex: 0, studentIndex: 0, marks: 32.5, feedback: 'Superb architecture breakdown. Handled Redis fallback questions effortlessly.' },
    { mockIndex: 1, studentIndex: 0, marks: 31.0, feedback: 'Clean React code. Great explanation of stale-while-revalidate caching.' },
    { mockIndex: 2, studentIndex: 0, marks: 33.0, feedback: 'Demonstrated exceptional mastery over Node.js libuv event loops.' },
    { mockIndex: 4, studentIndex: 0, marks: 30.5, feedback: 'Strong SQL reasoning. Clearly explained B-Tree page splits.' },
    { mockIndex: 7, studentIndex: 0, marks: 29.0, feedback: 'Good security considerations; review strict HTTPS HSTS headers.' },

    // Kavita Iyer (studentIndex: 1)
    { mockIndex: 0, studentIndex: 1, marks: 30.0, feedback: 'Solid grasp of microservice patterns and distributed tracing.' },
    { mockIndex: 1, studentIndex: 1, marks: 34.0, feedback: 'Flawless frontend live coding! Exceptional component modularity.' },
    { mockIndex: 2, studentIndex: 1, marks: 28.5, feedback: 'Good grasp of pub/sub; improve consumer error retry semantics.' },
    { mockIndex: 4, studentIndex: 1, marks: 31.5, feedback: 'Precise indexing tradeoffs and foreign key cascade explanations.' },
    { mockIndex: 7, studentIndex: 1, marks: 32.0, feedback: 'Excellent API error schema and input sanitization practices.' },

    // Arjun Nair (studentIndex: 2)
    { mockIndex: 0, studentIndex: 2, marks: 27.5, feedback: 'Understood caching well; practice diagramming message flows cleanly.' },
    { mockIndex: 1, studentIndex: 2, marks: 28.0, feedback: 'Good code; work on optimizing unnecessary re-renders in deep trees.' },
    { mockIndex: 2, studentIndex: 2, marks: 26.5, feedback: 'Brush up on cluster worker IPC messaging.' },
    { mockIndex: 4, studentIndex: 2, marks: 29.0, feedback: 'Solid explanation of WAL logs and dirty page checkpoints.' },

    // Sneha Patel (studentIndex: 3)
    { mockIndex: 0, studentIndex: 3, marks: 33.5, feedback: 'Top tier whiteboard communication. Highlighted all edge cases upfront.' },
    { mockIndex: 1, studentIndex: 3, marks: 32.0, feedback: 'Very elegant TypeScript interfaces and custom hooks.' },
    { mockIndex: 2, studentIndex: 3, marks: 30.5, feedback: 'Great job explaining backpressure in Node streams.' },

    // Rohit Verma (studentIndex: 4)
    { mockIndex: 3, studentIndex: 4, marks: 31.0, feedback: 'Flawless walkthrough of 2-phase commit and Raft heartbeat timers.' },

    // Divya Menon (studentIndex: 5)
    { mockIndex: 3, studentIndex: 5, marks: 33.0, feedback: 'Top score in distributed systems cohort. Exceptional depth.' },

    // Vikas Gupta (studentIndex: 6)
    { mockIndex: 6, studentIndex: 6, marks: 29.5, feedback: 'Very rapid pod debugging; accurate DNS diagnostic commands.' },

    // Ananya Joshi (studentIndex: 7)
    { mockIndex: 6, studentIndex: 7, marks: 31.5, feedback: 'Methodical ingress setup and automated cert-manager review.' },

    // Manish Tiwari (studentIndex: 8)
    { mockIndex: 8, studentIndex: 8, marks: 32.0, feedback: 'Clear explanation of cosine similarity vs dot product in high dimensions.' },

    // Pooja Deshmukh (studentIndex: 9)
    { mockIndex: 9, studentIndex: 9, marks: 30.0, feedback: 'Clean SQLite transaction handling and smooth 60fps gesture handling.' },
  ];

  for (const ms of mockScores) {
    const marks = ms.marks;
    const percentage = Math.round((marks / 35.0) * 100 * 10) / 10;
    await prisma.mockResult.create({
      data: {
        mockInterviewId: mockInterviews[ms.mockIndex].id,
        studentId: students[ms.studentIndex].studentProfile.id,
        marksObtained: marks,
        percentage,
        feedback: ms.feedback,
        status: 'PUBLISHED',
        enteredById: teachers[0].id,
      },
    });
  }

  // 12. Create 10 Announcements
  console.log('Creating 10 Announcements...');
  const announcementsData = [
    {
      title: 'Offline Lab Infrastructure Upgrade: Dedicated Multi-Node Redis Clusters',
      body: 'We have upgraded all laboratory workstations with dedicated local container environments and high-speed multi-node Redis clusters. Students can now test high-concurrency pub/sub and distributed lock scenarios in offline sessions.',
      targetType: 'ALL',
      priority: 'HIGH',
      authorId: admin.id,
    },
    {
      title: 'Full Stack Cohort Alpha: Offline Project Showcase Scheduled',
      body: 'All students enrolled in Full Stack Cohort 2026-Alpha are required to present their capstone microservices architecture to visiting tech leads from leading startups on Saturday, April 25th at 10:00 AM in Lab 3.',
      targetType: 'BATCH',
      targetBatchIndex: 0,
      priority: 'URGENT',
      authorId: teachers[0].id,
    },
    {
      title: 'Guest Lecture by Google Staff Engineer on Cloud Native Reliability',
      body: 'Join us this Friday at 5:00 PM in Seminar Hall 1 for an exclusive interactive session on building self-healing distributed systems on Kubernetes. Offline attendance is mandatory for Distributed Systems and DevOps batches.',
      targetType: 'ALL',
      priority: 'MEDIUM',
      authorId: admin.id,
    },
    {
      title: 'Distributed Systems Cohort: Practical Consensus Benchmark Session',
      body: 'Please ensure your local Git repositories are synced. We will test Byzantine fault scenarios during this Saturday\'s lab from 11:00 AM onwards.',
      targetType: 'BATCH',
      targetBatchIndex: 2,
      priority: 'HIGH',
      authorId: teachers[0].id,
    },
    {
      title: 'DSA Comprehensive Exam Results Published',
      body: 'Marks and examiner remarks for the DSA Comprehensive Graph & DP Final Examination have been released. Please review your performance analytics on your student dashboard.',
      targetType: 'COURSE',
      targetCourseIndex: 2,
      priority: 'MEDIUM',
      authorId: teachers[2].id,
    },
    {
      title: 'Annual Tech Symposium: Hack-A-System 2026 Announced',
      body: 'Registration for the 48-hour offline microservices hackathon is now open. Prizes worth ₹2,50,000 sponsored by tech partners. Form teams of up to 3 students.',
      targetType: 'ALL',
      priority: 'HIGH',
      authorId: admin.id,
    },
    {
      title: 'Notice Regarding Fee Payment Deadline for Mid-Term Installments',
      body: 'Students with pending mid-term tuition balances are requested to clear accounts at the administrative desk or online by April 15th to prevent exam registration holds.',
      targetType: 'ALL',
      priority: 'MEDIUM',
      authorId: admin.id,
    },
    {
      title: 'AI Engineering Batch: Cloud GPU Quota Allocated',
      body: 'Each student in AI-2026-A has received 50 dedicated NVIDIA A100 GPU compute hours for training custom LLM adapters and embedding benchmarks.',
      targetType: 'BATCH',
      targetBatchIndex: 6,
      priority: 'HIGH',
      authorId: teachers[3].id,
    },
    {
      title: 'Individual Academic Commendation: Top Score in Relational Internals',
      body: 'Congratulations to Rahul Sharma for achieving the highest marks in the PostgreSQL Database Design evaluation.',
      targetType: 'INDIVIDUAL',
      targetStudentIndex: 0,
      priority: 'LOW',
      authorId: teachers[1].id,
    },
    {
      title: 'Library & Reading Room Extended Hours for Exam Preparation',
      body: 'The offline technical library will remain open until 10:00 PM on all weekdays throughout the upcoming final examination period.',
      targetType: 'ALL',
      priority: 'LOW',
      authorId: admin.id,
    },
  ];

  for (const an of announcementsData) {
    await prisma.announcement.create({
      data: {
        title: an.title,
        body: an.body,
        targetType: an.targetType,
        targetBatchId: an.targetBatchIndex !== undefined ? batches[an.targetBatchIndex].id : null,
        targetCourseId: an.targetCourseIndex !== undefined ? courses[an.targetCourseIndex].id : null,
        targetStudentId: an.targetStudentIndex !== undefined ? students[an.targetStudentIndex].studentProfile.id : null,
        priority: an.priority,
        authorId: an.authorId,
        isPublished: true,
      },
    });
  }

  // 13. Create 10 Student Success Stories
  console.log('Creating 10 Student Success Stories...');
  const successStoriesData = [
    {
      studentName: 'Aarav Mehta',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Full-Stack Software Engineering',
      jobTitle: 'Software Development Engineer II',
      companyName: 'Amazon Web Services',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
      packageLPA: '34 LPA',
      placementYear: 2025,
      testimonial: 'The hands-on offline laboratory sessions at Intern Infotech were transformative. Instead of watching videos, we wrote production microservices and debugged real concurrency bottlenecks. That gave me the confidence to ace AWS rounds.',
      featured: true,
      published: true,
      displayOrder: 1,
    },
    {
      studentName: 'Shreya Kapoor',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Distributed Systems & Backend Engineering',
      jobTitle: 'Backend Infrastructure Engineer',
      companyName: 'Razorpay',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
      packageLPA: '28 LPA',
      placementYear: 2025,
      testimonial: 'The curriculum dives deep into distributed primitives and database transactions. The mentors are veteran engineers who challenge your architectural decisions every single day in class.',
      featured: true,
      published: true,
      displayOrder: 2,
    },
    {
      studentName: 'Karthik Subramanian',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Advanced DSA & Systems Engineering',
      jobTitle: 'Software Engineer - Core Platform',
      companyName: 'Microsoft',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg',
      packageLPA: '38 LPA',
      placementYear: 2025,
      testimonial: 'Whiteboard problem solving coupled with real system design projects set Intern Infotech apart. You do not just memorize algorithms; you understand cache behavior and memory tradeoffs.',
      featured: true,
      published: true,
      displayOrder: 3,
    },
    {
      studentName: 'Priyanka Sen',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Cloud Native Engineering & DevOps',
      jobTitle: 'Site Reliability Engineer',
      companyName: 'Google Cloud',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
      packageLPA: '42 LPA',
      placementYear: 2025,
      testimonial: 'The Kubernetes offline labs with real cluster outages prepared me for the toughest SRE interview scenarios. Best career investment ever.',
      featured: true,
      published: true,
      displayOrder: 4,
    },
    {
      studentName: 'Tanmay Kulkarni',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Full-Stack Software Engineering',
      jobTitle: 'Senior Full Stack Engineer',
      companyName: 'Uber',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      packageLPA: '36 LPA',
      placementYear: 2025,
      testimonial: 'Learning microservices with an API gateway, cookie-based security, and Redis rate limiting was what enabled me to clear Uber bar raiser.',
      featured: false,
      published: true,
      displayOrder: 5,
    },
    {
      studentName: 'Rhea Chakraborty',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'AI Systems & Applied Machine Learning',
      jobTitle: 'Machine Learning Engineer',
      companyName: 'Atlassian',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      packageLPA: '32 LPA',
      placementYear: 2025,
      testimonial: 'The focus on production ML serving and RAG architectures rather than just toy Jupyter notebooks gave me a huge competitive edge.',
      featured: false,
      published: true,
      displayOrder: 6,
    },
    {
      studentName: 'Nikhil Saxena',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Advanced Data Structures & Algorithms',
      jobTitle: 'Software Engineer',
      companyName: 'Flipkart',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      packageLPA: '26 LPA',
      placementYear: 2024,
      testimonial: 'Daily algorithmic problem solving in physical lab batches under top instructors built my problem decomposition skills.',
      featured: false,
      published: true,
      displayOrder: 7,
    },
    {
      studentName: 'Meghna Roy',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Production Cybersecurity & Network Defense',
      jobTitle: 'Security Operations Analyst II',
      companyName: 'CrowdStrike',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
      packageLPA: '29 LPA',
      placementYear: 2025,
      testimonial: 'The hands-on packet inspection and vulnerability remediation labs gave me practical experience that certifications simply cannot match.',
      featured: false,
      published: true,
      displayOrder: 8,
    },
    {
      studentName: 'Aditya Bansal',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Modern Mobile App Engineering',
      jobTitle: 'Mobile Lead Engineer',
      companyName: 'Swiggy',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      packageLPA: '31 LPA',
      placementYear: 2025,
      testimonial: 'Mastering React Native native modules and low-level thread architecture enabled me to build silky 60fps applications.',
      featured: false,
      published: true,
      displayOrder: 9,
    },
    {
      studentName: 'Devika Pillai',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Distributed Systems & Backend Engineering',
      jobTitle: 'Infrastructure Software Engineer',
      companyName: 'Salesforce',
      companyLogoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
      packageLPA: '35 LPA',
      placementYear: 2025,
      testimonial: 'Intern Infotech is the gold standard for backend engineering. You do not just write code; you measure its exact system call impact.',
      featured: false,
      published: true,
      displayOrder: 10,
    },
  ];

  await prisma.studentSuccessStory.createMany({ data: successStoriesData });

  // 14. Create 10 Authoritative Eligible Student Emails (Offline admissions)
  console.log('Creating 10 Eligible Student Admissions...');
  const eligibleEmailsData = [
    {
      email: 'student@infotech.edu',
      fullName: 'Rahul Sharma',
      offlineRegNumber: 'OFF-2026-001',
      phone: '+91 98765 11111',
      courseHint: 'Full-Stack Software Engineering',
      isRegistered: true,
    },
    {
      email: 'kavita.iyer@infotech.edu',
      fullName: 'Kavita Iyer',
      offlineRegNumber: 'OFF-2026-002',
      phone: '+91 98765 11112',
      courseHint: 'Full-Stack Software Engineering',
      isRegistered: true,
    },
    {
      email: 'arjun.nair@infotech.edu',
      fullName: 'Arjun Nair',
      offlineRegNumber: 'OFF-2026-003',
      phone: '+91 98765 11113',
      courseHint: 'Full-Stack Software Engineering',
      isRegistered: true,
    },
    {
      email: 'priya.singh@gmail.com',
      fullName: 'Priya Singh',
      offlineRegNumber: 'OFF-2026-004',
      phone: '+91 98765 22201',
      courseHint: 'Distributed Systems & Backend Engineering',
      isRegistered: false,
    },
    {
      email: 'amit.patel@gmail.com',
      fullName: 'Amit Patel',
      offlineRegNumber: 'OFF-2026-005',
      phone: '+91 98765 22202',
      courseHint: 'Advanced Data Structures & Algorithms',
      isRegistered: false,
    },
    {
      email: 'sneha.reddy@gmail.com',
      fullName: 'Sneha Reddy',
      offlineRegNumber: 'OFF-2026-006',
      phone: '+91 98765 22203',
      courseHint: 'Cloud Native Engineering & DevOps',
      isRegistered: false,
    },
    {
      email: 'karan.malhotra@gmail.com',
      fullName: 'Karan Malhotra',
      offlineRegNumber: 'OFF-2026-007',
      phone: '+91 98765 22204',
      courseHint: 'AI Systems & Applied Machine Learning',
      isRegistered: false,
    },
    {
      email: 'ritika.das@gmail.com',
      fullName: 'Ritika Das',
      offlineRegNumber: 'OFF-2026-008',
      phone: '+91 98765 22205',
      courseHint: 'Production Cybersecurity & Network Defense',
      isRegistered: false,
    },
    {
      email: 'siddharth.bose@gmail.com',
      fullName: 'Siddharth Bose',
      offlineRegNumber: 'OFF-2026-009',
      phone: '+91 98765 22206',
      courseHint: 'Modern Mobile App Engineering',
      isRegistered: false,
    },
    {
      email: 'neha.sharma@gmail.com',
      fullName: 'Neha Sharma',
      offlineRegNumber: 'OFF-2026-010',
      phone: '+91 98765 22207',
      courseHint: 'Low-Latency Database Internals',
      isRegistered: false,
    },
  ];

  for (const ee of eligibleEmailsData) {
    await prisma.eligibleStudentEmail.create({
      data: {
        ...ee,
        addedByAdminId: admin.id,
      },
    });
  }

  // 15. Create 10 Registration Requests (PENDING, APPROVED, REJECTED for students & teachers)
  console.log('Creating 10 Registration Requests...');
  const registrationRequestsData = [
    {
      email: 'priya.singh@gmail.com',
      fullName: 'Priya Singh',
      phone: '+91 98765 22201',
      role: 'STUDENT',
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      targetCourseId: courses[1].id,
    },
    {
      email: 'amit.patel@gmail.com',
      fullName: 'Amit Patel',
      phone: '+91 98765 22202',
      role: 'STUDENT',
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      targetCourseId: courses[2].id,
    },
    {
      email: 'dr.harish.chandra@gmail.com',
      fullName: 'Dr. Harish Chandra',
      phone: '+91 98765 33301',
      role: 'TEACHER',
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      targetCourseId: null,
    },
    {
      email: 'sneha.reddy@gmail.com',
      fullName: 'Sneha Reddy',
      phone: '+91 98765 22203',
      role: 'STUDENT',
      isEmailVerified: true,
      status: 'APPROVED',
      reviewNote: 'Verified with offline admission slip #OFF-2026-006. Enrolled.',
      reviewerId: admin.id,
      reviewedAt: new Date('2026-03-01'),
      targetCourseId: courses[3].id,
    },
    {
      email: 'karan.malhotra@gmail.com',
      fullName: 'Karan Malhotra',
      phone: '+91 98765 22204',
      role: 'STUDENT',
      isEmailVerified: true,
      status: 'APPROVED',
      reviewNote: 'Offline documents verified.',
      reviewerId: admin.id,
      reviewedAt: new Date('2026-03-05'),
      targetCourseId: courses[5].id,
    },
    {
      email: 'fake.applicant@tempmail.com',
      fullName: 'Anonymous Test',
      phone: '+91 98765 00999',
      role: 'STUDENT',
      isEmailVerified: false,
      status: 'REJECTED',
      reviewNote: 'Unverified email address and no matching offline enrollment record found.',
      reviewerId: admin.id,
      reviewedAt: new Date('2026-03-10'),
      targetCourseId: courses[0].id,
    },
    {
      email: 'ritika.das@gmail.com',
      fullName: 'Ritika Das',
      phone: '+91 98765 22205',
      role: 'STUDENT',
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      targetCourseId: courses[6].id,
    },
    {
      email: 'siddharth.bose@gmail.com',
      fullName: 'Siddharth Bose',
      phone: '+91 98765 22206',
      role: 'STUDENT',
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      targetCourseId: courses[7].id,
    },
    {
      email: 'prof.rohit.shukla@yahoo.com',
      fullName: 'Prof. Rohit Shukla',
      phone: '+91 98765 33302',
      role: 'TEACHER',
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      targetCourseId: null,
    },
    {
      email: 'spam.bot99@domain.xyz',
      fullName: 'Unknown Spammer',
      phone: '+1 555 123456',
      role: 'STUDENT',
      isEmailVerified: false,
      status: 'REJECTED',
      reviewNote: 'Automated spam detection filter triggered.',
      reviewerId: admin.id,
      reviewedAt: new Date('2026-03-15'),
      targetCourseId: courses[0].id,
    },
  ];

  for (const rr of registrationRequestsData) {
    await prisma.registrationRequest.create({
      data: {
        email: rr.email,
        fullName: rr.fullName,
        phone: rr.phone,
        role: rr.role,
        passwordHash: defaultPasswordHash,
        isEmailVerified: rr.isEmailVerified,
        status: rr.status,
        reviewNote: rr.reviewNote,
        reviewerId: rr.reviewerId,
        reviewedAt: rr.reviewedAt,
        targetCourseId: rr.targetCourseId,
      },
    });
  }

  // 16. Create 10+ Audit Logs
  console.log('Creating Audit Logs...');
  const auditLogsData = [
    {
      userId: admin.id,
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'System',
      entityId: 'global',
      details: { message: 'Database initialized with seed data' },
      ipAddress: '127.0.0.1',
      userAgent: 'Portal-Seed-Engine/1.0',
    },
    {
      userId: admin.id,
      action: 'COURSE_CREATED',
      entity: 'Course',
      entityId: courses[0].id,
      details: { title: courses[0].title, slug: courses[0].slug },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'BATCH_CREATED',
      entity: 'Batch',
      entityId: batches[0].id,
      details: { batchCode: batches[0].batchCode, capacity: batches[0].capacity },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: teachers[0].id,
      action: 'EXAM_CREATED',
      entity: 'OfflineExam',
      entityId: exams[0].id,
      details: { title: exams[0].title, maxMarks: exams[0].maxMarks },
      ipAddress: '192.168.1.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: teachers[0].id,
      action: 'EXAM_PUBLISHED',
      entity: 'OfflineExam',
      entityId: exams[0].id,
      details: { title: exams[0].title, publishedAt: new Date('2026-03-12') },
      ipAddress: '192.168.1.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: teachers[0].id,
      action: 'MARKS_ENTERED',
      entity: 'ExamResult',
      entityId: exams[0].id,
      details: { studentEmail: students[0].email, marksObtained: 94.0 },
      ipAddress: '192.168.1.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'STUDENT_APPROVED',
      entity: 'RegistrationRequest',
      entityId: 'reg-004',
      details: { studentEmail: 'sneha.reddy@gmail.com', verifiedOffline: true },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'ANNOUNCEMENT_POSTED',
      entity: 'Announcement',
      entityId: 'ann-001',
      details: { title: 'Offline Lab Infrastructure Upgrade', priority: 'HIGH' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'FEE_PAYMENT_RECORDED',
      entity: 'FeeRecord',
      entityId: 'fee-001',
      details: { studentEmail: students[0].email, amount: 40000.0, mode: 'DD' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'ELIGIBLE_EMAIL_WHITELISTED',
      entity: 'EligibleStudentEmail',
      entityId: 'off-004',
      details: { email: 'priya.singh@gmail.com', offlineRegNumber: 'OFF-2026-004' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  ];

  for (const al of auditLogsData) {
    await prisma.auditLog.create({ data: al });
  }

  console.log('\n====================================================');
  console.log(' SEED DATA SUCCESSFULLY POPULATED (10+ UNITS PER ENTITY)');
  console.log('====================================================');
  console.log('Accounts Summary:');
  console.log('  - 1 System Administrator  : admin@infotech.edu       / SecurePass@2026');
  console.log('  - 10 Faculty Members      : prof.sharma@infotech.edu / SecurePass@2026');
  console.log('                            : dr.anita@infotech.edu    / SecurePass@2026');
  console.log('                            : (prof. 101 to 110 all active)');
  console.log('  - 10 Enrolled Students    : student@infotech.edu     / SecurePass@2026 (Roll: R-1001)');
  console.log('                            : kavita.iyer@infotech.edu / SecurePass@2026 (Roll: R-1002)');
  console.log('                            : arjun.nair@infotech.edu  / SecurePass@2026 (Roll: R-1003)');
  console.log('                            : (... through R-1010)');
  console.log('Entities Created:');
  console.log(`  - Courses              : ${courses.length}`);
  console.log(`  - Batches              : ${batches.length}`);
  console.log(`  - Teacher Assignments  : ${teacherAssignmentsData.length}`);
  console.log(`  - Student Enrollments  : ${enrollmentsData.length}`);
  console.log(`  - Offline Exams        : ${exams.length}`);
  console.log(`  - Exam Results         : ${examResultsData.length}`);
  console.log(`  - Fee Records          : ${feeRecordsData.length}`);
  console.log(`  - Announcements        : ${announcementsData.length}`);
  console.log(`  - Success Stories      : ${successStoriesData.length}`);
  console.log(`  - Eligible Admissions  : ${eligibleEmailsData.length}`);
  console.log(`  - Registration Requests: ${registrationRequestsData.length}`);
  console.log(`  - Audit Logs           : ${auditLogsData.length}`);
  console.log('====================================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
