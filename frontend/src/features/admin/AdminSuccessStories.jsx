import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Edit3, Trash2, Award, Eye, EyeOff } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Success Stories CMS</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish verified alumni placement outcomes and career testimonials on the homepage.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Success Story
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : stories.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No success stories created yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={story.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.studentName)}`}
                      alt={story.studentName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{story.studentName}</h4>
                      <div className="text-xs text-indigo-400 font-medium">{story.jobTitle}</div>
                    </div>
                  </div>
                  {story.featured && <Badge variant="warning">Featured</Badge>}
                </div>

                <div className="text-xs font-mono text-slate-300">
                  {story.companyName} {story.packageLPA && `• ${story.packageLPA}`}
                </div>

                <p className="text-xs text-slate-400 italic line-clamp-3">"{story.testimonial}"</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <Badge variant={story.published ? 'success' : 'default'}>
                  {story.published ? 'Published' : 'Hidden'}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(story)} className="p-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(story.id)} className="p-1.5 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStory ? 'Edit Success Story' : 'Add Alumni Success Story'}
        description="Public showcase for alumni outcomes and employer placement"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Name</label>
              <Input placeholder="e.g. Aarav Mehta" error={errors.studentName?.message} {...register('studentName')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Course Completed</label>
              <Input placeholder="e.g. Full-Stack Software Engineering" error={errors.courseCompleted?.message} {...register('courseCompleted')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title</label>
              <Input placeholder="e.g. SDE II" error={errors.jobTitle?.message} {...register('jobTitle')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Employer Company</label>
              <Input placeholder="e.g. Amazon Web Services" error={errors.companyName?.message} {...register('companyName')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Compensation Package</label>
              <Input placeholder="e.g. 34 LPA" {...register('packageLPA')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Placement Year</label>
              <Input type="number" defaultValue={2025} {...register('placementYear')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Photograph URL</label>
            <Input placeholder="https://..." {...register('photoUrl')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Testimonial</label>
            <textarea
              rows={3}
              placeholder="Quote describing hands-on learning at Intern Infotech..."
              className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              {...register('testimonial')}
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="storyFeatured" className="rounded border-slate-700 bg-slate-900 text-indigo-600" {...register('featured')} />
              <label htmlFor="storyFeatured" className="text-xs text-slate-300">Feature on Home</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="storyPublished" className="rounded border-slate-700 bg-slate-900 text-indigo-600" {...register('published')} />
              <label htmlFor="storyPublished" className="text-xs text-slate-300">Publicly Published</label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {editingStory ? 'Save Changes' : 'Create Story'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
