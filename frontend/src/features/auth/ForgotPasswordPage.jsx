import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Code2, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../../components/shared/Logo';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center group mb-2 hover:opacity-90 transition-opacity">
            <Logo textClassName="text-2xl sm:text-3xl" isDark={true} />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Recover Password</h2>
          <p className="text-xs text-slate-400">
            Enter your email to receive an expiring password reset token.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6">
          <CardContent className="space-y-4 pt-2">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Check Your Inbox</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If an account exists with this email, we have sent a secure password reset link. Please check your spam folder if it does not appear within 2 minutes.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full mt-2">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Account Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. student@infotech.edu"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full gap-2">
                  Send Recovery Link
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-xs text-slate-400 hover:text-white">
                    Remember password? Return to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
