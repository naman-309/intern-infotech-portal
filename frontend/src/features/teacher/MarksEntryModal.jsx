import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { AlertCircle, Save, CheckCircle2, History } from 'lucide-react';
import { toast } from 'sonner';

export const MarksEntryModal = ({ exam, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [marksState, setMarksState] = useState({});
  const [remarksState, setRemarksState] = useState({});
  const [reasonForChange, setReasonForChange] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch full exam details with student list
  const { data: examDetailData, isLoading } = useQuery({
    queryKey: ['examDetail', exam?.id],
    queryFn: () => api.get(`/exams/${exam.id}`),
    enabled: !!exam?.id && isOpen,
  });

  const fullExam = examDetailData?.data?.exam || exam;
  const enrollments = fullExam?.batch?.enrollments || [];
  const existingResults = fullExam?.results || [];

  // Populate state with existing marks
  useEffect(() => {
    if (fullExam) {
      const initialMarks = {};
      const initialRemarks = {};

      // Map from existing results
      existingResults.forEach((r) => {
        initialMarks[r.studentId] = r.marksObtained;
        initialRemarks[r.studentId] = r.remarks || '';
      });

      setMarksState(initialMarks);
      setRemarksState(initialRemarks);
    }
  }, [fullExam]);

  const handleMarkChange = (studentId, value) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleRemarkChange = (studentId, value) => {
    setRemarksState((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async ({ shouldPublish = false }) => {
      // Validate
      const entries = [];
      for (const enr of enrollments) {
        const studentId = enr.student.id;
        const val = marksState[studentId];

        if (val !== undefined && val !== '') {
          const num = parseFloat(val);
          if (isNaN(num)) {
            throw new Error(`Invalid mark for student ${enr.student.user?.firstName}`);
          }
          if (num < 0) {
            throw new Error(`Marks cannot be negative.`);
          }
          if (num > fullExam.maxMarks) {
            throw new Error(`Marks (${num}) cannot exceed max marks (${fullExam.maxMarks}).`);
          }

          entries.push({
            studentId,
            marksObtained: num,
            remarks: remarksState[studentId] || undefined,
            reasonForChange: reasonForChange || undefined,
          });
        }
      }

      if (entries.length === 0) {
        throw new Error('Please enter marks for at least one student.');
      }

      // Record marks
      await api.post('/results/record-marks', {
        examId: fullExam.id,
        entries,
      });

      // If publish requested
      if (shouldPublish) {
        await api.post(`/exams/${fullExam.id}/publish`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      queryClient.invalidateQueries({ queryKey: ['examDetail', fullExam.id] });
      toast.success(
        variables.shouldPublish
          ? 'Marks saved and published! Students notified via email.'
          : 'Marks saved successfully as draft.'
      );
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save marks');
      toast.error(err.message || 'Failed to save marks');
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Marks: ${fullExam?.title || 'Offline Exam'}`}
      description={`Subject: ${fullExam?.subject} • Maximum Marks: ${fullExam?.maxMarks} • Batch: ${fullExam?.batch?.name}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div>Batch Roster: {enrollments.length} Enrolled Students</div>
          <div>Status: <Badge variant={fullExam?.status === 'PUBLISHED' ? 'success' : 'default'}>{fullExam?.status}</Badge></div>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No students are currently enrolled in this batch.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {enrollments.map((enr) => {
              const student = enr.student;
              const studentId = student.id;
              const currentScore = marksState[studentId] ?? '';
              const numVal = parseFloat(currentScore);
              const percentage = !isNaN(numVal) && fullExam.maxMarks > 0
                ? ((numVal / fullExam.maxMarks) * 100).toFixed(1)
                : null;

              return (
                <div
                  key={studentId}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white">
                      {student.user?.firstName} {student.user?.lastName}
                    </h5>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Roll #{student.rollNumber || 'N/A'} • {student.enrollmentNumber}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max={fullExam.maxMarks}
                        step="0.5"
                        placeholder="Marks"
                        value={currentScore}
                        onChange={(e) => handleMarkChange(studentId, e.target.value)}
                        className="h-8 text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="w-16 text-center font-mono text-xs">
                      {percentage ? <span className="text-indigo-400 font-bold">{percentage}%</span> : <span className="text-slate-600">-</span>}
                    </div>
                    <div className="w-48">
                      <Input
                        type="text"
                        placeholder="Feedback / Remarks"
                        value={remarksState[studentId] || ''}
                        onChange={(e) => handleRemarkChange(studentId, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {fullExam?.status === 'PUBLISHED' && (
          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1">
              Reason for Revising Published Marks (Recorded in Audit History)
            </label>
            <Input
              type="text"
              placeholder="e.g. Laboratory re-evaluation of concurrency lab component"
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              isLoading={saveMutation.isPending && !saveMutation.variables?.shouldPublish}
              onClick={() => saveMutation.mutate({ shouldPublish: false })}
              className="gap-2 text-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft Marks
            </Button>

            <Button
              variant="primary"
              size="sm"
              isLoading={saveMutation.isPending && saveMutation.variables?.shouldPublish}
              onClick={() => saveMutation.mutate({ shouldPublish: true })}
              className="gap-2 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Save & Publish Results
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
