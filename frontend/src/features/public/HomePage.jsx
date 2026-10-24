import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { formatCurrency, cn } from '../../lib/utils';
import {
  GlassButton,
  GlassBadge,
  GlassCard,
  GlassCard3D,
  GlassStat,
  GlassModal,
  GlassInput,
} from '../../components/ui';
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
  Send,
  Zap,
  Search,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import SplineScene from '../../components/3d/SplineScene';
import { Architecture3D } from '../../components/3d/Architecture3D';
import {
  MagneticButton,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  PageTransition,
  AnimatedBackground,
} from '../../components/motion';

export const HomePage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    course: 'Full-Stack Software Engineering',
  });

  // 1. Fetch Overview & Stats (Real Backend Data)
  const { data: overviewData } = useQuery({
    queryKey: ['publicOverview'],
    queryFn: () => api.get('/public/overview'),
  });

  // 2. Fetch Public Courses (Real Backend Data)
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: () => api.get('/courses/public'),
  });

  // 3. Fetch Success Stories (Real Backend Data)
  const { data: storiesData, isLoading: storiesLoading } = useQuery({
    queryKey: ['publicStories'],
    queryFn: () => api.get('/success-stories/public'),
  });

  const institute = overviewData?.data || {
    name: 'Intern Infotech Institute of Software Engineering',
    tagline: 'Master Production-Grade Full-Stack & Systems Engineering with Industry Architects',
    stats: {
      alumniPlaced: 1250,
      activeCourses: 5,
      activeBatches: 8,
      averageHike: '140%',
      topPackage: '42 LPA',
    },
    technologies: [
      { name: 'React & State Architecture', category: 'Frontend' },
      { name: 'Node.js Microservices', category: 'Backend' },
      { name: 'PostgreSQL & Prisma', category: 'Databases' },
      { name: 'Redis & BullMQ', category: 'Caching & Queues' },
      { name: 'Docker & Nginx', category: 'DevOps' },
      { name: 'Distributed Systems', category: 'Architecture' },
    ],
  };

  const courses = coursesData?.data?.courses || coursesData?.data || [];
  const stories = storiesData?.data?.stories || storiesData?.data || [];

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    toast.success('Inquiry received! Our offline admissions desk will call you shortly.');
  };

  return (
    <PageTransition className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col overflow-x-hidden">
      {/* 1. CINEMATIC HERO SECTION WITH 3D EXPERIENCE */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-white/10">
        <AnimatedBackground />

        {/* Ambient Top Glow Beam */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <ScrollReveal direction="down" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono tracking-wide shadow-glass-sm backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>2026 OFFLINE COHORTS ENROLLING NOW • IN-PERSON LABS</span>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Where Serious Engineers Master{' '}
                  <span className="hologram-text">
                    Distributed Systems
                  </span>{' '}
                  & Full-Stack Architecture
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  We do not sell pre-recorded tutorials. At our state-of-the-art offline engineering campus in Bengaluru,
                  you build resilient microservices, configure PostgreSQL clusters, and solve whiteboard algorithms guided by veteran tech leads.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <a href="#courses" className="w-full sm:w-auto">
                    <MagneticButton className="w-full sm:w-auto">
                      <GlassButton size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                        <Terminal className="w-4 h-4" />
                        Explore Offline Courses
                        <ArrowRight className="w-4 h-4" />
                      </GlassButton>
                    </MagneticButton>
                  </a>
                  <Link to="/register-student" className="w-full sm:w-auto">
                    <MagneticButton className="w-full sm:w-auto">
                      <GlassButton
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto text-slate-200 hover:text-white"
                      >
                        <GraduationCap className="w-4 h-4 mr-2 text-indigo-400" />
                        Request Admission
                      </GlassButton>
                    </MagneticButton>
                  </Link>
                </div>
              </ScrollReveal>

              {/* Floating Feature Badges */}
              <ScrollReveal direction="up" delay={0.5}>
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>100% Supervised Labs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real Microservices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Offline Exam Verification</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: 3D Holographic Scene Centerpiece */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <ScrollReveal direction="none" delay={0.25} className="w-full">
                <SplineScene />
              </ScrollReveal>
            </div>
          </div>

          {/* Real Backend Stats Bar with 3D Glass Cards */}
          <div className="mt-16">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <StaggerItem>
                <GlassStat
                  label="Engineers Placed"
                  value={`${institute.stats.alumniPlaced}+`}
                  sublabel="Verified alumni"
                  color="indigo"
                  icon={Users}
                />
              </StaggerItem>

              <StaggerItem>
                <GlassStat
                  label="Top Compensation"
                  value={institute.stats.topPackage}
                  sublabel="Highest CTC secured"
                  color="cyan"
                  icon={Award}
                />
              </StaggerItem>

              <StaggerItem>
                <GlassStat
                  label="Average Salary Hike"
                  value={institute.stats.averageHike}
                  sublabel="Pre vs post cohort"
                  color="emerald"
                  icon={Zap}
                />
              </StaggerItem>

              <StaggerItem>
                <GlassStat
                  label="Faculty Ratio"
                  value="1:15"
                  sublabel="Dedicated mentorship"
                  color="amber"
                  icon={Building2}
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* 2. PEDAGOGY & 3D ARCHITECTURE SECTION */}
      <section id="about" className="py-20 border-b border-white/10 bg-[#080B14]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-indigo-400">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              THE OFFLINE LABORATORY PEDAGOGY
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Real software engineering is built on production floors, not tutorial videos.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              At <strong>Intern Infotech</strong>, our Bengaluru campus runs like a production engineering floor.
              Every workstation runs native Linux distributions, local Redis and PostgreSQL clusters, and automated load-testing frameworks.
            </p>
          </div>

          {/* Interactive 3D Architecture Stack */}
          <Architecture3D className="my-8" />
        </div>
      </section>

      {/* 3. COURSES & CATALOG SECTION WITH 3D GLASS CARDS */}
      <section id="courses" className="py-20 border-b border-white/10 bg-[#05070D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-2 border border-indigo-500/20">
                CURATED ACADEMIC CATALOG
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Production-Grade Engineering Programs
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Full-time and weekend offline immersive cohorts. Transparent advertised fees.
              </p>
            </div>

            {/* Course Search */}
            <div className="w-full md:w-72 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search programs by technology…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No courses match your criteria</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <StaggerItem key={course.id}>
                  <GlassCard3D
                    intensity={10}
                    depth={24}
                    className="flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* Thumbnail with overlay gradient */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                        <img
                          src={
                            course.thumbnailUrl ||
                            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-transparent to-transparent opacity-80" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {course.featured && <GlassBadge variant="warning">Featured</GlassBadge>}
                          <GlassBadge variant="primary">{course.duration}</GlassBadge>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Batches available */}
                        {course.batches && course.batches.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              Next Batch: {course.batches[0].name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {course.batches[0].timing || 'Weekday Offline Lab Session'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Advertised Tuition</div>
                        <div className="text-base font-bold text-white font-mono">
                          {formatCurrency(course.advertisedFee)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedCourse(course)}
                        >
                          Curriculum
                        </GlassButton>
                        <Link to={`/courses/${course.slug || course.id}`}>
                          <GlassButton variant="primary" size="sm">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </GlassButton>
                        </Link>
                      </div>
                    </div>
                  </GlassCard3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* 4. TECHNOLOGIES YOU MASTER */}
      <section id="curriculum" className="py-20 border-b border-white/10 bg-[#080B14]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <GlassBadge variant="info">INDUSTRY ARCHITECT STACK</GlassBadge>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Technologies You Will Build With Every Day
            </h2>
            <p className="text-slate-400 text-sm">
              No toy applications. We train you strictly on the stack top engineering teams use in high-throughput production.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StaggerItem>
              <GlassCard3D intensity={12} className="p-5 text-center">
                <FloatingElement delay={0} yOffset={5}>
                  <Code2 className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                </FloatingElement>
                <div className="font-semibold text-sm text-white">React & Vite</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">Reactive Frontends</div>
              </GlassCard3D>
            </StaggerItem>

            <StaggerItem>
              <GlassCard3D intensity={12} className="p-5 text-center">
                <FloatingElement delay={0.2} yOffset={5}>
                  <Terminal className="w-8 h-8 text-sky-400 mx-auto mb-3" />
                </FloatingElement>
                <div className="font-semibold text-sm text-white">Node & Express</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">Microservices</div>
              </GlassCard3D>
            </StaggerItem>

            <StaggerItem>
              <GlassCard3D intensity={12} className="p-5 text-center">
                <FloatingElement delay={0.4} yOffset={5}>
                  <Database className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                </FloatingElement>
                <div className="font-semibold text-sm text-white">Postgres & Prisma</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">Relational Internals</div>
              </GlassCard3D>
            </StaggerItem>

            <StaggerItem>
              <GlassCard3D intensity={12} className="p-5 text-center">
                <FloatingElement delay={0.6} yOffset={5}>
                  <Cpu className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                </FloatingElement>
                <div className="font-semibold text-sm text-white">Redis & BullMQ</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">Durable Queues</div>
              </GlassCard3D>
            </StaggerItem>

            <StaggerItem>
              <GlassCard3D intensity={12} className="p-5 text-center">
                <FloatingElement delay={0.8} yOffset={5}>
                  <Cloud className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                </FloatingElement>
                <div className="font-semibold text-sm text-white">Docker & Nginx</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">Reverse Proxying</div>
              </GlassCard3D>
            </StaggerItem>

            <StaggerItem>
              <GlassCard3D intensity={12} className="p-5 text-center">
                <FloatingElement delay={1.0} yOffset={5}>
                  <Layers className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                </FloatingElement>
                <div className="font-semibold text-sm text-white">System Design</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">High Availability</div>
              </GlassCard3D>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 5. STUDENT SUCCESS STORIES SECTION */}
      <section id="success-stories" className="py-20 border-b border-white/10 bg-[#05070D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <GlassBadge variant="success">ALUMNI PLACEMENT OUTCOMES</GlassBadge>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                Engineers Who Trained at Our Offline Campus
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real alumni working at world-class product engineering organizations.
              </p>
            </div>
            <div className="text-xs text-slate-500 max-w-sm">
              *Institute Transparency Policy: Outcomes reflect dedicated individual labor. Employment is not guaranteed.
            </div>
          </div>

          {storiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No Success Stories Available Yet</h3>
              <p className="text-xs text-slate-400 mt-1">Check back soon as our latest cohort completes placements.</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StaggerItem key={story.id}>
                  <GlassCard3D intensity={8} depth={20} className="p-6 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            story.photoUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(story.studentName)}&background=4f46e5&color=fff`
                          }
                          alt={story.studentName}
                          className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-md"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{story.studentName}</h4>
                          <div className="text-xs text-indigo-400 font-medium">{story.jobTitle}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            {story.companyName} {story.packageLPA && `• ${story.packageLPA}`}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{story.testimonial}"
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Course: {story.courseCompleted}</span>
                      <span>Class of {story.placementYear}</span>
                    </div>
                  </GlassCard3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* 6. CONTACT & OFFLINE ADMISSIONS INQUIRY */}
      <section id="contact" className="py-20 bg-[#080B14]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Campus Info Card */}
            <div className="space-y-6">
              <div>
                <GlassBadge variant="primary">CAMPUS VISITS & COUNSELING</GlassBadge>
                <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                  Visit Our Offline Admissions Office
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Students enroll offline after a personal technical evaluation and campus tour.
                </p>
              </div>

              <div className="space-y-4">
                <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Main Campus & Lab Facility</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {institute.campus?.address || '402 Tech Hub, IT Corridor, Electronic City, Bengaluru 560100'}
                    </p>
                  </div>
                </GlassCard3D>

                <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Direct Admissions Desk</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {institute.campus?.phone || '+91 98765 43210'}
                    </p>
                  </div>
                </GlassCard3D>

                <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Academic Inquiries</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {institute.campus?.email || 'admissions@interninfotech.edu'}
                    </p>
                  </div>
                </GlassCard3D>
              </div>
            </div>

            {/* Offline Inquiry Form */}
            <div>
              <GlassCard3D intensity={6} className="p-8">
                <h3 className="text-lg font-bold text-white mb-1">Book an Offline Lab Visit</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Fill in your details to schedule a campus tour and lab trial session.
                </p>

                {inquirySubmitted ? (
                  <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-semibold text-emerald-300">Appointment Request Confirmed</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Our admissions desk has logged your visit inquiry. We will contact you at your phone number to coordinate your workstation trial pass.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Phone Number (Required for campus entry pass)
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Program of Interest</label>
                      <select
                        value={inquiryForm.course}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, course: e.target.value })}
                        className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Full-Stack Software Engineering (6 Months)</option>
                        <option>Distributed Systems & Backend Architecture (4 Months)</option>
                        <option>Advanced Data Structures & Algorithms (3 Months)</option>
                        <option>DevOps & Cloud Native Systems (4 Months)</option>
                      </select>
                    </div>
                    <MagneticButton className="w-full">
                      <GlassButton type="submit" variant="primary" className="w-full gap-2 mt-2">
                        <Send className="w-4 h-4" />
                        Submit Campus Visit Request
                      </GlassButton>
                    </MagneticButton>
                  </form>
                )}
              </GlassCard3D>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM GLASS MODAL */}
      {selectedCourse && (
        <GlassModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={selectedCourse.title}
          description={`Duration: ${selectedCourse.duration} • Advertised Fee: ${formatCurrency(selectedCourse.advertisedFee)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 font-mono mb-2">Program Overview</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedCourse.description}</p>
            </div>

            {selectedCourse.curriculum && Array.isArray(selectedCourse.curriculum) && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 font-mono mb-3">Detailed Curriculum Modules</h4>
                <div className="space-y-3">
                  {selectedCourse.curriculum.map((mod, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-xs font-semibold text-indigo-400 font-mono">{mod.module}</div>
                      {mod.topics && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mod.topics.map((t, tidx) => (
                            <span key={tidx} className="px-2 py-0.5 rounded text-[11px] bg-white/[0.04] border border-white/10 text-slate-300 font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Advertised Tuition</div>
                <div className="text-lg font-bold text-white font-mono">{formatCurrency(selectedCourse.advertisedFee)}</div>
              </div>
              <div className="flex gap-2">
                <GlassButton variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                  Close
                </GlassButton>
                <Link to="/register-student">
                  <GlassButton variant="primary" size="sm">
                    Request Admission
                  </GlassButton>
                </Link>
              </div>
            </div>
          </div>
        </GlassModal>
      )}
    </PageTransition>
  );
};

export default HomePage;
