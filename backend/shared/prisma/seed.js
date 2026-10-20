const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning and Seeding Lean, Production-Grade Database ---');

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

  // 2. Administrator (Single authority account)
  console.log('Seeding System Administrator...');
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

  // 3. Faculty / Trainer (1 realistic, high-profile lead instructor)
  console.log('Seeding Lead Faculty Member...');
  const teacherUser = await prisma.user.create({
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
          specialization: 'Full Stack Architecture & Distributed Systems',
          qualifications: 'M.Tech (IIT Madras), Ex-Staff Engineer at Uber & Stripe',
          bio: '12+ years of enterprise engineering experience. Architect of high-throughput distributed systems and mentor to 500+ engineers placed across Tier-1 tech companies.',
        },
      },
    },
    include: { teacherProfile: true },
  });

  // 4. Enrolled Students (1–2 active student profiles)
  console.log('Seeding 2 Active Students...');
  const student1 = await prisma.user.create({
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
          guardianPhone: '+91 98765 99991',
        },
      },
    },
    include: { studentProfile: true },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'kavita.iyer@infotech.edu',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      firstName: 'Kavita',
      lastName: 'Iyer',
      phone: '+91 98765 11112',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          enrollmentNumber: 'IIT-2026-S1002',
          rollNumber: 'R-1002',
          address: '108 Indiranagar 100ft Road, Bengaluru',
          guardianName: 'S. Iyer',
          guardianPhone: '+91 98765 99992',
        },
      },
    },
    include: { studentProfile: true },
  });

  // 5. 4 Core Programs (6 to 8 months each)
  console.log('Seeding 4 Core Programs (6-8 months)...');
  const course1 = await prisma.course.create({
    data: {
      title: 'Full Stack Development',
      slug: 'full-stack-development',
      description: 'Intensive 8-month enterprise curriculum covering React 18, Node.js microservices, TypeScript, PostgreSQL database performance, Redis caching, and Docker production deployments.',
      duration: '32 Weeks (8 Months)',
      advertisedFee: 65000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 1,
      curriculum: [
        { module: 'Module 1: Advanced JS & TypeScript', topics: ['Event Loop', 'Memory Profiling', 'Type Systems', 'Generics'] },
        { module: 'Module 2: Reactive Modern Frontend', topics: ['React 18 Architecture', 'TanStack Query', 'Tailwind Systems', 'State Machines'] },
        { module: 'Module 3: Scalable Microservices', topics: ['Express Microservices', 'API Gateway', 'JWT & RBAC Security', 'Rate Limiting'] },
        { module: 'Module 4: PostgreSQL & Caching', topics: ['B-Tree Indexing', 'ACID Transactions', 'Redis 30-Min Strategy', 'Prisma ORM'] },
        { module: 'Module 5: DevOps & Cloud Delivery', topics: ['Docker Containerization', 'Nginx Reverse Proxy', 'AWS EC2 CI/CD'] },
      ],
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'DevOps & Cloud Engineering',
      slug: 'devops-cloud-engineering',
      description: 'Comprehensive 7-month immersive program in Linux internals, Docker, Kubernetes orchestration, Terraform Infrastructure as Code, CI/CD automation, and AWS cloud architecture.',
      duration: '28 Weeks (7 Months)',
      advertisedFee: 55000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 2,
      curriculum: [
        { module: 'Module 1: Linux Internals & Bash', topics: ['Namespaces & Cgroups', 'Networking & Sockets', 'Process Scheduling'] },
        { module: 'Module 2: Containerization & Docker', topics: ['Multi-stage Builds', 'Docker Compose', 'Security Hardening'] },
        { module: 'Module 3: Kubernetes Orchestration', topics: ['Pod Scheduling', 'Ingress Controllers', 'StatefulSets & PVs', 'Helm Charts'] },
        { module: 'Module 4: Infrastructure as Code & CI/CD', topics: ['Terraform', 'GitHub Actions Pipelines', 'ArgoCD GitOps'] },
        { module: 'Module 5: Observability & Chaos', topics: ['Prometheus & Grafana', 'OpenTelemetry Tracing', 'SRE Best Practices'] },
      ],
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Data Structures & Algorithms / Systems Engineering (DSE)',
      slug: 'dsa-systems-engineering',
      description: 'Rigorous 6-month computer science program focusing on advanced algorithms, data structures, low-level concurrency, distributed consensus, and Tier-1 system design interview mastery.',
      duration: '24 Weeks (6 Months)',
      advertisedFee: 45000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc66747d10e?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 3,
      curriculum: [
        { module: 'Module 1: Advanced Graphs & Trees', topics: ['Dijkstra & A*', 'Tarjan SCC', 'Trie & Segment Trees', 'Disjoint Sets'] },
        { module: 'Module 2: Dynamic Programming Mastery', topics: ['State Space Optimization', 'Bitmask DP', 'Digit DP', '2D/3D Grids'] },
        { module: 'Module 3: Low-Level Concurrency', topics: ['Mutexes & Semaphores', 'Deadlocks', 'Lock-Free Queues', 'Memory Models'] },
        { module: 'Module 4: High-Scale System Design', topics: ['Consistent Hashing', 'Write-Ahead Logs', 'Raft Consensus', 'Partitioning'] },
      ],
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: 'Cybersecurity & Defense',
      slug: 'cybersecurity-defense',
      description: 'Intensive 6-month operational cybersecurity curriculum covering web application penetration testing, network traffic analysis, cryptography, defensive SOC triage, and zero-trust perimeter design.',
      duration: '24 Weeks (6 Months)',
      advertisedFee: 50000.0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      featured: true,
      published: true,
      displayOrder: 4,
      curriculum: [
        { module: 'Module 1: Web App Pen-Testing', topics: ['OWASP Top 10', 'SQLi & XSS', 'SSRF', 'IDOR', 'CSRF Protections'] },
        { module: 'Module 2: Applied Cryptography', topics: ['AES-GCM', 'RSA & ECC', 'TLS 1.3 Handshake', 'Zero-Knowledge Proofs'] },
        { module: 'Module 3: Network Defense & Wireshark', topics: ['Packet Inspection', 'Firewalls & IPS/IDS', 'VPN & Reverse Proxies'] },
        { module: 'Module 4: Incident Response & SOC', topics: ['Threat Hunting', 'SIEM Log Analysis', 'Forensic Memory Dumps'] },
      ],
    },
  });

  const courses = [course1, course2, course3, course4];

  // 6. Batches for the Core Programs
  console.log('Seeding Active Batches...');
  const batch1 = await prisma.batch.create({
    data: {
      name: 'Full Stack Elite Cohort 2026-A',
      batchCode: 'FS-2026-A',
      courseId: course1.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-09-30'),
      timing: 'Monday – Friday | 9:00 AM – 1:00 PM (Offline Lab)',
      capacity: 30,
      status: 'ONGOING',
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      name: 'DevOps & Cloud Sprint 2026-A',
      batchCode: 'DO-2026-A',
      courseId: course2.id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-09-30'),
      timing: 'Monday – Friday | 2:00 PM – 6:00 PM (Cloud Lab)',
      capacity: 25,
      status: 'ONGOING',
    },
  });

  const batch3 = await prisma.batch.create({
    data: {
      name: 'Systems & DSA Intensive 2026-A',
      batchCode: 'DSE-2026-A',
      courseId: course3.id,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      timing: 'Saturday & Sunday | 9:30 AM – 3:30 PM (Lab)',
      capacity: 30,
      status: 'ONGOING',
    },
  });

  const batch4 = await prisma.batch.create({
    data: {
      name: 'Cybersecurity Defense Lab 2026-A',
      batchCode: 'SEC-2026-A',
      courseId: course4.id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-10-31'),
      timing: 'Tuesday, Thursday, Saturday | 2:00 PM – 6:00 PM',
      capacity: 20,
      status: 'UPCOMING',
    },
  });

  // 7. Teacher Assignment
  console.log('Assigning Lead Faculty...');
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherUser.teacherProfile.id,
      batchId: batch1.id,
      roleTitle: 'Principal Instructor (Full Stack & Systems)',
    },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherUser.teacherProfile.id,
      batchId: batch2.id,
      roleTitle: 'Lead Cloud Mentor',
    },
  });

  // 8. Enrollments for the 2 students
  console.log('Enrolling Students in Batches...');
  await prisma.enrollment.create({
    data: {
      studentId: student1.studentProfile.id,
      batchId: batch1.id,
      courseId: course1.id,
      status: 'ACTIVE',
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student2.studentProfile.id,
      batchId: batch2.id,
      courseId: course2.id,
      status: 'ACTIVE',
    },
  });

  // 9. Fee Records
  console.log('Creating Clean Fee Records...');
  const fee1 = await prisma.feeRecord.create({
    data: {
      studentId: student1.studentProfile.id,
      courseId: course1.id,
      batchId: batch1.id,
      totalFee: 65000.0,
      paidAmount: 40000.0,
      balanceAmount: 25000.0,
      paymentStatus: 'PARTIAL',
      notes: 'Initial offline installment of ₹40,000 received via DD #4892. Balance due mid-term.',
      dueDate: new Date('2026-06-15'),
    },
  });

  await prisma.feePayment.create({
    data: {
      feeRecordId: fee1.id,
      amount: 40000.0,
      paymentMethod: 'Cheque',
      transactionRef: 'DD-489201',
      recordedById: admin.id,
      remarks: 'First installment cleared upon admission registration.',
      receiptNumber: 'REC-2026-0001',
      paidAt: new Date('2026-02-05'),
    },
  });

  const fee2 = await prisma.feeRecord.create({
    data: {
      studentId: student2.studentProfile.id,
      courseId: course2.id,
      batchId: batch2.id,
      totalFee: 55000.0,
      paidAmount: 55000.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      notes: 'Full tuition fee paid in single settlement via NEFT. Merit scholarship applied.',
      dueDate: null,
    },
  });

  await prisma.feePayment.create({
    data: {
      feeRecordId: fee2.id,
      amount: 55000.0,
      paymentMethod: 'Bank Transfer',
      transactionRef: 'NEFT-9938210',
      recordedById: admin.id,
      remarks: 'Full settlement verified by finance desk.',
      receiptNumber: 'REC-2026-0002',
      paidAt: new Date('2026-02-10'),
    },
  });

  // 10. Mock Interviews (totalMarks is 35.0, results are MockResult)
  console.log('Seeding Mock Technical Interviews...');
  const mock1 = await prisma.mockInterview.create({
    data: {
      title: 'Full-Stack Architecture & React Internals',
      courseId: course1.id,
      batchId: batch1.id,
      date: new Date('2026-03-20'),
      totalMarks: 35.0,
      description: 'Technical evaluation of React 18 reconciliation, hooks, and microservice integration.',
      conductedById: teacherUser.id,
      results: {
        create: [
          {
            studentId: student1.studentProfile.id,
            marksObtained: 31.5,
            percentage: (31.5 / 35.0) * 100,
            feedback: 'Excellent grasp of React state lifecycles and cache invalidation. Can improve on SQL indexing theory under high concurrency.',
            status: 'PUBLISHED',
            enteredById: teacherUser.id,
          },
        ],
      },
    },
  });

  const mock2 = await prisma.mockInterview.create({
    data: {
      title: 'Kubernetes Pod Networking & CNI Deep Dive',
      courseId: course2.id,
      batchId: batch2.id,
      date: new Date('2026-03-25'),
      totalMarks: 35.0,
      description: 'In-depth assessment of container networking, Calico CNI, ingress controllers, and Helm charts.',
      conductedById: teacherUser.id,
      results: {
        create: [
          {
            studentId: student2.studentProfile.id,
            marksObtained: 33.0,
            percentage: (33.0 / 35.0) * 100,
            feedback: 'Strong understanding of Ingress, Calico CNI, and multi-stage container optimization. Recommended for Tier-1 Cloud SRE roles.',
            status: 'PUBLISHED',
            enteredById: teacherUser.id,
          },
        ],
      },
    },
  });

  // 11. Offline Examinations & Results
  console.log('Seeding Examinations & Performance...');
  const exam1 = await prisma.offlineExam.create({
    data: {
      title: 'Full Stack Mid-Term Evaluation',
      subject: 'React, Node.js & Database Optimization',
      courseId: course1.id,
      batchId: batch1.id,
      examDate: new Date('2026-03-10'),
      maxMarks: 100.0,
      description: 'Comprehensive offline assessment on full stack architectures.',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-03-12'),
      createdById: teacherUser.id,
      publishedById: teacherUser.id,
    },
  });

  await prisma.examResult.create({
    data: {
      examId: exam1.id,
      studentId: student1.studentProfile.id,
      marksObtained: 92.5,
      percentage: 92.5,
      status: 'PUBLISHED',
      remarks: 'Demonstrated outstanding grasp of async queues, database schemas, and clean code conventions.',
      enteredById: teacherUser.id,
    },
  });

  const exam2 = await prisma.offlineExam.create({
    data: {
      title: 'Kubernetes & Infrastructure Lab Test',
      subject: 'Docker & Kubernetes Manifest Hardening',
      courseId: course2.id,
      batchId: batch2.id,
      examDate: new Date('2026-03-15'),
      maxMarks: 100.0,
      description: 'Practical lab exam for Docker containerization and K8s manifests.',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-03-17'),
      createdById: teacherUser.id,
      publishedById: teacherUser.id,
    },
  });

  await prisma.examResult.create({
    data: {
      examId: exam2.id,
      studentId: student2.studentProfile.id,
      marksObtained: 95.0,
      percentage: 95.0,
      status: 'PUBLISHED',
      remarks: 'Perfect execution of rootless containers and zero-downtime rolling deployment strategies.',
      enteredById: teacherUser.id,
    },
  });

  // 12. Verified Placement Success Stories
  console.log('Seeding Verified Placement Stories...');
  await prisma.studentSuccessStory.create({
    data: {
      studentName: 'Aman Singhania',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Full Stack Development',
      jobTitle: 'SDE-2 (Distributed Systems)',
      companyName: 'Amazon Web Services',
      companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      packageLPA: '28.5 LPA',
      placementYear: 2025,
      testimonial: 'The hands-on offline labs and deep dive into system design at Intern Infotech gave me the exact confidence needed to crack AWS bar-raiser rounds.',
      featured: true,
      published: true,
      displayOrder: 1,
    },
  });

  await prisma.studentSuccessStory.create({
    data: {
      studentName: 'Sneha Kulkarni',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'DevOps & Cloud Engineering',
      jobTitle: 'Platform & Cloud Engineer',
      companyName: 'PhonePe',
      companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png',
      packageLPA: '22.0 LPA',
      placementYear: 2025,
      testimonial: 'The rigorous focus on production Kubernetes, GitOps, and Redis caching architectures made real-world tech interviews feel natural.',
      featured: true,
      published: true,
      displayOrder: 2,
    },
  });

  await prisma.studentSuccessStory.create({
    data: {
      studentName: 'Rohan Mehra',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      courseCompleted: 'Data Structures & Algorithms / Systems Engineering (DSE)',
      jobTitle: 'Backend Systems Engineer',
      companyName: 'Razorpay',
      companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
      packageLPA: '18.5 LPA',
      placementYear: 2025,
      testimonial: 'From low-level data structures to concurrency locking and Redis pipelines, Intern Infotech changed how I think about scalable software.',
      featured: true,
      published: true,
      displayOrder: 3,
    },
  });

  // 13. Institutional Announcements
  console.log('Seeding Announcements...');
  await prisma.announcement.create({
    data: {
      title: 'Campus & Lab Operational Timings: 7:00 AM – 7:00 PM',
      body: 'Our high-performance engineering laboratories, offline workstations, and trainer mentorship pods are open every day from 7:00 AM to 7:00 PM. Please carry your student smart card for check-in.',
      priority: 'HIGH',
      targetType: 'ALL',
      authorId: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Upcoming Offline Systems & Microservices Hackathon',
      body: 'Registrations are open for the 24-hour Offline Systems Hackathon. Build resilient event-driven architectures with Kafka and Redis. Winners receive paid incubator internships.',
      priority: 'MEDIUM',
      targetType: 'ALL',
      authorId: admin.id,
    },
  });

  // 14. Whitelisted Eligible Emails & Registration Requests
  console.log('Seeding Eligible Student Whitelist...');
  await prisma.eligibleStudentEmail.create({
    data: {
      email: 'student@infotech.edu',
      offlineRegNumber: 'OFF-2026-001',
      fullName: 'Rahul Sharma',
      courseHint: 'Full Stack Development',
      isRegistered: true,
      addedByAdminId: admin.id,
    },
  });

  await prisma.eligibleStudentEmail.create({
    data: {
      email: 'kavita.iyer@infotech.edu',
      offlineRegNumber: 'OFF-2026-002',
      fullName: 'Kavita Iyer',
      courseHint: 'DevOps & Cloud Engineering',
      isRegistered: true,
      addedByAdminId: admin.id,
    },
  });

  await prisma.eligibleStudentEmail.create({
    data: {
      email: 'applicant.test@infotech.edu',
      offlineRegNumber: 'OFF-2026-003',
      fullName: 'Test Applicant',
      courseHint: 'Full Stack Development',
      isRegistered: false,
      addedByAdminId: admin.id,
    },
  });

  await prisma.registrationRequest.create({
    data: {
      email: 'applicant.test@infotech.edu',
      fullName: 'Test Applicant',
      phone: '+91 98765 44444',
      role: 'STUDENT',
      passwordHash: defaultPasswordHash,
      isEmailVerified: true,
      status: 'PENDING',
      reviewNote: 'Pre-approved offline enrollment waiting for admin confirmation.',
      targetCourseId: course1.id,
    },
  });

  // 15. Audit Logs
  console.log('Seeding Initial Audit Logs...');
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'System',
      entityId: 'global',
      details: { message: 'Database initialized with lean, optimized seed data' },
      ipAddress: '127.0.0.1',
      userAgent: 'Portal-Seed-Engine/2.0',
    },
  });

  console.log('\n====================================================');
  console.log(' LEAN PRODUCTION SEED DATA SUCCESSFULLY POPULATED');
  console.log('====================================================');
  console.log('Accounts:');
  console.log('  - 1 System Admin   : admin@infotech.edu        / SecurePass@2026');
  console.log('  - 1 Lead Trainer   : prof.sharma@infotech.edu  / SecurePass@2026');
  console.log('  - 2 Active Students: student@infotech.edu      / SecurePass@2026 (Roll: R-1001)');
  console.log('                     : kavita.iyer@infotech.edu  / SecurePass@2026 (Roll: R-1002)');
  console.log('Programs (6 to 8 Months):');
  console.log('  1. Full Stack Development (8 Months)');
  console.log('  2. DevOps & Cloud Engineering (7 Months)');
  console.log('  3. Data Structures & Algorithms / Systems Engineering (DSE) (6 Months)');
  console.log('  4. Cybersecurity & Defense (6 Months)');
  console.log('Operating Hours: 7:00 AM – 7:00 PM');
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
