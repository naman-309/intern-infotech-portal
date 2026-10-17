const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development database for Intern Infotech Portal...');

  // 1. Clear existing seedable data in proper dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.examResultHistory.deleteMany({});
  await prisma.examResult.deleteMany({});
  await prisma.offlineExam.deleteMany({});
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

  // 3. Create Teachers
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'prof.sharma@infotech.edu',
      passwordHash: defaultPasswordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      firstName: 'Vikram',
      lastName: 'Sharma',
      phone: '+91 98765 00002',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      teacherProfile: {
        create: {
          employeeId: 'IIT-T101',
          specialization: 'Distributed Systems & Database Internals',
          qualifications: 'M.Tech (IIT Madras), Ex-Staff Engineer at Uber',
          bio: '12+ years of experience designing high-throughput distributed systems and teaching systems engineering.',
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'dr.anita@infotech.edu',
      passwordHash: defaultPasswordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      firstName: 'Anita',
      lastName: 'Deshmukh',
      phone: '+91 98765 00003',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      teacherProfile: {
        create: {
          employeeId: 'IIT-T102',
          specialization: 'Full-Stack Architecture & Cloud Native Systems',
          qualifications: 'Ph.D. in Computer Science (IISc), Ex-Principal Architect',
          bio: 'Specialist in reactive UI architectures, micro-frontends, and enterprise cloud migrations.',
        },
      },
    },
    include: { teacherProfile: true },
  });

  // 4. Create Authoritative Eligible Student Emails (Offline center admissions)
  const eligible1 = await prisma.eligibleStudentEmail.create({
    data: {
      email: 'student@infotech.edu',
      fullName: 'Rahul Sharma',
      offlineRegNumber: 'OFF-2026-001',
      phone: '+91 98765 11111',
      courseHint: 'Full-Stack Software Engineering',
      isRegistered: true,
      addedByAdminId: admin.id,
    },
  });

  await prisma.eligibleStudentEmail.createMany({
    data: [
      {
        email: 'priya.singh@gmail.com',
        fullName: 'Priya Singh',
        offlineRegNumber: 'OFF-2026-002',
        phone: '+91 98765 11112',
        courseHint: 'Distributed Systems & Cloud Architecture',
        isRegistered: false,
        addedByAdminId: admin.id,
      },
      {
        email: 'amit.patel@gmail.com',
        fullName: 'Amit Patel',
        offlineRegNumber: 'OFF-2026-003',
        phone: '+91 98765 11113',
        courseHint: 'Advanced Data Structures & Algorithms',
        isRegistered: false,
        addedByAdminId: admin.id,
      },
      {
        email: 'sneha.reddy@gmail.com',
        fullName: 'Sneha Reddy',
        offlineRegNumber: 'OFF-2026-004',
        phone: '+91 98765 11114',
        courseHint: 'DevOps & Site Reliability Engineering',
        isRegistered: false,
        addedByAdminId: admin.id,
      },
    ],
  });

  // 5. Create Enrolled Student (Rahul Sharma)
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@infotech.edu',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 98765 11111',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          enrollmentNumber: 'IIT-2026-S1001',
          rollNumber: 'R-1001',
          address: '42 Silicon Avenue, Koramangala 4th Block, Bengaluru',
          guardianName: 'Ramesh Sharma',
          guardianPhone: '+91 98765 99999',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 2 (Kavita Iyer)
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'kavita.iyer@infotech.edu',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      firstName: 'Kavita',
      lastName: 'Iyer',
      phone: '+91 98765 22222',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          enrollmentNumber: 'IIT-2026-S1002',
          rollNumber: 'R-1002',
          address: '108 Indiranagar 100ft Road, Bengaluru',
        },
      },
    },
    include: { studentProfile: true },
  });

  // 6. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Full-Stack Software Engineering',
      slug: 'full-stack-software-engineering',
      description: 'Master end-to-end production software engineering from high-scale React interfaces and Node.js microservices to PostgreSQL schema optimization and Docker containerization.',
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
  });

  const course2 = await prisma.course.create({
    data: {
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
  });

  const course3 = await prisma.course.create({
    data: {
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
  });

  // 7. Create Batches
  const batch1 = await prisma.batch.create({
    data: {
      name: 'Full Stack Cohort 2026-Alpha',
      batchCode: 'FS-2026-A',
      courseId: course1.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-07-31'),
      timing: 'Monday – Friday | 9:30 AM – 1:30 PM (Offline Lab)',
      capacity: 35,
      status: 'ONGOING',
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      name: 'Distributed Systems Weekend 2026',
      batchCode: 'DS-2026-W1',
      courseId: course2.id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-30'),
      timing: 'Saturday & Sunday | 10:00 AM – 4:00 PM',
      capacity: 25,
      status: 'UPCOMING',
    },
  });

  // 8. Assign Teachers to Batches
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherUser1.teacherProfile.id,
      batchId: batch1.id,
      roleTitle: 'Lead Instructor (Backend & Architecture)',
    },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherUser2.teacherProfile.id,
      batchId: batch1.id,
      roleTitle: 'Co-Instructor (Frontend & Cloud)',
    },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherUser1.teacherProfile.id,
      batchId: batch2.id,
      roleTitle: 'Primary Systems Instructor',
    },
  });

  // 9. Enroll Students in Batch
  await prisma.enrollment.create({
    data: {
      studentId: studentUser1.studentProfile.id,
      batchId: batch1.id,
      courseId: course1.id,
      status: 'ACTIVE',
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: studentUser2.studentProfile.id,
      batchId: batch1.id,
      courseId: course1.id,
      status: 'ACTIVE',
    },
  });

  // 10. Fee Records
  await prisma.feeRecord.create({
    data: {
      studentId: studentUser1.studentProfile.id,
      courseId: course1.id,
      batchId: batch1.id,
      totalFee: 65000.0,
      paidAmount: 40000.0,
      balanceAmount: 25000.0,
      paymentStatus: 'PARTIAL',
      notes: 'Initial offline installment of ₹40,000 received via DD #4892. Balance due on mid-term completion.',
      dueDate: new Date('2026-04-15'),
    },
  });

  // 11. Create Offline Examinations
  const exam1 = await prisma.offlineExam.create({
    data: {
      title: 'Full-Stack Mid-Term Lab Exam',
      subject: 'React Architecture & Express Microservices',
      courseId: course1.id,
      batchId: batch1.id,
      examDate: new Date('2026-03-10'),
      maxMarks: 100.0,
      description: '3-hour offline supervised laboratory test requiring full implementation of an authenticated microservice and reactive UI component.',
      status: 'PUBLISHED',
      createdById: teacherUser1.id,
      publishedById: teacherUser1.id,
      publishedAt: new Date('2026-03-12'),
    },
  });

  const exam2 = await prisma.offlineExam.create({
    data: {
      title: 'PostgreSQL Database Design & Query Tuning Quiz',
      subject: 'Relational Database Internals',
      courseId: course1.id,
      batchId: batch1.id,
      examDate: new Date('2026-04-05'),
      maxMarks: 50.0,
      description: 'Offline written evaluation on schema normalization, index selection, and transaction isolation levels.',
      status: 'PUBLISHED',
      createdById: teacherUser2.id,
      publishedById: admin.id,
      publishedAt: new Date('2026-04-07'),
    },
  });

  // 12. Create Exam Results
  await prisma.examResult.create({
    data: {
      examId: exam1.id,
      studentId: studentUser1.studentProfile.id,
      marksObtained: 94.0,
      percentage: 94.0,
      remarks: 'Outstanding implementation of JWT cookies, clean error handlers, and responsive Tailwind UI.',
      status: 'PUBLISHED',
      enteredById: teacherUser1.id,
    },
  });

  await prisma.examResult.create({
    data: {
      examId: exam1.id,
      studentId: studentUser2.studentProfile.id,
      marksObtained: 88.5,
      percentage: 88.5,
      remarks: 'Very solid backend code. UI transitions can be optimized slightly.',
      status: 'PUBLISHED',
      enteredById: teacherUser1.id,
    },
  });

  await prisma.examResult.create({
    data: {
      examId: exam2.id,
      studentId: studentUser1.studentProfile.id,
      marksObtained: 47.0,
      percentage: 94.0,
      remarks: 'Flawless execution on indexing strategies.',
      status: 'PUBLISHED',
      enteredById: teacherUser2.id,
    },
  });

  // 13. Create Student Success Stories
  await prisma.studentSuccessStory.createMany({
    data: [
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
        courseCompleted: 'Distributed Systems & Cloud Architecture',
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
    ],
  });

  // 14. Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Offline Lab Infrastructure Upgrade: Dedicated Multi-Node Redis Clusters',
        body: 'We have upgraded all laboratory workstations with dedicated local container environments and high-speed multi-node Redis clusters. Students can now test high-concurrency pub/sub and distributed lock scenarios in offline sessions.',
        targetType: 'ALL',
        priority: 'HIGH',
        authorId: admin.id,
        isPublished: true,
      },
      {
        title: 'Full Stack Cohort Alpha: Offline Project Showcase Scheduled',
        body: 'All students enrolled in Full Stack Cohort 2026-Alpha are required to present their capstone microservices architecture to visiting tech leads from leading startups on Saturday, April 25th at 10:00 AM.',
        targetType: 'BATCH',
        targetBatchId: batch1.id,
        priority: 'URGENT',
        authorId: teacherUser1.id,
        isPublished: true,
      },
      {
        title: 'Guest Lecture by Google Staff Engineer on Cloud Native Reliability',
        body: 'Join us this Friday at 5:00 PM in Seminar Hall 1 for an exclusive interactive session on building self-healing distributed systems on Kubernetes.',
        targetType: 'ALL',
        priority: 'MEDIUM',
        authorId: admin.id,
        isPublished: true,
      },
    ],
  });

  console.log('\nSeed data successfully populated!');
  console.log('----------------------------------------------------');
  console.log('Admin Account:    admin@infotech.edu       / SecurePass@2026');
  console.log('Teacher Account:  prof.sharma@infotech.edu / SecurePass@2026');
  console.log('Student Account:  student@infotech.edu     / SecurePass@2026');
  console.log('Eligible Unregistered: priya.singh@gmail.com (Can test register request flow)');
  console.log('----------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
