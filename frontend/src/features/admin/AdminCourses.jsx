import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Edit3, Archive, Eye, EyeOff, Star, Layers } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Courses & Curriculum Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish courses to the public catalog, configure advertised tuition, and manage syllabuses.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Course
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No courses created yet. Click above to add your first course.
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    {course.featured && <Badge variant="warning">Featured</Badge>}
                    <Badge variant={course.published ? 'success' : 'default'}>
                      {course.published ? 'Published' : 'Draft / Unpublished'}
                    </Badge>
                    {course.isArchived && <Badge variant="danger">Archived</Badge>}
                  </div>
                  <div className="text-xs text-indigo-400 font-mono">
                    Slug: /{course.slug} • Duration: {course.duration}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublishMutation.mutate({ id: course.id, published: course.published })}
                    className="text-xs gap-1.5"
                  >
                    {course.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {course.published ? 'Unpublish' : 'Publish'}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenEdit(course)}
                    className="text-xs gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>

                  {!course.isArchived && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => archiveMutation.mutate(course.id)}
                      className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">{course.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2 border-t border-slate-800/80">
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
                  <div className="text-sm text-indigo-300 mt-0.5">{course._count?.batches || 0} Batches</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Enrolled Students</div>
                  <div className="text-sm text-emerald-400 mt-0.5">{course._count?.enrollments || 0} Students</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course Curriculum' : 'Create New Course'}
        description="Programs published here appear on the public website catalog"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Course Title</label>
            <Input placeholder="e.g. Distributed Systems & Cloud Architecture" error={errors.title?.message} {...register('title')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Duration</label>
              <Input placeholder="e.g. 24 Weeks (6 Months)" error={errors.duration?.message} {...register('duration')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Advertised Tuition (INR)</label>
              <Input type="number" placeholder="65000" error={errors.advertisedFee?.message} {...register('advertisedFee')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Course Thumbnail Image URL</label>
            <Input placeholder="https://..." error={errors.thumbnailUrl?.message} {...register('thumbnailUrl')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Description</label>
            <textarea
              rows={3}
              placeholder="Describe the curriculum topics, hands-on lab projects, and technical prerequisites..."
              className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Order</label>
              <Input type="number" {...register('displayOrder')} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="featured" className="rounded border-slate-700 bg-slate-900 text-indigo-600" {...register('featured')} />
              <label htmlFor="featured" className="text-xs text-slate-300">Feature on Home</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="published" className="rounded border-slate-700 bg-slate-900 text-indigo-600" {...register('published')} />
              <label htmlFor="published" className="text-xs text-slate-300">Publish to Web</label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
