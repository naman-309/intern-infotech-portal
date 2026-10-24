import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { GlassButton, GlassBadge, GlassCard3D, GlassPanel } from '../../components/ui';
import {
  ArrowLeft,
  Calendar,
  Clock,
  GraduationCap,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import {
  MagneticButton,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  PageTransition,
  AnimatedBackground,
} from '../../components/motion';

export const CourseDetailPage = () => {
  const { slug } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicCourse', slug],
    queryFn: () => api.get(`/courses/public/${slug}`),
    enabled: !!slug,
  });

  const course = data?.data?.course || data?.data || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070D] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-8 w-48 rounded-xl bg-white/[0.04] animate-pulse border border-white/10" />
          <div className="h-72 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
          <div className="h-6 w-3/4 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-[#05070D] flex items-center justify-center p-4">
        <GlassCard3D className="p-8 text-center max-w-md w-full space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Course Not Found</h2>
          <p className="text-xs text-slate-400">The curriculum cohort you are looking for does not exist or has concluded.</p>
          <Link to="/courses">
            <GlassButton variant="outline" className="gap-2 mt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Curriculum Catalog
            </GlassButton>
          </Link>
        </GlassCard3D>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-12 sm:py-20 border-b border-white/10 overflow-hidden">
        <AnimatedBackground />

        {/* Top Glow Beam */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-indigo-400 transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO CURRICULUM CATALOG
          </Link>

          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.featured && <GlassBadge variant="warning">Featured Program</GlassBadge>}
              {course.duration && <GlassBadge variant="primary">{course.duration}</GlassBadge>}
              {course.status && <GlassBadge variant="info">{course.status}</GlassBadge>}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {course.advertisedFee && (
                <div className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-glass-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Advertised Fee</div>
                  <div className="text-xl font-bold text-white font-mono">{formatCurrency(course.advertisedFee)}</div>
                </div>
              )}
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
          </div>
        </div>
      </section>

      {/* Course Thumbnail */}
      {course.thumbnailUrl && (
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-glass-lg max-h-96">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </section>
      )}

      {/* Curriculum Modules */}
      {course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0 && (
        <section className="py-12 sm:py-16 border-t border-white/10 bg-[#080B14]/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Syllabus & Engineering Modules
            </h2>
            <StaggerContainer className="space-y-4">
              {course.curriculum.map((mod, idx) => (
                <StaggerItem key={idx}>
                  <GlassCard3D intensity={6} depth={16} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{mod.module}</h3>
                    </div>
                    {mod.topics && (
                      <div className="flex flex-wrap gap-1.5 pl-11">
                        {mod.topics.map((t, tidx) => (
                          <span key={tidx} className="px-2.5 py-1 rounded-md text-[11px] bg-white/[0.04] border border-white/10 text-slate-300 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </GlassCard3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Batches */}
      {course.batches && course.batches.length > 0 && (
        <section className="py-12 sm:py-16 border-t border-white/10 bg-[#05070D]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Available Offline Batches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.batches.map((batch, idx) => (
                <GlassCard3D key={batch.id || idx} intensity={6} className="p-5">
                  <h3 className="text-sm font-semibold text-white">{batch.name}</h3>
                  {batch.timing && <p className="text-xs text-slate-400 mt-1">{batch.timing}</p>}
                  {batch.startDate && (
                    <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Starts: {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </GlassCard3D>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 border-t border-white/10 bg-[#080B14]/40">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Enroll in {course.title}</h2>
          <p className="text-sm text-slate-400 mb-6">Complete offline enrollment verification and secure your workstation.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register-student">
              <MagneticButton>
                <GlassButton variant="primary" size="lg" className="gap-2">
                  <GraduationCap className="w-4 h-4" /> Apply for Admission <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </MagneticButton>
            </Link>
            <Link to="/contact">
              <MagneticButton>
                <GlassButton variant="outline" size="lg">
                  Book Campus Visit
                </GlassButton>
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default CourseDetailPage;
