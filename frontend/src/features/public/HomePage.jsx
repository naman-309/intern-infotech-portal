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
} from 'lucide-react';
import { toast } from 'sonner';

export const HomePage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

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

  const courses = coursesData?.data?.courses || [];
  const stories = storiesData?.data?.stories || [];

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    toast.success('Inquiry received! Our offline admissions desk will call you shortly.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              2026 OFFLINE COHORTS ENROLLING NOW • IN-PERSON LABS
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Where Serious Engineers Master{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Distributed Systems
              </span>{' '}
              & Full-Stack Architecture
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We do not sell pre-recorded tutorials. At our state-of-the-art offline engineering campus in Bengaluru,
              you build resilient microservices, configure PostgreSQL clusters, and solve whiteboard algorithms guided by veteran tech leads.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="#courses">
                <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-indigo-600/25 gap-2">
                  <Terminal className="w-4 h-4" />
                  Explore Offline Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link to="/register-student">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 hover:border-slate-500">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Request Admission Verification
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 p-5 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{institute.stats.alumniPlaced}+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Engineers Placed</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 p-5 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">{institute.stats.topPackage}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Top Compensation</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 p-5 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{institute.stats.averageHike}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Average Salary Hike</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 p-5 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">1:15</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Faculty to Student Ratio</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT & OFFLINE PEDAGOGY SECTION */}
      <section id="about" className="py-20 border-b border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                THE OFFLINE LABORATORY PEDAGOGY
              </div>

              <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
                Real software engineering is not learned through multiple-choice quizzes.
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Most online platforms deliver shallow video summaries. At <strong>Intern Infotech</strong>, our offline center is designed like a production engineering floor. Every workstation runs Linux environments, local container registries, and high-speed multi-node databases.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Rigorous Offline Supervised Examinations:</strong> 3-hour practical lab exams requiring full implementations of secure microservices, schema indexing, and frontend state caching.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Whiteboard Architecture Drills:</strong> Weekly live architectural design defense sessions with former principal engineers and tech leads.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Selective Admission Process:</strong> Verified offline enrollment ensures that cohorts consist exclusively of dedicated, high-intent learners.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a href="#contact">
                  <Button variant="outline" className="gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    Visit Our Bengaluru Campus
                  </Button>
                </a>
              </div>
            </div>

            {/* Architecture Visual Card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 opacity-20 blur-xl"></div>
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="ml-2">infotech-academy-lab-terminal</span>
                  </div>
                  <Badge variant="info">Offline Lab Session</Badge>
                </div>

                <div className="mt-4 font-mono text-xs space-y-2 text-slate-300">
                  <p className="text-indigo-400">$ git clone academy/production-microservice</p>
                  <p className="text-slate-400">Cloning into 'production-microservice'...</p>
                  <p className="text-indigo-400">$ docker-compose -f infra/docker-compose.yml up -d</p>
                  <p className="text-emerald-400">✓ postgresql-cluster (port 5432) healthy</p>
                  <p className="text-emerald-400">✓ redis-sentinel (port 6379) ready</p>
                  <p className="text-emerald-400">✓ nginx-api-gateway (port 80) routing</p>
                  <p className="text-indigo-400">$ node lab-exam-runner.js --test=concurrency</p>
                  <p className="text-slate-300">
                    Running 500 concurrent cookie-authenticated session checks...
                  </p>
                  <div className="mt-3 p-3 rounded bg-slate-950/80 border border-emerald-500/30 text-emerald-300">
                    PASSED: 100% ACID compliance, 0 session leaks, p99 latency 14ms
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COURSES & CATALOG SECTION */}
      <section id="courses" className="py-20 border-b border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-2">
                CURATED ACADEMIC CATALOG
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Production-Grade Engineering Courses
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Full-time and weekend offline immersive programs. Transparent advertised fees.
              </p>
            </div>

            {/* Course Search */}
            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Search programs by technology..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                      <img
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {course.featured && <Badge variant="warning">Featured</Badge>}
                        <Badge variant="primary">{course.duration}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Batches available */}
                      {course.batches && course.batches.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            Next Batch: {course.batches[0].name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {course.batches[0].timing || 'Weekday Offline Lab'}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <CardFooter className="px-6 py-4 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Advertised Fee</div>
                      <div className="text-base font-bold text-slate-100 font-mono">
                        {formatCurrency(course.advertisedFee)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                      className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                    >
                      View Curriculum
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. CURRICULUM & TECHNOLOGIES SECTION */}
      <section id="curriculum" className="py-20 border-b border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="info">INDUSTRY-STANDARD STACK</Badge>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Technologies You Will Build With Every Day
            </h2>
            <p className="text-slate-400 text-sm">
              No toy applications. We train you strictly on the stack top engineering teams use in high-throughput production.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
              <Code2 className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-200">React & Vite</div>
              <div className="text-[11px] text-slate-500 mt-1">Reactive Frontends</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
              <Terminal className="w-8 h-8 text-sky-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-200">Node & Express</div>
              <div className="text-[11px] text-slate-500 mt-1">Microservices</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
              <Database className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-200">Postgres & Prisma</div>
              <div className="text-[11px] text-slate-500 mt-1">Relational Internals</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
              <Cpu className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-200">Redis & BullMQ</div>
              <div className="text-[11px] text-slate-500 mt-1">Durable Job Queues</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
              <Cloud className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-200">Docker & Nginx</div>
              <div className="text-[11px] text-slate-500 mt-1">Reverse Proxying</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
              <Layers className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-200">System Design</div>
              <div className="text-[11px] text-slate-500 mt-1">High Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STUDENT SUCCESS STORIES SECTION */}
      <section id="success-stories" className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Badge variant="success">ALUMNI PLACEMENT OUTCOMES</Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                Engineers Who Trained at Our Offline Campus
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real alumni working at world-class product engineering organizations.
              </p>
            </div>
            <div className="text-xs text-slate-500 max-w-sm">
              *Transparent institute policy: Results reflect students' individual hard work and dedication. Employment is not guaranteed.
            </div>
          </div>

          {storiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={story.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.studentName)}`}
                        alt={story.studentName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
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

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Course: {story.courseCompleted}</span>
                    <span>Class of {story.placementYear}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. CONTACT & OFFLINE ADMISSIONS INQUIRY */}
      <section id="contact" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Campus Info Card */}
            <div className="space-y-6">
              <div>
                <Badge variant="primary">CAMPUS VISITS & COUNSELING</Badge>
                <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                  Visit Our Offline Admissions Office
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Students enroll offline after a personal technical evaluation and campus tour.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Main Campus & Lab Facility</h4>
                    <p className="text-xs text-slate-400 mt-1">{institute.campus?.address || '402 Tech Hub, IT Corridor, Electronic City, Bengaluru 560100'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Direct Admissions Desk</h4>
                    <p className="text-xs text-slate-400 mt-1">{institute.campus?.phone || '+91 98765 43210'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Academic Inquiries</h4>
                    <p className="text-xs text-slate-400 mt-1">{institute.campus?.email || 'admissions@infotech-academy.edu'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Inquiry Form */}
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Book an Offline Lab Visit</h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in your details to schedule a campus tour and lab trial session.
              </p>

              {inquirySubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-emerald-300">Appointment Request Confirmed</h4>
                  <p className="text-xs text-slate-400">
                    Our admissions team has received your inquiry. We will contact you at your provided phone number to confirm your campus visit slot.
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
                      className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Required for campus entry pass)</label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Course of Interest</label>
                    <select
                      className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option>Full-Stack Software Engineering (6 Months)</option>
                      <option>Distributed Systems & Backend Architecture (4 Months)</option>
                      <option>Advanced Data Structures & Algorithms (3 Months)</option>
                      <option>DevOps & Cloud Native Systems (4 Months)</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Submit Campus Visit Request
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM MODAL */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={selectedCourse.title}
          description={`Course Duration: ${selectedCourse.duration} • Advertised Fee: ${formatCurrency(selectedCourse.advertisedFee)}`}
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
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-xs font-semibold text-indigo-400 font-mono">{mod.module}</div>
                      {mod.topics && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mod.topics.map((t, tidx) => (
                            <span key={tidx} className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-300">
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

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Advertised Tuition</div>
                <div className="text-lg font-bold text-white font-mono">{formatCurrency(selectedCourse.advertisedFee)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                  Close
                </Button>
                <Link to="/register-student">
                  <Button size="sm">Request Admission</Button>
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
