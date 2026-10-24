import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
import { Plus, Edit3, Trash2, Award, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const storySchema = z.object({
  studentName: z.string().min(2, 'Name is required'),
  courseCompleted: z.string().min(2, 'Course completed is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  companyName: z.string().min(2, 'Company name is required'),
  packageLPA: z.string().optional(),
  placementYear: z.coerce.number().int().min(2015).max(2035).default(2025),
  photoUrl: z.string().optional(),
  testimonial: z.string().min(10, 'Testimonial is required'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const AdminSuccessStories = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['adminStories'],
    queryFn: () => api.get('/success-stories'),
  });

  const stories = storiesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(storySchema),
  });

  const handleOpenCreate = () => {
    setEditingStory(null);
    reset({
      studentName: '',
      courseCompleted: 'Full-Stack Software Engineering',
      jobTitle: 'Software Engineer',
      companyName: '',
      packageLPA: '18 LPA',
      placementYear: 2025,
      photoUrl: '',
      testimonial: '',
      featured: false,
      published: true,
      displayOrder: 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (story) => {
    setEditingStory(story);
    reset({
      studentName: story.studentName,
      courseCompleted: story.courseCompleted,
      jobTitle: story.jobTitle,
      companyName: story.companyName,
      packageLPA: story.packageLPA || '',
      placementYear: story.placementYear,
      photoUrl: story.photoUrl || '',
      testimonial: story.testimonial,
      featured: story.featured,
      published: story.published,
      displayOrder: story.displayOrder,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingStory) {
        await api.put(`/success-stories/${editingStory.id}`, values);
        toast.success('Success story updated');
      } else {
        await api.post('/success-stories', values);
        toast.success('Success story published');
      }
      queryClient.invalidateQueries({ queryKey: ['adminStories'] });
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save story');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/success-stories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStories'] });
      toast.success('Story deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            OUTCOMES & TESTIMONIALS CMS
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Student Success Stories CMS</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish verified alumni placement outcomes and career testimonials on the homepage.
          </p>
        </div>

        <GlassButton variant="primary" onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Success Story
        </GlassButton>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="p-6 h-52 animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <GlassPanel className="p-16 text-center text-slate-400 text-xs font-mono">
          No success stories created yet.
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GlassPanel glow="cyan" className="p-5 flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={story.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.studentName)}`}
                          alt={story.studentName}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight">{story.studentName}</h4>
                          <div className="text-xs text-brand-cyan font-medium">{story.jobTitle}</div>
                        </div>
                      </div>
                      {story.featured && <GlassBadge variant="warning">Featured</GlassBadge>}
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      {story.companyName} {story.packageLPA && `• ${story.packageLPA}`}
                    </div>

                    <p className="text-xs text-slate-300 italic line-clamp-3">"{story.testimonial}"</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <GlassBadge variant={story.published ? 'success' : 'default'}>
                      {story.published ? 'Published' : 'Hidden'}
                    </GlassBadge>
                    <div className="flex items-center gap-2">
                      <GlassButton size="sm" variant="secondary" onClick={() => handleOpenEdit(story)} className="p-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                      </GlassButton>
                      <GlassButton size="sm" variant="danger" onClick={() => deleteMutation.mutate(story.id)} className="p-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </GlassButton>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStory ? 'Edit Success Story' : 'Add Alumni Success Story'}
        description="Public showcase for alumni outcomes and employer placement"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Student Name</label>
              <input
                placeholder="e.g. Aarav Mehta"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
                {...register('studentName')}
              />
              {errors.studentName?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.studentName.message}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Course Completed</label>
              <input
                placeholder="e.g. Full-Stack Software Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
                {...register('courseCompleted')}
              />
              {errors.courseCompleted?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.courseCompleted.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Job Title</label>
              <input
                placeholder="e.g. SDE II"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
                {...register('jobTitle')}
              />
              {errors.jobTitle?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.jobTitle.message}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Employer Company</label>
              <input
                placeholder="e.g. Amazon Web Services"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
                {...register('companyName')}
              />
              {errors.companyName?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.companyName.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Compensation Package</label>
              <input
                placeholder="e.g. 34 LPA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('packageLPA')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Placement Year</label>
              <input
                type="number"
                defaultValue={2025}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('placementYear')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Student Photograph URL</label>
            <input
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
              {...register('photoUrl')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Student Testimonial</label>
            <textarea
              rows={3}
              placeholder="Quote describing hands-on learning at Intern Infotech..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('testimonial')}
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="storyFeatured"
                className="rounded border-white/20 bg-white/5 text-brand-blue focus:ring-brand-blue"
                {...register('featured')}
              />
              <label htmlFor="storyFeatured" className="text-xs text-slate-300 font-mono">Feature on Home</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="storyPublished"
                className="rounded border-white/20 bg-white/5 text-brand-blue focus:ring-brand-blue"
                {...register('published')}
              />
              <label htmlFor="storyPublished" className="text-xs text-slate-300 font-mono">Publicly Published</label>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <GlassButton type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {editingStory ? 'Save Changes' : 'Create Story'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
