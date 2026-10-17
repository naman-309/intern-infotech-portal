import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Code2, GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { toast } from 'sonner';

const studentRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter the email provided to the offline center'),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const StudentRegisterPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentRegisterSchema),
  });

  const onSubmit = async (values) => {
    try {
      setServerError('');
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      const res = await api.post('/auth/register-request/student', payload);
      setSubmittedEmail(values.email);
      setIsSuccess(true);
      toast.success(res.message || 'Registration request submitted successfully');
    } catch (err) {
      setServerError(err.message || 'Failed to submit request');
      toast.error(err.message || 'Failed to submit request');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              INTERN <span className="text-indigo-400">INFOTECH</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Admission Verification</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Offline Enrolled Students: Submit your details for email verification & staff approval to activate your portal dashboard.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
          <CardContent className="p-6">
            {isSuccess ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Link Dispatched!</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  We have verified that <strong className="text-indigo-300">{submittedEmail}</strong> is in our offline admissions registry.
                  A single-use verification link has been sent to your inbox.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
                  <div className="font-semibold text-slate-200">Next Steps:</div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Click the verification link in your email (expires in 24 hours).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Your request enters the review queue for your assigned batch faculty.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Upon review approval, you will receive an activation email with login access.</span>
                  </div>
                </div>
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
                      <Input placeholder="e.g. Rahul" error={errors.firstName?.message} {...register('firstName')} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                      <Input placeholder="e.g. Sharma" error={errors.lastName?.message} {...register('lastName')} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Offline Registered Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. priya.singh@gmail.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Must match the email address recorded during your offline center admission.
                    </p>
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
                      <label className="block text-xs font-medium text-slate-300 mb-1">Choose Password</label>
                      <Input
                        type="password"
                        placeholder="Min 8 characters"
                        error={errors.password?.message}
                        {...register('password')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                      <Input
                        type="password"
                        placeholder="Re-enter password"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                      />
                    </div>
                  </div>

                  <Button type="submit" isLoading={isSubmitting} className="w-full gap-2 mt-2">
                    Submit Admission Request
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Already have an active account?</span>
            <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
