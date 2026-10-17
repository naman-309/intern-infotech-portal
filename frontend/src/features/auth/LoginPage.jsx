import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Code2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.success('Login successful! Welcome back.');

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              INTERN <span className="text-indigo-400">INFOTECH</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Portal Authentication</h2>
          <p className="text-xs text-slate-400">
            Sign in with your approved institute account (Students, Faculty & Staff)
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl">
          <CardContent className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="e.g. student@infotech.edu"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full gap-2">
                Sign In to Portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/80 flex flex-col gap-2 text-center text-xs text-slate-400">
            <div>
              New student enrolled offline?{' '}
              <Link to="/register-student" className="text-indigo-400 hover:underline font-semibold">
                Request Account Activation
              </Link>
            </div>
            <div>
              Faculty applicant?{' '}
              <Link to="/register-teacher" className="text-slate-400 hover:text-white underline">
                Submit Teacher Application
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Demo Credentials Helper for Evaluators */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400 space-y-1.5 font-mono">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Demo Credentials (Seed Accounts):
          </div>
          <div className="flex justify-between">
            <span>Admin:</span>
            <span className="text-indigo-300">admin@infotech.edu / SecurePass@2026</span>
          </div>
          <div className="flex justify-between">
            <span>Teacher:</span>
            <span className="text-indigo-300">prof.sharma@infotech.edu / SecurePass@2026</span>
          </div>
          <div className="flex justify-between">
            <span>Student:</span>
            <span className="text-indigo-300">student@infotech.edu / SecurePass@2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
