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
import { MarksEntryModal } from './MarksEntryModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, ClipboardList, CheckCircle2, History, Edit3, Send } from 'lucide-react';
import { toast } from 'sonner';

const createExamSchema = z.object({
  title: z.string().min(3, 'Test title is required'),
  subject: z.string().min(2, 'Subject is required'),
  batchId: z.string().uuid('Please select an assigned batch'),
  examDate: z.string().min(1, 'Exam date is required'),
  maxMarks: z.coerce.number().positive('Max marks must be greater than 0'),
  description: z.string().optional(),
});

export const TeacherExams = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);

  // 1. Fetch Teacher Assigned Batches
  const { data: batchesData } = useQuery({
    queryKey: ['teacherBatches'],
    queryFn: () => api.get('/batches'),
  });

  // 2. Fetch Offline Exams
  const { data: examsData, isLoading } = useQuery({
    queryKey: ['teacherExams'],
    queryFn: () => api.get('/exams'),
  });

  const batches = batchesData?.data || [];
  const exams = examsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createExamSchema),
  });

  const onCreateExam = async (values) => {
    try {
      const selectedBatch = batches.find((b) => b.id === values.batchId);
      if (!selectedBatch) throw new Error('Selected batch not found');

      await api.post('/exams', {
        ...values,
        courseId: selectedBatch.courseId,
      });

      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Offline examination record created! You can now enter student marks.');
      reset();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create exam');
    }
  };

  const publishMutation = useMutation({
    mutationFn: async (examId) => {
      await api.post(`/exams/${examId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Examination results officially published! Notifications dispatched to students.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish results');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Offline Examination Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create in-person laboratory evaluations, record student marks, and publish official grades.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Offline Examination
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : exams.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No offline examinations created yet. Click the button above to schedule a laboratory test.
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{exam.title}</h3>
                    <Badge variant={exam.status === 'PUBLISHED' ? 'success' : 'default'}>
                      {exam.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-indigo-400 font-mono mt-1">
                    Subject: {exam.subject} • Batch: {exam.batch.name} ({exam.batch.batchCode})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedExamForMarks(exam)}
                    className="gap-1.5 text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Enter / Edit Marks
                  </Button>

                  {exam.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={publishMutation.isPending && publishMutation.variables === exam.id}
                      onClick={() => publishMutation.mutate(exam.id)}
                      className="gap-1.5 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish Results
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Exam Date</div>
                  <div className="text-sm text-slate-200 mt-0.5">{formatDate(exam.examDate)}</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Maximum Marks</div>
                  <div className="text-sm font-bold text-white mt-0.5">{exam.maxMarks}</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Graded Students</div>
                  <div className="text-sm text-indigo-300 mt-0.5">{exam._count?.results || 0} Records</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Created By</div>
                  <div className="text-sm text-slate-300 mt-0.5">{exam.createdBy?.firstName} {exam.createdBy?.lastName}</div>
                </div>
              </div>

              {exam.description && (
                <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {exam.description}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Offline Examination"
        description="Offline in-person lab test or written examination"
      >
        <form onSubmit={handleSubmit(onCreateExam)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Test Title</label>
            <Input placeholder="e.g. Distributed Consensus Lab Exam" error={errors.title?.message} {...register('title')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Domain</label>
              <Input placeholder="e.g. Raft & Database Internals" error={errors.subject?.message} {...register('subject')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Batch</label>
              <Select error={errors.batchId?.message} {...register('batchId')}>
                <option value="">Select Batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batchCode})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date</label>
              <Input type="date" error={errors.examDate?.message} {...register('examDate')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Maximum Marks</label>
              <Input type="number" step="0.5" placeholder="100" error={errors.maxMarks?.message} {...register('maxMarks')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Test Scope / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. 3-hour supervised implementation test..."
              className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              {...register('description')}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Create Examination
            </Button>
          </div>
        </form>
      </Modal>

      {/* MARKS ENTRY MODAL */}
      {selectedExamForMarks && (
        <MarksEntryModal
          exam={selectedExamForMarks}
          isOpen={!!selectedExamForMarks}
          onClose={() => setSelectedExamForMarks(null)}
        />
      )}
    </div>
  );
};
