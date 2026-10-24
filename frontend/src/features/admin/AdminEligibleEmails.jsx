import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
import {
  GlassTable,
  GlassTableHeader,
  GlassTableHead,
  GlassTableBody,
  GlassTableRow,
  GlassTableCell,
  GlassTableEmpty,
  GlassTableLoading,
} from '../../components/ui/GlassTable';
import { Plus, Upload, Trash2, CheckCircle2, XCircle, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const addSingleSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(2, 'Full name is required'),
  offlineRegNumber: z.string().optional(),
  phone: z.string().optional(),
  courseHint: z.string().optional(),
});

export const AdminEligibleEmails = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');

  // Fetch Authoritative Eligible Student Emails
  const { data: eligibleData, isLoading } = useQuery({
    queryKey: ['eligibleEmails', search],
    queryFn: () => api.get(`/eligible-emails?search=${search}`),
  });

  const records = eligibleData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addSingleSchema),
  });

  const onAddSingle = async (values) => {
    try {
      await api.post('/eligible-emails', values);
      queryClient.invalidateQueries({ queryKey: ['eligibleEmails'] });
      toast.success('Offline eligible student email recorded.');
      reset();
      setAddModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add eligible student');
    }
  };

  const onBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of student objects.');

      const res = await api.post('/eligible-emails/bulk', { students: parsed });
      queryClient.invalidateQueries({ queryKey: ['eligibleEmails'] });
      toast.success(res.message || 'Bulk import completed!');
      setBulkJson('');
      setBulkModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Bulk import failed. Please check JSON format.');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/eligible-emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibleEmails'] });
      toast.success('Record removed');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete record');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            OFFLINE ADMISSIONS REGISTRY
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Offline Student Eligibility Registry</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative registry of students admitted offline at the campus desk. Used for portal registration verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton variant="secondary" size="sm" onClick={() => setBulkModalOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Bulk Import JSON
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={() => setAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Single Student
          </GlassButton>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          placeholder="Search by student name, email, or offline reg number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
        />
      </div>

      <GlassPanel glow="blue" className="overflow-hidden p-0">
        <GlassTable>
          <GlassTableHeader>
            <GlassTableRow isHeader>
              <GlassTableHead>Student Name</GlassTableHead>
              <GlassTableHead>Authoritative Email</GlassTableHead>
              <GlassTableHead>Offline Reg #</GlassTableHead>
              <GlassTableHead>Course / Program</GlassTableHead>
              <GlassTableHead>Portal Status</GlassTableHead>
              <GlassTableHead>Added Date</GlassTableHead>
              <GlassTableHead className="text-right">Actions</GlassTableHead>
            </GlassTableRow>
          </GlassTableHeader>
          <GlassTableBody>
            {isLoading ? (
              <GlassTableLoading colSpan={7} rows={4} />
            ) : records.length === 0 ? (
              <GlassTableEmpty message="No offline eligible student records found matching your query." colSpan={7} />
            ) : (
              records.map((rec) => (
                <GlassTableRow key={rec.id}>
                  <GlassTableCell className="font-semibold text-white">{rec.fullName}</GlassTableCell>
                  <GlassTableCell className="text-brand-cyan font-mono">{rec.email}</GlassTableCell>
                  <GlassTableCell className="text-slate-400 font-mono">{rec.offlineRegNumber || '-'}</GlassTableCell>
                  <GlassTableCell className="text-slate-300">{rec.courseHint || '-'}</GlassTableCell>
                  <GlassTableCell>
                    {rec.isRegistered ? (
                      <GlassBadge variant="success">Account Created</GlassBadge>
                    ) : (
                      <GlassBadge variant="warning">Awaiting Registration</GlassBadge>
                    )}
                  </GlassTableCell>
                  <GlassTableCell className="text-slate-400 font-mono">{formatDate(rec.createdAt)}</GlassTableCell>
                  <GlassTableCell className="text-right">
                    <button
                      onClick={() => deleteMutation.mutate(rec.id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </GlassTableCell>
                </GlassTableRow>
              ))
            )}
          </GlassTableBody>
        </GlassTable>
      </GlassPanel>

      {/* ADD SINGLE MODAL */}
      <GlassModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Offline Eligible Student"
        description="Records an offline enrolled student to permit their portal self-registration"
      >
        <form onSubmit={handleSubmit(onAddSingle)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Student Full Name</label>
            <input
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('fullName')}
            />
            {errors.fullName?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.fullName.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Student Email Address</label>
            <input
              type="email"
              placeholder="e.g. rahul@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
              {...register('email')}
            />
            {errors.email?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Offline Reg Number</label>
              <input
                placeholder="e.g. OFF-2026-005"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('offlineRegNumber')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Phone Number</label>
              <input
                placeholder="+91..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('phone')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Course / Program Enrolled</label>
            <input
              placeholder="e.g. Full-Stack Software Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('courseHint')}
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <GlassButton type="button" variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              Add to Registry
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* BULK IMPORT MODAL */}
      <GlassModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Import Offline Students"
        description="Paste JSON array of offline student admission records"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Expected JSON format:
          </p>
          <pre className="p-3 bg-slate-950/80 rounded-xl text-[11px] text-brand-cyan border border-white/10 font-mono overflow-x-auto">
{`[
  {
    "fullName": "Student Name",
    "email": "student@example.com",
    "phone": "+919876543210",
    "offlineRegNumber": "OFF-101",
    "courseHint": "Full Stack"
  }
]`}
          </pre>

          <textarea
            rows={8}
            placeholder="Paste JSON array here..."
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-blue/50"
          />

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <GlassButton variant="ghost" size="sm" onClick={() => setBulkModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={onBulkImport}>
              Run Bulk Import
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
