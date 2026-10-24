import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { GlassButton, GlassCard3D, GlassBadge } from '../../components/ui';
import { Code2, Mail, ArrowRight, AlertCircle, Briefcase, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import {
  MagneticButton,
  AnimatedBackground,
  PageTransition,
} from '../../components/motion';

const teacherRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid institutional or personal email is required'),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  specialization: z.string().min(3, 'Specialization is required (e.g. Distributed Systems)'),
  qualifications: z.string().min(3, 'Qualifications are required (e.g. M.Tech / Ex-FAANG)'),
  bio: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const TeacherRegisterPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(teacherRegisterSchema),
  });

  const onSubmit = async (values) => {
    try {
      setServerError('');
      const res = await api.post('/auth/register-request/teacher', values);
      setIsSuccess(true);
      toast.success(res.message || 'Application submitted successfully');
    } catch (err) {
      setServerError(err.message || 'Application failed');
      toast.error(err.message || 'Application failed');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-[#05070D] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border border-white/20"
            >
              <Code2 className="w-5 h-5" />
            </motion.div>
            <span className="text-xl font-bold text-white tracking-tight">
              INTERN <span className="bg-gradient-to-r from-indigo-400 to-sky-300 bg-clip-text text-transparent">INFOTECH</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Faculty & Instructor Application</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Join our offline engineering faculty. All instructor applications are reviewed directly by the Director of Engineering.
          </p>
        </div>

        <GlassCard3D intensity={8} depth={20} className="shadow-glass-lg">
          <div className="p-6">
            {isSuccess ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 shadow-glass-sm">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Application Received</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  A verification link has been sent to your email. Please verify your email to submit your profile to the administrative review queue.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <GlassButton variant="outline" className="w-full">
                      Return to Sign In
                    </GlassButton>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {serverError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                      <input
                        placeholder="e.g. Vikram"
                        {...register('firstName')}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                      <input
                        placeholder="e.g. Sharma"
                        {...register('lastName')}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. vikram.sharma@example.com"
                      {...register('email')}
                      className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      {...register('phone')}
                      className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Specialization</label>
                      <input
                        placeholder="e.g. Distributed Systems"
                        {...register('specialization')}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      {errors.specialization && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.specialization.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Experience / Credentials</label>
                      <input
                        placeholder="e.g. Ex-Staff Eng / M.Tech"
                        {...register('qualifications')}
                        className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      {errors.qualifications && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.qualifications.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Industry Background (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Summarize your systems or software background…"
                      {...register('bio')}
                      className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
                    <input
                      type="password"
                      placeholder="Min 8 characters"
                      {...register('password')}
                      className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {errors.password && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <MagneticButton className="w-full">
                    <GlassButton
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="w-full gap-2 mt-2"
                    >
                      Submit Faculty Application
                      <ArrowRight className="w-4 h-4" />
                    </GlassButton>
                  </MagneticButton>
                </form>
              </>
            )}
          </div>

          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Already have faculty credentials?</span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </GlassCard3D>
      </div>
    </PageTransition>
  );
};

export default TeacherRegisterPage;
