import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  GlassBadge,
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHead,
  GlassTableCell,
  GlassTableLoading,
  GlassPanel,
} from '../../components/ui';
import { Award, CheckCircle2 } from 'lucide-react';

export const StudentResults = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['studentResults'],
    queryFn: () => api.get('/results/my-results'),
  });

  const results = data?.data?.results || [];
  const summary = data?.data?.summary || { totalExams: 0, totalMarksObtained: 0, totalMaxMarks: 0, overallPercentage: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Offline Examination Results</h2>
          <p className="text-xs text-slate-400 mt-1">
            Official published scores for in-person laboratory evaluations and whiteboard problem solving tests.
          </p>
        </div>

        {/* Aggregate Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-glass-sm">
          <Award className="w-6 h-6 text-indigo-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Cumulative Percentage</div>
            <div className="text-lg font-bold text-white font-mono">{summary.overallPercentage}%</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <GlassTableLoading columns={7} rows={4} standalone />
      ) : results.length === 0 ? (
        <GlassPanel className="p-12 text-center text-slate-400 text-xs">
          No published exam results are currently available for your account.
        </GlassPanel>
      ) : (
        <GlassTable>
            <GlassTableHeader>
              <tr>
                <GlassTableHead>Examination Title</GlassTableHead>
                <GlassTableHead>Subject</GlassTableHead>
                <GlassTableHead>Exam Date</GlassTableHead>
                <GlassTableHead>Score</GlassTableHead>
                <GlassTableHead>Percentage</GlassTableHead>
                <GlassTableHead>Status</GlassTableHead>
                <GlassTableHead>Faculty Remarks</GlassTableHead>
              </tr>
            </GlassTableHeader>
            <GlassTableBody>
              {results.map((r) => (
                <GlassTableRow key={r.id}>
                  <GlassTableCell className="font-semibold text-white">{r.exam?.title}</GlassTableCell>
                  <GlassTableCell className="text-slate-300">{r.exam?.subject}</GlassTableCell>
                  <GlassTableCell className="text-slate-400 font-mono">{formatDate(r.exam?.examDate)}</GlassTableCell>
                  <GlassTableCell className="font-bold font-mono text-indigo-300">
                    {r.marksObtained} <span className="text-slate-500 font-normal">/ {r.exam?.maxMarks}</span>
                  </GlassTableCell>
                  <GlassTableCell>
                    <GlassBadge variant={r.percentage >= 80 ? 'success' : r.percentage >= 60 ? 'primary' : 'warning'}>
                      {r.percentage}%
                    </GlassBadge>
                  </GlassTableCell>
                  <GlassTableCell>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published
                    </span>
                  </GlassTableCell>
                  <GlassTableCell className="text-slate-400 italic max-w-xs truncate">
                    {r.remarks || 'Satisfactory offline lab execution.'}
                  </GlassTableCell>
                </GlassTableRow>
              ))}
            </GlassTableBody>
        </GlassTable>
      )}
    </div>
  );
};

export default StudentResults;
