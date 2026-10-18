import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Code2, Briefcase, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../../components/shared/Logo';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center group mb-2 hover:opacity-90 transition-opacity">
            <Logo textClassName="text-2xl sm:text-3xl" isDark={true} />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Faculty & Instructor Application</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Join our offline engineering faculty. All instructor applications are reviewed directly by the Director of Engineering.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
          <CardContent className="p-6">
            {isSuccess ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Application Received</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  A verification link has been sent to your email. Please verify your email to submit your profile to the administrative review queue.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {serverError && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                      <Input placeholder="e.g. Vikram" error={errors.firstName?.message} {...register('firstName')} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                      <Input placeholder="e.g. Sharma" error={errors.lastName?.message} {...register('lastName')} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="e.g. vikram.sharma@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                    <Input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Primary Specialization</label>
                      <Input
                        placeholder="e.g. Distributed Systems"
                        error={errors.specialization?.message}
                        {...register('specialization')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Qualifications / Experience</label>
                      <Input
                        placeholder="e.g. Ex-Staff Eng / M.Tech"
                        error={errors.qualifications?.message}
                        {...register('qualifications')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Brief Bio / Industry Background</label>
                    <textarea
                      rows={2}
                      placeholder="Summarize your hands-on engineering background..."
                      className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      {...register('bio')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
                    <Input
                      type="password"
                      placeholder="Min 8 characters"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                  </div>

                  <Button type="submit" isLoading={isSubmitting} className="w-full gap-2 mt-2">
                    Submit Faculty Application
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Already have faculty credentials?</span>
            <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
