import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { GlassButton, GlassCard3D, GlassBadge } from '../../components/ui';
import { Code2, ArrowRight, AlertCircle, Lock, Mail, Key } from 'lucide-react';
import { toast } from 'sonner';
import {
  MagneticButton,
  AnimatedBackground,
  PageTransition,
} from '../../components/motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    try {
      setErrorMessage('');
      const res = await login(values.email, values.password);
      toast.success('Authentication verified. Welcome back.');

      // Route by role
      const user = res.data?.user;
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else if (user?.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-[#05070D] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-6 relative z-10">
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Portal Authentication</h2>
          <p className="text-xs text-slate-400">
            Sign in with your approved institute account (Students, Faculty & Staff)
          </p>
        </div>

        <GlassCard3D intensity={8} depth={20} className="shadow-glass-lg">
          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Institute Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="student@infotech.edu"
                    {...register('email')}
                    className="w-full h-10 pl-10 pr-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Security Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full h-10 pl-10 pr-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
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
                  Sign In to Portal
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </MagneticButton>
            </form>
          </div>

          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex flex-col gap-2 text-center text-xs text-slate-400">
            <div>
              New student enrolled offline?{' '}
              <Link to="/register-student" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Request Account Activation
              </Link>
            </div>
            <div>
              Faculty applicant?{' '}
              <Link to="/register-teacher" className="text-slate-400 hover:text-white underline transition-colors">
                Submit Teacher Application
              </Link>
            </div>
          </div>
        </GlassCard3D>

        {/* Demo Credentials Helper for Evaluators */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-slate-400 space-y-1.5 font-mono backdrop-blur-md shadow-glass-sm">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Seed Account Credentials:
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Admin:</span>
            <span className="text-indigo-300 select-all">admin@infotech.edu / SecurePass@2026</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Teacher:</span>
            <span className="text-indigo-300 select-all">prof.sharma@infotech.edu / SecurePass@2026</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Student:</span>
            <span className="text-indigo-300 select-all">student@infotech.edu / SecurePass@2026</span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
