import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Bell, Trash2, Mail, Send } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Institute Announcements & Notifications</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish official notices targeted to the entire academy, specific courses, or batches with optional email dispatch.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Announcement
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : announcements.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No announcements published yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card key={item.id} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <Badge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'primary'}>
                    {item.priority}
                  </Badge>
                  {item.emailSent && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <Mail className="w-3.5 h-3.5" /> Email Dispatched
                    </span>
                  )}
                </div>

                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{item.body}</p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>
                  Audience: <strong className="text-slate-400">{item.targetType}</strong>
                  {item.targetCourse ? ` (${item.targetCourse.title})` : ''}
                  {item.targetBatch ? ` (${item.targetBatch.name})` : ''}
                </span>
                <span>Published on {formatDate(item.publishDate)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast Institute Announcement"
        description="Publish announcements with target filtering and optional email delivery"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Announcement Title</label>
            <Input placeholder="e.g. Schedule for Offline Project Showcase" error={errors.title?.message} {...register('title')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
              <Select error={errors.targetType?.message} {...register('targetType')}>
                <option value="ALL">Entire Institute (All Students)</option>
                <option value="COURSE">Target Specific Course</option>
                <option value="BATCH">Target Specific Batch</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <Select error={errors.priority?.message} {...register('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
          </div>

          {targetType === 'COURSE' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Course</label>
              <Select {...register('targetCourseId')}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {targetType === 'BATCH' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Batch</label>
              <Select {...register('targetBatchId')}>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batchCode})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Message Body</label>
            <textarea
              rows={4}
              required
              placeholder="Enter official announcement message..."
              className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              {...register('body')}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendEmailNotification"
              className="rounded border-slate-700 bg-slate-900 text-indigo-600"
              {...register('sendEmailNotification')}
            />
            <label htmlFor="sendEmailNotification" className="text-xs text-slate-300">
              Dispatch email notification via Nodemailer to all target recipients
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
