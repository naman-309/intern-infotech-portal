import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Code2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage('Missing or invalid verification token.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setSuccess(true);
        setMessage(res.message || 'Email successfully verified!');
      } catch (err) {
        setSuccess(false);
        setMessage(err.message || 'Email verification link has expired or is invalid.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex flex-col items-center group mb-2 hover:opacity-90 transition-opacity">
            <Logo textClassName="text-2xl sm:text-3xl" isDark={true} />
          </Link>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 text-center">
          <CardContent className="space-y-4 pt-4">
            {loading ? (
              <div className="space-y-3 py-8">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
                <p className="text-sm text-slate-300">Verifying your email token with academy security...</p>
              </div>
            ) : success ? (
              <div className="space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Email Address Confirmed</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Your admission request has been queued for faculty review. You will receive an email once approved.
                </div>
                <div className="pt-2">
                  <Link to="/login">
                    <Button className="w-full">Proceed to Portal Login</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Failed</h3>
                <p className="text-xs text-rose-300 leading-relaxed">{message}</p>
                <div className="pt-2 flex gap-3">
                  <Link to="/register-student" className="flex-1">
                    <Button variant="outline" className="w-full text-xs">
                      Submit New Request
                    </Button>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <Button className="w-full text-xs">Sign In</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
