import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { GlassButton, GlassCard3D } from '../../components/ui';
import { Code2, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  MagneticButton,
  AnimatedBackground,
  PageTransition,
} from '../../components/motion';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter your account email address'),
});

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values) => {
    try {
      await api.post('/auth/forgot-password', values);
      setSubmitted(true);
      toast.success('Password reset instructions dispatched.');
    } catch (err) {
      // Show same message to prevent enumeration
      setSubmitted(true);
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Recover Password</h2>
          <p className="text-xs text-slate-400">
            Enter your email to receive an expiring password reset token.
          </p>
        </div>

        <GlassCard3D intensity={8} depth={20} className="shadow-glass-lg p-6">
          <div className="space-y-4 pt-2">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glass-sm">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Instructions Dispatched</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If an account exists under that email, a password reset link has been dispatched. Please inspect your spam or inbox.
                </p>
                <Link to="/login">
                  <GlassButton variant="outline" className="w-full mt-2">
                    Back to Sign In
                  </GlassButton>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Account Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@infotech.edu"
                    {...register('email')}
                    className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <MagneticButton className="w-full">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-full gap-2 mt-2"
                  >
                    Send Recovery Email
                    <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </MagneticButton>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Cancel and return to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </GlassCard3D>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
