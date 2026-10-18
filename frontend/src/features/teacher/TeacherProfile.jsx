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
import { Briefcase, Lock, Save, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';

const teacherProfileSchema = z.object({
  specialization: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || '');

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please choose a valid image file (JPG, PNG, or WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must not exceed 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.info(`Photo selected: ${file.name}. Click "Save Profile" to upload.`);
    }
  };

  const onUpdateProfile = async (values) => {
    try {
      const formData = new FormData();
      if (values.specialization) formData.append('specialization', values.specialization);
      if (values.bio) formData.append('bio', values.bio);
      if (values.phone) formData.append('phone', values.phone);

      if (selectedFile) {
        formData.append('avatar', selectedFile);
      } else if (values.avatarUrl) {
        formData.append('avatarUrl', values.avatarUrl);
      }

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.user?.avatarUrl) {
        setPreviewUrl(res.data.user.avatarUrl);
      }
      await refreshUser();
      setSelectedFile(null);
      toast.success('Instructor photo & profile updated successfully');
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
        <h2 className="text-2xl font-bold text-white tracking-tight">Faculty Credentials & Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review academic appointments and manage instructor bio preferences.
        </p>
      </div>

      <Card className="p-6 bg-slate-900/80 border-slate-800">
        <h3 className="text-xs font-bold uppercase text-slate-400 font-mono mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          Institutional Appointment Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Employee ID</div>
            <div className="text-sm font-bold text-white mt-1">{profile?.employeeId || 'IIT-T101'}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Qualifications</div>
            <div className="text-sm text-slate-200 mt-1">{profile?.qualifications || 'M.Tech / Ex-Tech Lead'}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Appointment Date</div>
            <div className="text-sm text-slate-300 mt-1">{formatDate(profile?.joinedAt)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Edit Instructor Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Teaching Specialization</label>
                <Input placeholder="e.g. Distributed Databases" {...regProfile('specialization')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <Input placeholder="+91..." {...regProfile('phone')} />
              </div>
            </div>

            {/* Passport Photo Upload directly from phone/laptop */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group flex-shrink-0">
                <img
                  src={
                    previewUrl ||
                    user?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'Faculty')}&background=0284c7&color=fff&size=128`
                  }
                  alt="Faculty Passport Photo"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/40 shadow-lg shadow-sky-500/10"
                />
                <label
                  htmlFor="teacher-avatar-input"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-[11px] font-medium"
                >
                  <Upload className="w-5 h-5 mb-1 text-sky-400" />
                  Change
                </label>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="text-sm font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
                  <Camera className="w-4 h-4 text-sky-400" />
                  Faculty Photograph
                </div>
                <p className="text-xs text-slate-400">
                  Upload your photo directly from your device (JPG, PNG, WEBP up to 5MB).
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <label
                    htmlFor="teacher-avatar-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium cursor-pointer border border-sky-500/30 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload from Device
                  </label>
                  {selectedFile ? (
                    <span className="text-[11px] text-emerald-400 font-mono truncate max-w-[200px]">
                      ✓ {selectedFile.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Saved to Cloudinary
                    </span>
                  )}
                </div>
                <input
                  id="teacher-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Biography</label>
              <textarea
                rows={3}
                placeholder="Share your engineering pedigree..."
                className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                {...regProfile('bio')}
              />
            </div>

            <Button type="submit" isLoading={profileSubmitting} className="gap-2">
              <Save className="w-4 h-4" /> Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Change Security Password</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
              <Input type="password" error={passErrors.currentPassword?.message} {...regPass('currentPassword')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
              <Input type="password" error={passErrors.newPassword?.message} {...regPass('newPassword')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <Input type="password" error={passErrors.confirmPassword?.message} {...regPass('confirmPassword')} />
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
