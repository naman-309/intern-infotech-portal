import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  GlassPanel,
  GlassBadge,
  GlassButton,
  GlassModal,
} from '../../components/ui';
import { Plus, Bell, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(5, 'Announcement message is required'),
  targetType: z.enum(['ALL', 'BATCH']).default('BATCH'),
  targetBatchId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const TeacherAnnouncements = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 1. Fetch Batches
  const { data: batchesData } = useQuery({
    queryKey: ['teacherBatches'],
    queryFn: () => api.get('/batches'),
  });

  // 2. Fetch Announcements
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['teacherAnnouncements'],
    queryFn: () => api.get('/announcements'),
  });

  const batches = batchesData?.data || [];
  const announcements = announcementsData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: { targetType: 'BATCH', priority: 'MEDIUM' },
  });

  const targetType = watch('targetType');

  const onCreate = async (values) => {
    try {
      await api.post('/announcements', {
        ...values,
        targetBatchId: values.targetType === 'BATCH' ? values.targetBatchId || undefined : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['teacherAnnouncements'] });
      toast.success('Announcement published to assigned cohort.');
      reset();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create announcement');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherAnnouncements'] });
      toast.success('Announcement deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete announcement');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Faculty Announcements</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish technical notices, lab homework assignments, and schedule updates to your cohorts.
          </p>
        </div>

        <GlassButton variant="primary" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Announcement
        </GlassButton>
      </div>

      {isLoading ? (
        <div className="h-48 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
      ) : announcements.length === 0 ? (
        <GlassPanel className="p-12 text-center text-slate-400 text-xs">
          No announcements published yet.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <GlassPanel key={item.id} variant="default" className="p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <GlassBadge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'primary'}>
                    {item.priority}
                  </GlassBadge>
                  {item.targetBatch && (
                    <GlassBadge variant="default">{item.targetBatch.name}</GlassBadge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {formatDate(item.publishDate)}
                  </span>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </GlassButton>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {item.body}
              </p>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <GlassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Official Announcement"
        description="Broadcast a message to an assigned laboratory cohort"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
            <input
              placeholder="e.g. Offline Lab Exam Schedule Revision"
              {...register('title')}
              className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.title && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
              <select
                {...register('targetType')}
                className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="BATCH">Specific Batch</option>
                <option value="ALL">Entire Campus</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority Level</label>
              <select
                {...register('priority')}
                className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {targetType === 'BATCH' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Laboratory Batch</label>
              <select
                {...register('targetBatchId')}
                className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select assigned batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batchCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Message Content</label>
            <textarea
              rows={4}
              placeholder="Write the official technical announcement details..."
              {...register('body')}
              className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            {errors.body && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.body.message}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <GlassButton type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Publish Announcement
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default TeacherAnnouncements;
