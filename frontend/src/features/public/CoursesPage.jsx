import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { GlassButton, GlassBadge, GlassCard3D } from '../../components/ui';
import {
  BookOpen,
  Calendar,
  ArrowRight,
  Search,
  GraduationCap,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  MagneticButton,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  PageTransition,
  AnimatedBackground,
} from '../../components/motion';

export const CoursesPage = () => {
  const [search, setSearch] = useState('');

  const { data: coursesData, isLoading, isError } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: () => api.get('/courses/public'),
  });

  const courses = coursesData?.data?.courses || coursesData?.data || [];
  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-white/10 overflow-hidden">
        <AnimatedBackground />

        {/* Ambient Top Glow Beam */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="down">
            <GlassBadge variant="primary" className="mb-4">ACADEMIC CURRICULUM</GlassBadge>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Production-Grade Engineering{' '}
              <span className="hologram-text">
                Cohorts
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Full-time and weekend offline immersive programs. Transparent advertised fees. Real production stack.
            </p>
          </ScrollReveal>

          {/* Search */}
          <ScrollReveal direction="up" delay={0.3}>
            <div className="mt-8 max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses by technology or keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-glass-sm"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Course Grid with 3D Glass Cards */}
      <section className="py-16 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-88 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">Unable to Load Courses</h3>
              <p className="text-sm text-slate-400 mt-1">Please verify your internet connection or try again later.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">
                {search ? 'No courses match your search' : 'No courses available currently'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {search ? 'Try a different keyword or category.' : 'Check back soon for upcoming offline cohorts.'}
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((course, idx) => (
                <StaggerItem key={course.id || idx}>
                  <GlassCard3D
                    intensity={10}
                    depth={24}
                    className="flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                        <img
                          src={
                            course.thumbnailUrl ||
                            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-transparent to-transparent opacity-80" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {course.featured && <GlassBadge variant="warning">Featured</GlassBadge>}
                          {course.duration && <GlassBadge variant="primary">{course.duration}</GlassBadge>}
                        </div>
                      </div>

                      {/* Content with Z-Depth Stagger */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                        {course.batches && course.batches.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              Next Cohort: {course.batches[0].name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {course.batches[0].timing || 'Weekday Hands-on Session'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Advertised Fee</div>
                        <div className="text-base font-bold text-white font-mono">
                          {formatCurrency(course.advertisedFee)}
                        </div>
                      </div>
                      <Link to={`/courses/${course.slug || course.id}`}>
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 hover:border-indigo-400/50"
                        >
                          Program Details <ArrowRight className="w-3.5 h-3.5" />
                        </GlassButton>
                      </Link>
                    </div>
                  </GlassCard3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-white/10 bg-[#080B14]/40">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Enter the Offline Engineering Floor?</h2>
          <p className="text-sm text-slate-400 mb-6">Apply for admission verification and reserve your workstation.</p>
          <Link to="/register-student">
            <MagneticButton>
              <GlassButton variant="primary" size="lg" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Request Admission
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </MagneticButton>
          </Link>
        </div>
      </section>
    </PageTransition>
  );
};

export default CoursesPage;
