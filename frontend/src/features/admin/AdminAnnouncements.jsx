import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
import { Plus, Bell, Trash2, Mail, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(5, 'Message body is required'),
  targetType: z.enum(['ALL', 'COURSE', 'BATCH', 'INDIVIDUAL']).default('ALL'),
  targetCourseId: z.string().optional(),
  targetBatchId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  sendEmailNotification: z.boolean().default(false),
});

export const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 1. Fetch Announcements
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: () => api.get('/announcements'),
  });

  // 2. Fetch Courses
  const { data: coursesData } = useQuery({
    queryKey: ['allCourses'],
    queryFn: () => api.get('/courses'),
  });

  // 3. Fetch Batches
  const { data: batchesData } = useQuery({
    queryKey: ['allBatches'],
    queryFn: () => api.get('/batches'),
  });

  const announcements = announcementsData?.data || [];
  const courses = coursesData?.data || [];
  const batches = batchesData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: { targetType: 'ALL', priority: 'MEDIUM', sendEmailNotification: false },
  });

  const targetType = watch('targetType');

  const onCreate = async (values) => {
    try {
      await api.post('/announcements', values);
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      toast.success('Announcement published successfully.');
      reset();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to publish announcement');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      toast.success('Announcement deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-blue/25 text-[11px] font-mono tracking-wider text-brand-blue mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            COMMUNICATION HUB
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Institute Announcements & Notifications</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish official notices targeted to the entire academy, specific courses, or batches with optional email dispatch.
          </p>
        </div>

        <GlassButton variant="primary" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Announcement
        </GlassButton>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <GlassPanel className="p-16 text-center text-slate-400 text-xs font-mono">
          No announcements published yet.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {announcements.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GlassPanel glow="blue" className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                      <GlassBadge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'cyan'}>
                        {item.priority}
                      </GlassBadge>
                      {item.emailSent && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                          <Mail className="w-3.5 h-3.5" /> Email Dispatched
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{item.body}</p>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      Audience: <strong className="text-brand-cyan">{item.targetType}</strong>
                      {item.targetCourse ? ` (${item.targetCourse.title})` : ''}
                      {item.targetBatch ? ` (${item.targetBatch.name})` : ''}
                    </span>
                    <span>Published on {formatDate(item.publishDate)}</span>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE MODAL */}
      <GlassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast Institute Announcement"
        description="Publish announcements with target filtering and optional email delivery"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Announcement Title</label>
            <input
              placeholder="e.g. Schedule for Offline Project Showcase"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('title')}
            />
            {errors.title?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.title.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Target Audience</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('targetType')}
              >
                <option value="ALL">Entire Institute (All Students)</option>
                <option value="COURSE">Target Specific Course</option>
                <option value="BATCH">Target Specific Batch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Priority</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('priority')}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {targetType === 'COURSE' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Select Course</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50"
                {...register('targetCourseId')}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'BATCH' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Select Batch</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('targetBatchId')}
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batchCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Message Body</label>
            <textarea
              rows={4}
              required
              placeholder="Enter official announcement message..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('body')}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendEmailNotification"
              className="rounded border-white/20 bg-white/5 text-brand-blue focus:ring-brand-blue"
              {...register('sendEmailNotification')}
            />
            <label htmlFor="sendEmailNotification" className="text-xs text-slate-300 font-mono">
              Dispatch email notification via Nodemailer to all target recipients
            </label>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <GlassButton type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              Publish Announcement
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
