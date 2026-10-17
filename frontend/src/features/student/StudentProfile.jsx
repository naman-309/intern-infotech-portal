import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
      <Card className="p-6 bg-slate-900/80 border-slate-800">
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
      </Card>

      {/* Editable Permitted Profile Fields */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Edit Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone</label>
                <Input placeholder="+91..." {...regProfile('phone')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
                <Input placeholder="https://..." {...regProfile('avatarUrl')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Guardian / Parent Name</label>
                <Input placeholder="Guardian name" {...regProfile('guardianName')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Contact Phone</label>
                <Input placeholder="Guardian phone" {...regProfile('guardianPhone')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Residential Address</label>
              <textarea
                rows={2}
                placeholder="Current city / address"
                className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                {...regProfile('address')}
              />
            </div>

            <Button type="submit" isLoading={profileSubmitting} className="gap-2">
              <Save className="w-4 h-4" /> Save Profile Details
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Change Security Password</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
              <Input
                type="password"
                error={passErrors.currentPassword?.message}
                {...regPass('currentPassword')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password (Min 8 chars)</label>
              <Input
                type="password"
                error={passErrors.newPassword?.message}
                {...regPass('newPassword')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <Input
                type="password"
                error={passErrors.confirmPassword?.message}
                {...regPass('confirmPassword')}
              />
            </div>

            <Button type="submit" variant="secondary" isLoading={passSubmitting} className="gap-2">
              <Lock className="w-4 h-4" /> Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
