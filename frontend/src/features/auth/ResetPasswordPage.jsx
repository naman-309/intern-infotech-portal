import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { GlassButton, GlassCard3D } from '../../components/ui';
import { Code2, AlertCircle, Key, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  MagneticButton,
  AnimatedBackground,
  PageTransition,
} from '../../components/motion';

const resetSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values) => {
    if (!token) {
      setErrorMsg('Missing password reset token in URL.');
      return;
    }

    try {
      setErrorMsg('');
      await api.post('/auth/reset-password', {
        token,
        newPassword: values.newPassword,
      });

      toast.success('Password successfully reset! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed or token expired.');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-[#05070D] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Set New Password</h2>
          <p className="text-xs text-slate-400">
            Please create a secure password containing at least 8 characters.
          </p>
        </div>

        <GlassCard3D intensity={8} depth={20} className="shadow-glass-lg p-6">
          <div className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    {...register('newPassword')}
                    className="w-full h-10 pl-10 pr-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    {...register('confirmPassword')}
                    className="w-full h-10 pl-10 pr-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <MagneticButton className="w-full">
                <GlassButton
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full gap-2 mt-2"
                >
                  Save New Password
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </MagneticButton>
            </form>
          </div>

          <div className="pt-4 border-t border-white/10 text-center">
            <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
              Cancel and return to login
            </Link>
          </div>
        </GlassCard3D>
      </div>
    </PageTransition>
  );
};

export default ResetPasswordPage;
