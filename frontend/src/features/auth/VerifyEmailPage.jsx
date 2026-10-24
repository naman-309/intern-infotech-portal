import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { GlassButton, GlassCard3D } from '../../components/ui';
import { Code2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  AnimatedBackground,
  PageTransition,
} from '../../components/motion';

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
    <PageTransition className="min-h-screen bg-[#05070D] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
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
        </div>

        <GlassCard3D intensity={8} depth={20} className="shadow-glass-lg p-6 text-center">
          <div className="space-y-4 pt-4">
            {loading ? (
              <div className="space-y-3 py-8">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
                <p className="text-sm text-slate-300">Verifying your security token with academy gateway...</p>
              </div>
            ) : success ? (
              <div className="space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glass-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Email Address Confirmed</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-400">
                  Your admission request has been queued for faculty review. You will receive an email once approved.
                </div>
                <div className="pt-2">
                  <Link to="/login">
                    <GlassButton variant="primary" className="w-full">
                      Proceed to Portal Login
                    </GlassButton>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30 shadow-glass-sm">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Failed</h3>
                <p className="text-xs text-rose-300 leading-relaxed">{message}</p>
                <div className="pt-2 flex gap-3">
                  <Link to="/register-student" className="flex-1">
                    <GlassButton variant="outline" className="w-full text-xs">
                      Submit New Request
                    </GlassButton>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <GlassButton variant="secondary" className="w-full text-xs">
                      Portal Login
                    </GlassButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </GlassCard3D>
      </div>
    </PageTransition>
  );
};

export default VerifyEmailPage;
