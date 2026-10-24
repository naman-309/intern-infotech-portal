import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { MarksEntryModal } from '../teacher/MarksEntryModal';
import { ClipboardList, Send, RotateCcw, Edit3, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AdminExams = () => {
  const queryClient = useQueryClient();
  const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);

  const { data: examsData, isLoading } = useQuery({
    queryKey: ['adminExams'],
    queryFn: () => api.get('/exams'),
  });

  const exams = examsData?.data || [];

  const publishMutation = useMutation({
    mutationFn: async (examId) => {
      await api.post(`/exams/${examId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
      toast.success('Exam results published to student portal!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish results');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (examId) => {
      await api.post(`/exams/${examId}/unpublish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
      toast.success('Exam results unpublished and reverted to Draft mode.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to unpublish results');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            EXAMINATION AUDIT
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Offline Examination Oversight</h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise marks recording across all batches, audit academic grades, and control publication.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <GlassPanel className="p-16 text-center text-slate-400 text-xs font-mono">
          No offline examinations recorded in the system.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {exams.map((exam, idx) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GlassPanel glow="blue" className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">{exam.title}</h3>
                        <GlassBadge variant={exam.status === 'PUBLISHED' ? 'success' : 'default'}>
                          {exam.status}
                        </GlassBadge>
                      </div>
                      <div className="text-xs text-brand-cyan font-mono mt-1">
                        Subject: {exam.subject} • Batch: {exam.batch.name} ({exam.batch.batchCode})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedExamForMarks(exam)}
                        className="text-xs gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Oversee / Correct Marks
                      </GlassButton>

                      {exam.status === 'DRAFT' ? (
                        <GlassButton
                          size="sm"
                          variant="primary"
                          disabled={publishMutation.isPending && publishMutation.variables === exam.id}
                          onClick={() => publishMutation.mutate(exam.id)}
                          className="text-xs gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Publish Results
                        </GlassButton>
                      ) : (
                        <GlassButton
                          size="sm"
                          variant="danger"
                          disabled={unpublishMutation.isPending && unpublishMutation.variables === exam.id}
                          onClick={() => unpublishMutation.mutate(exam.id)}
                          className="text-xs gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Unpublish
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
                      <div className="text-sm text-emerald-400 mt-0.5">{exam._count?.results || 0} Students</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Faculty Author</div>
                      <div className="text-sm text-brand-cyan mt-0.5">{exam.createdBy?.firstName} {exam.createdBy?.lastName}</div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

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
