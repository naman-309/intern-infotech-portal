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
import { Plus, Users, UserPlus, Calendar, Clock, Trash2 } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Batches & Cohort Rosters</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create laboratory cohorts, assign faculty instructors, and enroll students.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Batch
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : batches.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No batches found. Create your first batch to start assigning teachers and enrolling students.
        </Card>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{batch.name}</h3>
                    <Badge variant="primary">{batch.batchCode}</Badge>
                    <Badge variant={batch.status === 'ONGOING' ? 'success' : 'default'}>
                      {batch.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-indigo-300 font-medium mt-1">
                    Course: {batch.course.title}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedBatch(batch);
                      setAssignTeacherModalOpen(true);
                    }}
                    className="text-xs gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Assign Teacher
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedBatch(batch);
                      setEnrollStudentModalOpen(true);
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" /> Enroll Student
                  </Button>
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
                  <div className="text-sm text-indigo-400 mt-0.5">
                    {batch.teachers && batch.teachers.length > 0
                      ? batch.teachers.map((t) => t.teacher?.user?.lastName).join(', ')
                      : 'None assigned'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Offline Batch"
        description="Configure a new laboratory cohort"
      >
        <form onSubmit={handleSubmit(onCreateBatch)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Batch Name</label>
            <Input placeholder="e.g. Full Stack Cohort 2026-Beta" error={errors.name?.message} {...register('name')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Batch Code</label>
              <Input placeholder="e.g. FS-2026-B" error={errors.batchCode?.message} {...register('batchCode')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Associated Course</label>
              <Select error={errors.courseId?.message} {...register('courseId')}>
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
              <Input type="date" error={errors.startDate?.message} {...register('startDate')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Capacity</label>
              <Input type="number" defaultValue={30} error={errors.capacity?.message} {...register('capacity')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Schedule & Lab Timings</label>
            <Input placeholder="e.g. Mon-Fri | 9:30 AM – 1:30 PM (Offline Lab)" {...register('timing')} />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Create Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN TEACHER MODAL */}
      {selectedBatch && (
        <Modal
          isOpen={assignTeacherModalOpen}
          onClose={() => setAssignTeacherModalOpen(false)}
          title={`Assign Teacher to ${selectedBatch.name}`}
          description="Appoint an approved faculty instructor to lead this laboratory cohort"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Faculty Member</label>
              <Select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
                <option value="">Choose Instructor...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.teacherProfile?.id}>
                    Prof. {t.firstName} {t.lastName} ({t.teacherProfile?.specialization || 'Faculty'})
                  </option>
                ))}
              </Select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAssignTeacherModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={onAssignTeacher}>
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ENROLL STUDENT MODAL */}
      {selectedBatch && (
        <Modal
          isOpen={enrollStudentModalOpen}
          onClose={() => setEnrollStudentModalOpen(false)}
          title={`Enroll Student into ${selectedBatch.name}`}
          description="Directly enroll an active student into this offline laboratory batch"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Student</label>
              <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                <option value="">Choose Student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.studentProfile?.id}>
                    {s.firstName} {s.lastName} ({s.email}) - {s.studentProfile?.enrollmentNumber}
                  </option>
                ))}
              </Select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEnrollStudentModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={onEnrollStudent}>
                Enroll Student
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
