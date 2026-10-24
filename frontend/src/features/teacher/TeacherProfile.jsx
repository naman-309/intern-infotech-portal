import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassButton } from '../../components/ui/GlassButton';
import { formatDate } from '../../lib/utils';
import { Briefcase, Lock, Save, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const teacherProfileSchema = z.object({
  specialization: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const TeacherProfile = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.teacherProfile;

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      specialization: profile?.specialization || '',
      bio: profile?.bio || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    reset: resetPassForm,
    formState: { errors: passErrors, isSubmitting: passSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (values) => {
    try {
      await api.put('/users/profile', values);
      await refreshUser();
      toast.success('Instructor profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const onChangePassword = async (values) => {
    try {
      await api.post('/users/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      resetPassForm();
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          FACULTY ACCOUNT SETTINGS
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Faculty Credentials & Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review academic appointments and manage instructor bio preferences.
        </p>
      </div>

      <GlassPanel glow="cyan" className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-cyan font-mono mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-brand-cyan" />
          Institutional Appointment Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-slate-500 uppercase text-[10px] tracking-wider">Employee ID</div>
            <div className="text-base font-bold text-white mt-1">{profile?.employeeId || 'IIT-T101'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-slate-500 uppercase text-[10px] tracking-wider">Qualifications</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">{profile?.qualifications || 'M.Tech / Ex-Tech Lead'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-slate-500 uppercase text-[10px] tracking-wider">Appointment Date</div>
            <div className="text-sm text-slate-300 mt-1">{formatDate(profile?.joinedAt)}</div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="pb-4 border-b border-white/5 mb-5">
          <h3 className="text-lg font-bold text-white">Edit Instructor Profile</h3>
          <p className="text-xs text-slate-400 mt-0.5">Update public bio and communication contact for students</p>
        </div>

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Teaching Specialization</label>
              <input
                placeholder="e.g. Distributed Databases"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
                {...regProfile('specialization')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Phone Number</label>
              <input
                placeholder="+91..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
                {...regProfile('phone')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Avatar Image URL</label>
            <input
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
              {...regProfile('avatarUrl')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Biography</label>
            <textarea
              rows={3}
              placeholder="Share your engineering pedigree..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
              {...regProfile('bio')}
            />
          </div>

          <GlassButton type="submit" variant="primary" disabled={profileSubmitting} className="gap-2">
            <Save className="w-4 h-4" /> Save Profile
          </GlassButton>
        </form>
      </GlassPanel>

      <GlassPanel glow="violet" className="p-6">
        <div className="pb-4 border-b border-white/5 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Change Security Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ensure your portal access password is cryptographically strong</p>
          </div>
        </div>

        <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Current Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 focus:ring-1 focus:ring-brand-violet/50 transition-all"
              {...regPass('currentPassword')}
            />
            {passErrors.currentPassword?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{passErrors.currentPassword.message}</span>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">New Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 focus:ring-1 focus:ring-brand-violet/50 transition-all"
              {...regPass('newPassword')}
            />
            {passErrors.newPassword?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{passErrors.newPassword.message}</span>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 focus:ring-1 focus:ring-brand-violet/50 transition-all"
              {...regPass('confirmPassword')}
            />
            {passErrors.confirmPassword?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{passErrors.confirmPassword.message}</span>
            )}
          </div>

          <GlassButton type="submit" variant="secondary" disabled={passSubmitting} className="gap-2">
            <Lock className="w-4 h-4" /> Update Password
          </GlassButton>
        </form>
      </GlassPanel>
    </div>
  );
};
