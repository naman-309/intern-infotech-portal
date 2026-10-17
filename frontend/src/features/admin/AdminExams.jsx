import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { MarksEntryModal } from '../teacher/MarksEntryModal';
import { ClipboardList, Send, RotateCcw, Edit3, ShieldAlert } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Offline Examination Oversight</h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise marks recording across all batches, audit academic grades, and control publication.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : exams.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No offline examinations recorded in the system.
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
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedExamForMarks(exam)}
                    className="text-xs gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Oversee / Correct Marks
                  </Button>

                  {exam.status === 'DRAFT' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={publishMutation.isPending && publishMutation.variables === exam.id}
                      onClick={() => publishMutation.mutate(exam.id)}
                      className="text-xs gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish Results
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={unpublishMutation.isPending && unpublishMutation.variables === exam.id}
                      onClick={() => unpublishMutation.mutate(exam.id)}
                      className="text-xs gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Unpublish
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
                  <div className="text-sm text-emerald-400 mt-0.5">{exam._count?.results || 0} Students</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Faculty Author</div>
                  <div className="text-sm text-slate-300 mt-0.5">{exam.createdBy?.firstName} {exam.createdBy?.lastName}</div>
                </div>
              </div>
            </Card>
          ))}
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
