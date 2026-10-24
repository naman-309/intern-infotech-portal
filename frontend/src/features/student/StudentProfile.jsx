import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { GlassPanel, GlassButton } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { User, Shield, Lock, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

export const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.studentProfile;

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: user?.phone || '',
      address: profile?.address || '',
      guardianName: profile?.guardianName || '',
      guardianPhone: profile?.guardianPhone || '',
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
      toast.success('Profile details updated successfully');
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
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Student Profile & Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review academic enrollment records and manage permitted contact preferences.
        </p>
      </div>

      {/* Institutional Record Summary (Read-Only) */}
      <GlassPanel variant="deep" className="p-6">
        <h3 className="text-xs font-bold uppercase text-slate-400 font-mono mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Authoritative Institutional Records
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Enrollment Number</div>
            <div className="text-sm font-bold text-white mt-1">{profile?.enrollmentNumber || 'IIT-S1001'}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Assigned Roll Number</div>
            <div className="text-sm font-bold text-white mt-1">{profile?.rollNumber || 'R-1001'}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Enrollment Date</div>
            <div className="text-sm text-slate-300 mt-1">{formatDate(profile?.joinedAt)}</div>
          </div>
        </div>
      </GlassPanel>

      {/* Editable Permitted Profile Fields */}
      <GlassPanel variant="default" className="p-6">
        <h3 className="text-base font-bold text-white mb-4">Edit Contact Details</h3>
        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone</label>
              <input
                placeholder="+91..."
                {...regProfile('phone')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
              <input
                placeholder="https://..."
                {...regProfile('avatarUrl')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian / Parent Name</label>
              <input
                placeholder="Guardian name"
                {...regProfile('guardianName')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Contact Phone</label>
              <input
                placeholder="Guardian phone"
                {...regProfile('guardianPhone')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Residential Address</label>
            <textarea
              rows={2}
              placeholder="Current city / address"
              {...regProfile('address')}
              className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <GlassButton type="submit" variant="primary" isLoading={profileSubmitting} className="gap-2">
            <Save className="w-4 h-4" /> Save Profile Details
          </GlassButton>
        </form>
      </GlassPanel>

      {/* Change Password */}
      <GlassPanel variant="default" className="p-6">
        <h3 className="text-base font-bold text-white mb-4">Change Security Password</h3>
        <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...regPass('currentPassword')}
              className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {passErrors.currentPassword && (
              <p className="text-[11px] text-rose-400 mt-1">{passErrors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">New Password (Min 8 chars)</label>
            <input
              type="password"
              placeholder="••••••••"
              {...regPass('newPassword')}
              className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {passErrors.newPassword && (
              <p className="text-[11px] text-rose-400 mt-1">{passErrors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...regPass('confirmPassword')}
              className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {passErrors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1">{passErrors.confirmPassword.message}</p>
            )}
          </div>

          <GlassButton type="submit" variant="secondary" isLoading={passSubmitting} className="gap-2">
            <Lock className="w-4 h-4" /> Update Password
          </GlassButton>
        </form>
      </GlassPanel>
    </div>
  );
};

export default StudentProfile;
