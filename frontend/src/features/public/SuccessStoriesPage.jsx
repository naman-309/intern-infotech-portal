import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { GlassButton, GlassBadge, GlassCard3D } from '../../components/ui';
import {
  Award,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Quote,
  Building,
} from 'lucide-react';
import {
  MagneticButton,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  PageTransition,
  AnimatedBackground,
} from '../../components/motion';

export const SuccessStoriesPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicStories'],
    queryFn: () => api.get('/success-stories/public'),
  });

  const stories = data?.data?.stories || data?.data || [];

  return (
    <PageTransition className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-white/10 overflow-hidden">
        <AnimatedBackground />

        {/* Ambient Top Glow Beam */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-b from-emerald-500/15 via-cyan-500/5 to-transparent blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="down">
            <GlassBadge variant="success" className="mb-4">VERIFIED ALUMNI OUTCOMES</GlassBadge>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Engineers Who Trained at{' '}
              <span className="hologram-text">
                Our Offline Campus
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Real alumni working at world-class product engineering organizations.
              Results reflect students' individual hard work and laboratory dedication.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">Unable to Load Stories</h3>
              <p className="text-sm text-slate-400 mt-1">Please verify your connection and try again.</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">No Success Stories Published Yet</h3>
              <p className="text-sm text-slate-400 mt-1">Our current cohorts are preparing for placement defense. Check back soon!</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, idx) => (
                <StaggerItem key={story.id || idx}>
                  <GlassCard3D
                    intensity={8}
                    depth={20}
                    className="p-6 flex flex-col justify-between h-full group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            story.photoUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              story.studentName || 'Alumni'
                            )}&background=4f46e5&color=fff`
                          }
                          alt={story.studentName}
                          className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{story.studentName}</h4>
                          <div className="text-xs text-indigo-400 font-medium truncate">{story.jobTitle}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate">
                            <Building className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{story.companyName}</span>
                            {story.packageLPA && <span className="text-emerald-400">• {story.packageLPA}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <Quote className="w-5 h-5 text-white/10 absolute -top-1 -left-1 pointer-events-none" />
                        <p className="text-xs text-slate-300 italic leading-relaxed pl-4">
                          "{story.testimonial}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="truncate">Course: {story.courseCompleted}</span>
                      <span className="shrink-0">Class of {story.placementYear}</span>
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
          <h2 className="text-2xl font-bold text-white mb-2">Write Your Own Success Story</h2>
          <p className="text-sm text-slate-400 mb-6">Join our offline engineering cohorts and build production systems with industry architects.</p>
          <Link to="/register-student">
            <MagneticButton>
              <GlassButton variant="primary" size="lg" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Request Admission Verification
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </MagneticButton>
          </Link>
        </div>
      </section>
    </PageTransition>
  );
};

export default SuccessStoriesPage;
