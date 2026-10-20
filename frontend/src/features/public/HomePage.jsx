import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { DevBadge, DevCreditsModal } from '../../components/shared/DevCreditsModal';
import {
  Code2,
  Terminal,
  Cpu,
  Database,
  Cloud,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Award,
  Users,
  Building2,
  Clock,
  ShieldCheck,
  Zap,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Star,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export const HomePage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', course: 'Full Stack Development' });

  // 1. Fetch Overview & Stats
  const { data: overviewData } = useQuery({
    queryKey: ['publicOverview'],
    queryFn: () => api.get('/public/overview'),
  });

  // 2. Fetch Public Courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: () => api.get('/courses/public'),
  });

  // 3. Fetch Success Stories
  const { data: storiesData, isLoading: storiesLoading } = useQuery({
    queryKey: ['publicStories'],
    queryFn: () => api.get('/success-stories/public'),
  });

  const institute = overviewData?.data || {
    name: 'Intern Infotech Institute of Software Engineering',
    tagline: 'Master Production-Grade Full-Stack & Systems Engineering with Industry Architects',
    stats: {
      alumniPlaced: 1250,
      activeCourses: 4,
      activeBatches: 6,
      averageHike: '140%',
      topPackage: '42 LPA',
    },
  };

  const courses = coursesData?.data?.courses || [
    {
      id: 'c1',
      title: 'Full Stack Development',
      slug: 'full-stack-development',
      description: 'Intensive 8-month enterprise curriculum covering React 18, Node.js microservices, TypeScript, PostgreSQL database performance, Redis caching, and Docker production deployments.',
      duration: '32 Weeks (8 Months)',
      advertisedFee: 65000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      curriculum: [
        { module: 'Module 1: Advanced JS & TypeScript', topics: ['Event Loop', 'Memory Profiling', 'Type Systems', 'Generics'] },
        { module: 'Module 2: Reactive Modern Frontend', topics: ['React 18 Architecture', 'TanStack Query', 'Tailwind Systems', 'State Machines'] },
        { module: 'Module 3: Scalable Microservices', topics: ['Express Microservices', 'API Gateway', 'JWT & RBAC Security', 'Rate Limiting'] },
        { module: 'Module 4: PostgreSQL & Caching', topics: ['B-Tree Indexing', 'ACID Transactions', 'Redis 30-Min Strategy', 'Prisma ORM'] },
        { module: 'Module 5: DevOps & Cloud Delivery', topics: ['Docker Containerization', 'Nginx Reverse Proxy', 'AWS EC2 CI/CD'] },
      ],
      batches: [{ id: 'b1', name: 'Elite Cohort 2026-A', startDate: '2026-02-01', timing: 'Mon–Fri 9:00 AM – 1:00 PM', status: 'ONGOING' }],
    },
    {
      id: 'c2',
      title: 'DevOps & Cloud Engineering',
      slug: 'devops-cloud-engineering',
      description: 'Comprehensive 7-month immersive program in Linux internals, Docker, Kubernetes orchestration, Terraform Infrastructure as Code, CI/CD automation, and AWS cloud architecture.',
      duration: '28 Weeks (7 Months)',
      advertisedFee: 55000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      curriculum: [
        { module: 'Module 1: Linux Internals & Bash', topics: ['Namespaces & Cgroups', 'Networking & Sockets', 'Process Scheduling'] },
        { module: 'Module 2: Containerization & Docker', topics: ['Multi-stage Builds', 'Docker Compose', 'Security Hardening'] },
        { module: 'Module 3: Kubernetes Orchestration', topics: ['Pod Scheduling', 'Ingress Controllers', 'StatefulSets & PVs', 'Helm Charts'] },
        { module: 'Module 4: Infrastructure as Code & CI/CD', topics: ['Terraform', 'GitHub Actions Pipelines', 'ArgoCD GitOps'] },
        { module: 'Module 5: Observability & Chaos', topics: ['Prometheus & Grafana', 'OpenTelemetry Tracing', 'SRE Best Practices'] },
      ],
      batches: [{ id: 'b2', name: 'Cloud Sprint 2026-A', startDate: '2026-03-01', timing: 'Mon–Fri 2:00 PM – 6:00 PM', status: 'ONGOING' }],
    },
    {
      id: 'c3',
      title: 'Data Structures & Algorithms / Systems Engineering (DSE)',
      slug: 'dsa-systems-engineering',
      description: 'Rigorous 6-month computer science program focusing on advanced algorithms, data structures, low-level concurrency, distributed consensus, and Tier-1 system design interview mastery.',
      duration: '24 Weeks (6 Months)',
      advertisedFee: 45000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc66747d10e?w=800&auto=format&fit=crop&q=80',
      curriculum: [
        { module: 'Module 1: Advanced Graphs & Trees', topics: ['Dijkstra & A*', 'Tarjan SCC', 'Trie & Segment Trees', 'Disjoint Sets'] },
        { module: 'Module 2: Dynamic Programming Mastery', topics: ['State Space Optimization', 'Bitmask DP', 'Digit DP', '2D/3D Grids'] },
        { module: 'Module 3: Low-Level Concurrency', topics: ['Mutexes & Semaphores', 'Deadlocks', 'Lock-Free Queues', 'Memory Models'] },
        { module: 'Module 4: High-Scale System Design', topics: ['Consistent Hashing', 'Write-Ahead Logs', 'Raft Consensus', 'Partitioning'] },
      ],
      batches: [{ id: 'b3', name: 'Systems Intensive 2026-A', startDate: '2026-04-01', timing: 'Sat & Sun 9:30 AM – 3:30 PM', status: 'ONGOING' }],
    },
    {
      id: 'c4',
      title: 'Cybersecurity & Defense',
      slug: 'cybersecurity-defense',
      description: 'Intensive 6-month operational cybersecurity curriculum covering web application penetration testing, network traffic analysis, cryptography, defensive SOC triage, and zero-trust perimeter design.',
      duration: '24 Weeks (6 Months)',
      advertisedFee: 50000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      curriculum: [
        { module: 'Module 1: Web App Pen-Testing', topics: ['OWASP Top 10', 'SQLi & XSS', 'SSRF', 'IDOR', 'CSRF Protections'] },
        { module: 'Module 2: Applied Cryptography', topics: ['AES-GCM', 'RSA & ECC', 'TLS 1.3 Handshake', 'Zero-Knowledge Proofs'] },
        { module: 'Module 3: Network Defense & Wireshark', topics: ['Packet Inspection', 'Firewalls & IPS/IDS', 'VPN & Reverse Proxies'] },
        { module: 'Module 4: Incident Response & SOC', topics: ['Threat Hunting', 'SIEM Log Analysis', 'Forensic Memory Dumps'] },
      ],
      batches: [{ id: 'b4', name: 'Cyber Defense Lab 2026-A', startDate: '2026-05-01', timing: 'Tue, Thu, Sat 2:00 PM – 6:00 PM', status: 'UPCOMING' }],
    },
  ];

  const stories = storiesData?.data?.stories || [
    {
      studentName: 'Aman Singhania',
      jobTitle: 'SDE-2 (Distributed Systems)',
      companyName: 'Amazon Web Services',
      packageLPA: '28.5 LPA',
      courseCompleted: 'Full Stack Development',
      testimonial: 'The hands-on offline labs and deep dive into system design at Intern Infotech gave me the exact confidence needed to crack AWS bar-raiser rounds.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    },
    {
      studentName: 'Sneha Kulkarni',
      jobTitle: 'Platform & Cloud Engineer',
      companyName: 'PhonePe',
      packageLPA: '22.0 LPA',
      courseCompleted: 'DevOps & Cloud Engineering',
      testimonial: 'The rigorous focus on production Kubernetes, GitOps, and Redis caching architectures made real-world tech interviews feel natural.',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png',
    },
    {
      studentName: 'Rohan Mehra',
      jobTitle: 'Backend Systems Engineer',
      companyName: 'Razorpay',
      packageLPA: '18.5 LPA',
      courseCompleted: 'DSA & Systems Engineering',
      testimonial: 'From low-level data structures to concurrency locking and Redis pipelines, Intern Infotech changed how I think about scalable software.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
    },
  ];

  // Realistic, well-profiled lead instructor
  const leadInstructor = {
    name: 'Prof. Vikram Sharma',
    role: 'Principal Faculty & System Architect',
    qualifications: 'M.Tech (IIT Madras) • Ex-Staff Engineer at Uber & Stripe',
    experience: '12+ Years Industry Experience',
    bio: 'Architected high-throughput distributed payment pipelines processing 45,000 TPS. Mentored over 500+ engineers placed at Google, Amazon, Microsoft, and high-growth startups.',
    domains: ['Distributed Systems', 'High-Concurrency Node.js', 'PostgreSQL Internals', 'Kubernetes Architecture', 'System Design'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    toast.success('Inquiry submitted! Our admissions lead will reach out to you within 2 working hours.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* 1. HERO SECTION WITH PROMINENT OPERATING HOURS & LIVE LAB TERMINAL */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 border-b border-slate-900 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,165,233,0.18),rgba(2,6,23,0))]">
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Operational Pill Banner */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono tracking-wide backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>CAMPUS & LAB TIMINGS: <strong className="text-white">7:00 AM – 7:00 PM</strong> OPEN DAILY</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFLINE COHORTS 2026 ENROLLING</span>
            </div>

            <DevBadge onClick={() => setCreditsOpen(true)} />
          </div>

          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Where Future Tech Leads Master{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Distributed Systems
              </span>{' '}
              & Enterprise Software
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              We do not sell pre-recorded tutorials. At our premier offline laboratory campus in Indore,
              you write high-throughput microservices, design Redis-accelerated architectures, and crack Tier-1 system design interviews.
            </p>

            {/* Operating Hours Callout Card */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md text-xs text-slate-300">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Operating Hours: <strong className="text-emerald-400 font-mono">7:00 AM – 7:00 PM</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Offline Campus: <strong>Geeta Bhawan Square, Indore</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Faculty-to-Student Ratio: <strong className="text-sky-300 font-mono">1:15</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="#courses" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-sky-500/25 bg-sky-500 hover:bg-sky-600 text-white font-semibold gap-2 transition-all duration-300 hover:scale-[1.02]">
                  <Terminal className="w-4 h-4" />
                  Explore Core Programs (6-8 Months)
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link to="/register-student" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-sky-500/40 text-sky-300 hover:bg-sky-500/10 font-semibold transition-all duration-300">
                  <GraduationCap className="w-4 h-4 mr-2 text-sky-400" />
                  Request Admission Clearance
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Live Architecture Terminal & Stats Card */}
          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 Cols: Live Lab Code Terminal */}
            <div className="lg:col-span-7 relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-md font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    <span className="ml-2 text-slate-400 font-sans font-medium text-[11px]">lab-cluster-indore-offline.sh</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Lab Session
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sky-400">$ node cluster-benchmark.js --target=microservices</p>
                  <p className="text-slate-400">Initializing 4 distributed service nodes...</p>
                  <div className="pl-2 space-y-1 text-slate-300">
                    <p className="text-emerald-400">✓ Auth Service (Port 5001) :: Dual JWT Session Handlers</p>
                    <p className="text-emerald-400">✓ Academic Service (Port 5003) :: 4 Core Curriculums</p>
                    <p className="text-emerald-400">✓ Redis Upstash Layer :: 30-min TTL Eviction Policy Active</p>
                    <p className="text-emerald-400">✓ PostgreSQL Cluster :: B-Tree Indexed Search &lt; 20ms</p>
                  </div>
                  <p className="text-sky-400 pt-1">$ redis-cli info memory | grep used_memory_human</p>
                  <p className="text-emerald-300 pl-2">used_memory: 3.42MB / 250MB (Strict 30m Wipeout Active)</p>
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-sky-500/30 text-sky-300 flex items-center justify-between">
                    <span>STATUS: ALL MICROSERVICES HEALTHY</span>
                    <span className="text-xs font-bold text-emerald-400">p99 = 12ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Key Numbers Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md transition-all duration-300 hover:border-sky-500/40 hover:bg-slate-900/90 hover:scale-[1.02]">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{institute.stats.alumniPlaced}+</div>
                <div className="text-xs text-slate-400 mt-1">Engineers Placed</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/90 hover:scale-[1.02]">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{institute.stats.topPackage}</div>
                <div className="text-xs text-slate-400 mt-1">Top CTC Package</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:scale-[1.02]">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">{institute.stats.averageHike}</div>
                <div className="text-xs text-slate-400 mt-1">Average Salary Hike</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/90 hover:scale-[1.02]">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono">12 Hours</div>
                <div className="text-xs text-slate-400 mt-1">7 AM – 7 PM Daily Labs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INSTITUTE OPERATING HOURS & CAMPUS RIGOR SECTION */}
      <section className="py-16 border-b border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  CAMPUS SCHEDULE & FACILITIES
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  High-Performance Offline Labs Open from{' '}
                  <span className="text-sky-400">7:00 AM – 7:00 PM</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Our dedicated offline workstations, gigabit fiber connections, and teacher mentorship pods remain operational 12 hours a day, 7 days a week. Students have round-the-clock access to offline test rigs, whiteboard pods, and peer code-review clusters.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>In-person 1-on-1 Debugging</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High-Speed Linux Hardware</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Weekly 35-Mark Mock Interviews</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">Visit Our Indore Campus</h4>
                <p className="text-xs text-slate-400">
                  404 Vibrant Business Tower, Geeta Bhawan Square, A.B. Road, Indore
                </p>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Check-in Desk Open Now
                </div>
                <a href="#contact" className="w-full pt-1">
                  <Button size="sm" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium">
                    Schedule In-Person Tour
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MEET OUR INSTRUCTORS SECTION (Crisp, Professional & Compact) */}
      <section id="instructors" className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              WORLD-CLASS FACULTY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Meet Our Lead Instructor
            </h2>
            <p className="text-slate-400 text-sm">
              Learn directly from experienced engineering veterans who have built Tier-1 systems at global scale.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/30 to-indigo-500/30 opacity-40 blur-xl group-hover:opacity-60 transition-opacity"></div>
              
              <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  {/* Instructor Avatar with Experience Badge */}
                  <div className="relative shrink-0">
                    <img
                      src={leadInstructor.avatarUrl}
                      alt={leadInstructor.name}
                      className="w-32 h-32 sm:w-36 sm:sm:h-36 rounded-2xl object-cover border-2 border-sky-500/40 shadow-xl"
                    />
                    <div className="absolute -bottom-3 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-sky-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                      12+ YRS EXP
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{leadInstructor.name}</h3>
                        <p className="text-sky-400 font-medium text-xs sm:text-sm font-mono mt-0.5">
                          {leadInstructor.role}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30 w-max mx-auto sm:mx-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Full-Time On-Campus
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-300 font-mono">
                      {leadInstructor.qualifications}
                    </p>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {leadInstructor.bio}
                    </p>

                    {/* Expertise Domain Tags */}
                    <div className="pt-2">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mb-2">Key Expertise & Domains:</div>
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {leadInstructor.domains.map((dom) => (
                          <span
                            key={dom}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-950 border border-slate-800 text-slate-300 hover:border-sky-500/40 transition-colors"
                          >
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE PROGRAMS CATALOG (4 Core Programs, 6 to 8 Months) */}
      <section id="courses" className="py-20 border-b border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
                ACCREDITED INTENSIVE PROGRAMS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Core Engineering Curriculums
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                4 comprehensive 6 to 8 month offline master cohorts. Transparent tuition, zero hidden charges.
              </p>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Filter courses by keyword..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id || course.slug}
                className="group relative rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-900/90 hover:scale-[1.01] hover:shadow-2xl hover:shadow-sky-500/10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {course.duration}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {formatCurrency(course.advertisedFee || 50000)} Tuition
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {course.description}
                  </p>

                  {/* Highlights Pill Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      Offline Daily Labs
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      Weekly Mock Interviews
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      Placement Assistance
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    View Modules & Curriculum
                  </button>

                  <Link to="/register-student">
                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white font-medium gap-1 text-xs">
                      Enroll
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VERIFIED PLACEMENT SUCCESS STORIES */}
      <section id="success-stories" className="py-20 border-b border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              VERIFIED PLACEMENT CREDIBILITY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Alumni Placed at Global Tech Leaders
            </h2>
            <p className="text-slate-400 text-sm">
              Real engineers. Verified offer letters. Transparent packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 hover:border-sky-500/30 hover:bg-slate-900/80"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={story.photoUrl}
                        alt={story.studentName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{story.studentName}</h4>
                        <p className="text-[11px] text-slate-400">{story.jobTitle}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {story.packageLPA}
                    </span>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-sky-300 font-mono flex items-center justify-between">
                    <span>{story.companyName}</span>
                    <span className="text-[10px] text-slate-500">{story.courseCompleted}</span>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{story.testimonial}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OFFLINE CAMPUS CONTACT & INQUIRY FORM */}
      <section id="contact" className="py-20 border-b border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 6 cols: Campus Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                DIRECT ADMISSIONS DESK
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Visit Our Physical Tech Campus
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Step into our laboratories, inspect our workstation setups, speak directly with faculty members, and attend a free architectural demo session.
              </p>

              <div className="space-y-4 text-xs text-slate-300 font-mono">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Daily Operational Hours:</strong>
                    <p className="text-emerald-400 font-semibold mt-0.5">7:00 AM – 7:00 PM (Monday to Sunday)</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Campus Address:</strong>
                    <p className="text-slate-400 mt-0.5">404, 4th Floor, Vibrant Business Tower, Geeta Bhawan Square, A.B. Road, Indore, MP 452001</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Phone & WhatsApp Admissions:</strong>
                    <p className="text-slate-400 mt-0.5">+91 98260 64440</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Inquiry Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-2">Request an Offline Campus Consultation</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Fill in your details to receive syllabus brochures, cohort schedules, and scholarship criteria.
                </p>

                {inquirySubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-white text-base">Inquiry Dispatched</h4>
                    <p className="text-xs text-emerald-300">
                      Our offline admissions team will call you within 2 hours during active campus hours (7 AM – 7 PM).
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="rahul@example.com"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Program of Interest</label>
                      <select
                        value={inquiryForm.course}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, course: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="Full Stack Development">Full Stack Development (8 Months)</option>
                        <option value="DevOps & Cloud Engineering">DevOps & Cloud Engineering (7 Months)</option>
                        <option value="Data Structures & Algorithms / Systems Engineering">DSA & Systems Engineering (6 Months)</option>
                        <option value="Cybersecurity & Defense">Cybersecurity & Defense (6 Months)</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 gap-2">
                      <Send className="w-4 h-4" />
                      Submit Consultation Request
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COURSE DETAILS MODAL */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={selectedCourse.title}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono">
              <span className="text-sky-400 font-bold">{selectedCourse.duration}</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(selectedCourse.advertisedFee || 50000)} Tuition</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {selectedCourse.description}
            </p>

            {/* Modules Breakdown */}
            {selectedCourse.curriculum && Array.isArray(selectedCourse.curriculum) && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Detailed Syllabus & Modules
                </h4>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {selectedCourse.curriculum.map((mod, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="font-bold text-white font-mono">{mod.module || `Module ${idx + 1}`}</div>
                      {mod.topics && (
                        <div className="flex flex-wrap gap-1.5">
                          {mod.topics.map((top, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
                              {top}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Operating Hours: 7:00 AM – 7:00 PM</span>
              <Link to="/register-student" onClick={() => setSelectedCourse(null)}>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold">
                  Apply for Admission
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Developer Credits Modal Trigger */}
      <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </div>
  );
};
