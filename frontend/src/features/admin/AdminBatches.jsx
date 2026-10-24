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
import { Plus, Users, UserPlus, Calendar, Clock, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const batchSchema = z.object({
  name: z.string().min(3, 'Batch name is required'),
  batchCode: z.string().min(2, 'Unique batch code is required (e.g. FS-2026-A)'),
  courseId: z.string().uuid('Please select a course'),
  startDate: z.string().min(1, 'Start date is required'),
  timing: z.string().optional(),
  capacity: z.coerce.number().positive().default(30),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED']).default('UPCOMING'),
});

export const AdminBatches = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = useState(false);
  const [enrollStudentModalOpen, setEnrollStudentModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // 1. Fetch Batches
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['adminBatches'],
    queryFn: () => api.get('/batches'),
  });

  // 2. Fetch Courses
  const { data: coursesData } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => api.get('/courses'),
  });

  // 3. Fetch Teachers
  const { data: teachersData } = useQuery({
    queryKey: ['adminTeachers'],
    queryFn: () => api.get('/teachers'),
  });

  // 4. Fetch Students
  const { data: studentsData } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => api.get('/students'),
  });

  const batches = batchesData?.data || [];
  const courses = coursesData?.data || [];
  const teachers = teachersData?.data || [];
  const students = studentsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(batchSchema),
  });

  const onCreateBatch = async (values) => {
    try {
      await api.post('/batches', values);
      queryClient.invalidateQueries({ queryKey: ['adminBatches'] });
      toast.success('Batch cohort created successfully');
      reset();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create batch');
    }
  };

  const onAssignTeacher = async () => {
    try {
      if (!selectedTeacherId) return;
      await api.post(`/batches/${selectedBatch.id}/teachers`, {
        teacherId: selectedTeacherId,
      });
      queryClient.invalidateQueries({ queryKey: ['adminBatches'] });
      toast.success('Faculty instructor assigned to batch');
      setAssignTeacherModalOpen(false);
      setSelectedTeacherId('');
    } catch (err) {
      toast.error(err.message || 'Failed to assign teacher');
    }
  };

  const onEnrollStudent = async () => {
    try {
      if (!selectedStudentId) return;
      await api.post(`/batches/${selectedBatch.id}/enrollments`, {
        studentId: selectedStudentId,
      });
      queryClient.invalidateQueries({ queryKey: ['adminBatches'] });
      toast.success('Student enrolled into batch successfully');
      setEnrollStudentModalOpen(false);
      setSelectedStudentId('');
    } catch (err) {
      toast.error(err.message || 'Failed to enroll student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            LABORATORY COHORTS
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Batches & Cohort Rosters</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create laboratory cohorts, assign faculty instructors, and enroll students.
          </p>
        </div>

        <GlassButton variant="primary" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Batch
        </GlassButton>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : batches.length === 0 ? (
        <GlassPanel className="p-16 text-center text-slate-400 text-xs font-mono">
          No batches found. Create your first batch to start assigning teachers and enrolling students.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {batches.map((batch, idx) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GlassPanel glow="cyan" className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">{batch.name}</h3>
                        <GlassBadge variant="cyan">{batch.batchCode}</GlassBadge>
                        <GlassBadge variant={batch.status === 'ONGOING' ? 'success' : 'default'}>
                          {batch.status}
                        </GlassBadge>
                      </div>
                      <div className="text-xs text-brand-cyan font-medium mt-1 font-mono">
                        Course: {batch.course.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedBatch(batch);
                          setAssignTeacherModalOpen(true);
                        }}
                        className="text-xs gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Assign Teacher
                      </GlassButton>

                      <GlassButton
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedBatch(batch);
                          setEnrollStudentModalOpen(true);
                        }}
                        className="text-xs gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" /> Enroll Student
                      </GlassButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Start Date</div>
                      <div className="text-sm text-slate-200 mt-0.5">{formatDate(batch.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Schedule</div>
                      <div className="text-sm text-slate-200 mt-0.5">{batch.timing || 'Offline Lab'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Enrollment Count</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {batch._count?.enrollments || 0} / {batch.capacity} Students
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Instructors</div>
                      <div className="text-sm text-brand-cyan mt-0.5">
                        {batch.teachers && batch.teachers.length > 0
                          ? batch.teachers.map((t) => t.teacher?.user?.lastName).join(', ')
                          : 'None assigned'}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      <GlassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Offline Batch"
        description="Configure a new laboratory cohort"
      >
        <form onSubmit={handleSubmit(onCreateBatch)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Batch Name</label>
            <input
              placeholder="e.g. Full Stack Cohort 2026-Beta"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('name')}
            />
            {errors.name?.message && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Batch Code</label>
              <input
                placeholder="e.g. FS-2026-B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('batchCode')}
              />
              {errors.batchCode?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.batchCode.message}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Associated Course</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50"
                {...register('courseId')}
              >
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              {errors.courseId?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.courseId.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Start Date</label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('startDate')}
              />
              {errors.startDate?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.startDate.message}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Max Capacity</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                {...register('capacity')}
              />
              {errors.capacity?.message && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.capacity.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Schedule & Lab Timings</label>
            <input
              placeholder="e.g. Mon-Fri | 9:30 AM – 1:30 PM (Offline Lab)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              {...register('timing')}
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <GlassButton type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              Create Batch
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* ASSIGN TEACHER MODAL */}
      {selectedBatch && (
        <GlassModal
          isOpen={assignTeacherModalOpen}
          onClose={() => setAssignTeacherModalOpen(false)}
          title={`Assign Teacher to ${selectedBatch.name}`}
          description="Appoint an approved faculty instructor to lead this laboratory cohort"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Select Faculty Member</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50"
              >
                <option value="">Choose Instructor...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.teacherProfile?.id}>
                    Prof. {t.firstName} {t.lastName} ({t.teacherProfile?.specialization || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setAssignTeacherModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary" size="sm" onClick={onAssignTeacher}>
                Confirm Assignment
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* ENROLL STUDENT MODAL */}
      {selectedBatch && (
        <GlassModal
          isOpen={enrollStudentModalOpen}
          onClose={() => setEnrollStudentModalOpen(false)}
          title={`Enroll Student into ${selectedBatch.name}`}
          description="Directly enroll an active student into this offline laboratory batch"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50"
              >
                <option value="">Choose Student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.studentProfile?.id}>
                    {s.firstName} {s.lastName} ({s.email}) - {s.studentProfile?.enrollmentNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setEnrollStudentModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary" size="sm" onClick={onEnrollStudent}>
                Enroll Student
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
