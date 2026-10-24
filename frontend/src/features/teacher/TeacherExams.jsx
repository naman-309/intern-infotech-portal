import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  GlassPanel,
  GlassButton,
  GlassBadge,
  GlassModal,
} from '../../components/ui';
import { MarksEntryModal } from './MarksEntryModal';
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

        <GlassButton variant="primary" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Offline Examination
        </GlassButton>
      </div>

      {isLoading ? (
        <div className="h-64 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
      ) : exams.length === 0 ? (
        <GlassPanel className="p-12 text-center text-slate-400 text-xs">
          No offline examinations created yet. Click the button above to schedule a laboratory test.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <GlassPanel key={exam.id} variant="default" className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{exam.title}</h3>
                    <GlassBadge variant={exam.status === 'PUBLISHED' ? 'success' : 'default'}>
                      {exam.status}
                    </GlassBadge>
                  </div>
                  <div className="text-xs text-indigo-300 font-mono mt-1">
                    Subject: {exam.subject} • Batch: {exam.batch?.name} ({exam.batch?.batchCode})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedExamForMarks(exam)}
                    className="gap-1.5 text-xs text-indigo-300 border-indigo-500/30"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Enter / Edit Marks
                  </GlassButton>

                  {exam.status === 'DRAFT' && (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      isLoading={publishMutation.isPending && publishMutation.variables === exam.id}
                      onClick={() => publishMutation.mutate(exam.id)}
                      className="gap-1.5 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish Results
                    </GlassButton>
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
                  <div className="text-sm text-slate-300 mt-0.5">{exam.createdBy?.name || `${exam.createdBy?.firstName || ''} ${exam.createdBy?.lastName || ''}`.trim()}</div>
                </div>
              </div>

              {exam.description && (
                <div className="text-xs text-slate-300 bg-white/[0.03] p-3.5 rounded-xl border border-white/10">
                  {exam.description}
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      <GlassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Offline Examination"
        description="Offline in-person lab test or written examination"
      >
        <form onSubmit={handleSubmit(onCreateExam)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Test Title</label>
            <input
              placeholder="e.g. Distributed Consensus Lab Exam"
              {...register('title')}
              className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.title && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Domain</label>
              <input
                placeholder="e.g. Raft & Database Internals"
                {...register('subject')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.subject && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Batch</label>
              <select
                {...register('batchId')}
                className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batchCode})
                  </option>
                ))}
              </select>
              {errors.batchId && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.batchId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date</label>
              <input
                type="date"
                {...register('examDate')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.examDate && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.examDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Maximum Marks</label>
              <input
                type="number"
                step="0.5"
                placeholder="100"
                {...register('maxMarks')}
                className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.maxMarks && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.maxMarks.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Test Scope / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. 3-hour supervised implementation test..."
              {...register('description')}
              className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <GlassButton type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Examination
            </GlassButton>
          </div>
        </form>
      </GlassModal>

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

export default TeacherExams;
