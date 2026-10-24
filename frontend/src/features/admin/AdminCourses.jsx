import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
import { Plus, Edit3, Archive, Eye, EyeOff, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const courseSchema = z.object({
  title: z.string().min(3, 'Course title is required'),
  description: z.string().min(10, 'Description is required'),
  duration: z.string().min(1, 'Duration is required'),
  advertisedFee: z.coerce.number().nonnegative(),
  thumbnailUrl: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
});

export const AdminCourses = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => api.get('/courses'),
  });

  const courses = coursesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(courseSchema),
  });

  const handleOpenCreate = () => {
    setEditingCourse(null);
    reset({
      title: '',
      description: '',
      duration: '16 Weeks',
      advertisedFee: 50000,
      thumbnailUrl: '',
      featured: false,
      published: true,
      displayOrder: 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    reset({
      title: course.title,
      description: course.description,
      duration: course.duration,
      advertisedFee: course.advertisedFee,
      thumbnailUrl: course.thumbnailUrl || '',
      featured: course.featured,
      published: course.published,
      displayOrder: course.displayOrder,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, values);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', values);
        toast.success('Course created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save course');
    }
  };

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }) => {
      await api.put(`/courses/${id}`, { published: !published });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      toast.success('Publication status toggled');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/courses/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      toast.success('Course archived. Historical records preserved.');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-violet/25 text-[11px] font-mono tracking-wider text-brand-violet mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ACADEMIC CURRICULA
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Courses & Curriculum Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish courses to the public catalog, configure advertised tuition, and manage syllabuses.
          </p>
        </div>

        <GlassButton variant="primary" onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Course
        </GlassButton>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <GlassPanel className="p-16 text-center text-slate-400 text-xs font-mono">
          No courses created yet. Click above to add your first course.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GlassPanel glow="violet" className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">{course.title}</h3>
                        {course.featured && <GlassBadge variant="warning">Featured</GlassBadge>}
                        <GlassBadge variant={course.published ? 'success' : 'default'}>
                          {course.published ? 'Published' : 'Draft / Unpublished'}
                        </GlassBadge>
                        {course.isArchived && <GlassBadge variant="danger">Archived</GlassBadge>}
                      </div>
                      <div className="text-xs text-brand-cyan font-mono">
                        Slug: /{course.slug} • Duration: {course.duration}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => togglePublishMutation.mutate({ id: course.id, published: course.published })}
                        className="text-xs gap-1.5"
                      >
                        {course.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {course.published ? 'Unpublish' : 'Publish'}
                      </GlassButton>

                      <GlassButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenEdit(course)}
                        className="text-xs gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </GlassButton>

                      {!course.isArchived && (
                        <GlassButton
                          size="sm"
                          variant="danger"
                          onClick={() => archiveMutation.mutate(course.id)}
                          className="text-xs gap-1.5"
                        >
                          <Archive className="w-3.5 h-3.5" /> Archive
                        </GlassButton>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">{course.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-3 border-t border-white/5">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Advertised Tuition</div>
                      <div className="text-sm font-bold text-white mt-0.5">{formatCurrency(course.advertisedFee)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Display Order</div>
                      <div className="text-sm text-slate-300 mt-0.5">{course.displayOrder}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Active Batches</div>
                      <div className="text-sm text-brand-cyan mt-0.5">{course._count?.batches || 0} Batches</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Enrolled Students</div>
                      <div className="text-sm text-emerald-400 mt-0.5">{course._count?.enrollments || 0} Students</div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course Curriculum' : 'Create New Course'}
        description="Programs published here appear on the public website catalog"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Course Title</label>
            <input
              placeholder="e.g. Distributed Systems & Cloud Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50"
              {...register('title')}
            />
            {errors.title?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.title.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Duration</label>
              <input
                placeholder="e.g. 24 Weeks (6 Months)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 font-mono"
                {...register('duration')}
              />
              {errors.duration?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.duration.message}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Advertised Tuition (INR)</label>
              <input
                type="number"
                placeholder="65000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 font-mono"
                {...register('advertisedFee')}
              />
              {errors.advertisedFee?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.advertisedFee.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Course Thumbnail Image URL</label>
            <input
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 font-mono"
              {...register('thumbnailUrl')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Full Description</label>
            <textarea
              rows={3}
              placeholder="Describe the curriculum topics, hands-on lab projects, and technical prerequisites..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Display Order</label>
              <input
                type="number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-violet/50 font-mono"
                {...register('displayOrder')}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="featured"
                className="rounded border-white/20 bg-white/5 text-brand-violet focus:ring-brand-violet"
                {...register('featured')}
              />
              <label htmlFor="featured" className="text-xs text-slate-300 font-mono">Feature on Home</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="published"
                className="rounded border-white/20 bg-white/5 text-brand-violet focus:ring-brand-violet"
                {...register('published')}
              />
              <label htmlFor="published" className="text-xs text-slate-300 font-mono">Publish to Web</label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <GlassButton type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
