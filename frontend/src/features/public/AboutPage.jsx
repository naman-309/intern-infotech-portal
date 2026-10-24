import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { GlassButton, GlassBadge, GlassCard3D } from '../../components/ui';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Users,
  GraduationCap,
  Cpu,
  Terminal,
  Database,
  Cloud,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  MagneticButton,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  PageTransition,
  AnimatedBackground,
} from '../../components/motion';

export const AboutPage = () => {
  const { data: overviewData } = useQuery({
    queryKey: ['publicOverview'],
    queryFn: () => api.get('/public/overview'),
  });

  const institute = overviewData?.data || null;

  const values = [
    {
      icon: Terminal,
      title: 'Production-First Training',
      desc: 'Every lab exercise mirrors real production environments with zero toy abstractions.',
      color: 'text-cyan-400',
    },
    {
      icon: Users,
      title: '1:15 Workstation Cohorts',
      desc: 'Maximum 15 students per batch guarantees direct pairing with lead architects.',
      color: 'text-indigo-400',
    },
    {
      icon: Cpu,
      title: 'Industrial Linux Clusters',
      desc: 'Dedicated Linux workstations, container registries, and local database nodes.',
      color: 'text-rose-400',
    },
    {
      icon: Database,
      title: 'Supervised Lab Examinations',
      desc: '3-hour practical examinations testing schema indexing, ACID transactions, and caching.',
      color: 'text-emerald-400',
    },
    {
      icon: Cloud,
      title: 'DevOps & SRE from Day One',
      desc: 'Docker, Nginx, circuit breakers, and distributed queues configured from Week 1.',
      color: 'text-amber-400',
    },
    {
      icon: Award,
      title: 'Audited Transparency',
      desc: 'Honest placement tracking with zero fabricated numbers or misleading marketing.',
      color: 'text-purple-400',
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 border-b border-white/10 overflow-hidden">
        <AnimatedBackground />

        {/* Ambient Top Glow Beam */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="down">
            <GlassBadge variant="primary" className="mb-4">ABOUT THE ACADEMY</GlassBadge>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Forging India's Next Generation of{' '}
              <span className="hologram-text">
                Software Architects
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Intern Infotech is an elite offline software engineering academy based in Bengaluru.
              We believe profound engineering competence is built through hands-on terminal practice, supervised lab exams, and architecture defense.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Terminal Experience */}
      <section className="py-16 sm:py-20 border-b border-white/10 bg-[#080B14]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-indigo-400">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              OUR PEDAGOGICAL PHILOSOPHY
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Real engineering education happens in production laboratories, not video playlists.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Most platforms deliver shallow, multiple-choice quizzes. At Intern Infotech, our offline
              center is engineered like a high-throughput systems facility. Every student workstation operates on
              Linux, connecting to isolated multi-node databases, Redis clusters, and automated performance suites.
            </p>
            <div className="space-y-3">
              {[
                'Supervised offline examinations with proctored workstation terminals',
                'Weekly whiteboard architectural design defense sessions with former principal engineers',
                'Selective verified admission guaranteeing high-intent, dedicated cohorts',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Glass Visual with 3D Depth */}
          <div className="relative">
            <GlassCard3D intensity={10} depth={20} className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-slate-300">infotech-academy-lab-terminal</span>
                </div>
                <GlassBadge variant="info">Live Offline Session</GlassBadge>
              </div>
              <div className="mt-4 font-mono text-xs space-y-2 text-slate-300">
                <p className="text-indigo-400">$ docker compose -f infra/docker-compose.yml up -d</p>
                <p className="text-emerald-400">✓ postgresql-cluster (port 5432) healthy</p>
                <p className="text-emerald-400">✓ redis-sentinel (port 6379) ready</p>
                <p className="text-emerald-400">✓ nginx-ingress-proxy (port 80) routing</p>
                <p className="text-indigo-400">$ node lab-exam-runner.js --test=concurrency</p>
                <p className="text-slate-400">
                  Executing 500 concurrent cookie-authenticated session operations...
                </p>
                <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-emerald-500/30 text-emerald-300 shadow-inner">
                  PASSED: 100% ACID compliance, 0 session leaks, p99 latency 14ms
                </div>
              </div>
            </GlassCard3D>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 border-b border-white/10 bg-[#05070D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <GlassBadge variant="warning">INSTITUTE STANDARDS</GlassBadge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3">
              What Sets Our Engineering Facility Apart
            </h2>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <StaggerItem key={idx}>
                  <GlassCard3D intensity={8} depth={18} className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                        <Icon className={`w-6 h-6 ${v.color}`} />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                    </div>
                  </GlassCard3D>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Campus Info & CTA */}
      <section className="py-16 sm:py-20 bg-[#080B14]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-glow-indigo">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Experience Our Bengaluru Campus in Person
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            {institute?.campus?.address || '402 Tech Hub, IT Corridor, Electronic City, Bengaluru 560100'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <MagneticButton>
                <GlassButton variant="primary" size="lg" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Book a Campus Visit
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </MagneticButton>
            </Link>
            <Link to="/courses">
              <MagneticButton>
                <GlassButton variant="outline" size="lg" className="gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  Explore Curriculum
                </GlassButton>
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default AboutPage;
