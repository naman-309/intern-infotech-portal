import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Code2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../../components/shared/Logo';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center group mb-2 hover:opacity-90 transition-opacity">
            <Logo textClassName="text-2xl sm:text-3xl" isDark={true} />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Set New Password</h2>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6">
          <CardContent className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full gap-2">
                Update Password & Return to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
