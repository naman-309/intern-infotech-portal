import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

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
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <Award className="w-6 h-6 text-indigo-400" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Cumulative Percentage</div>
            <div className="text-lg font-bold text-white font-mono">{summary.overallPercentage}%</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : results.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No published exam results are currently available for your account.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-4">Examination Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Exam Date</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold text-white">{r.exam.title}</td>
                    <td className="p-4 text-slate-300">{r.exam.subject}</td>
                    <td className="p-4 text-slate-400 font-mono">{formatDate(r.exam.examDate)}</td>
                    <td className="p-4 font-bold font-mono text-indigo-400">
                      {r.marksObtained} <span className="text-slate-500 font-normal">/ {r.exam.maxMarks}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={r.percentage >= 80 ? 'success' : r.percentage >= 60 ? 'primary' : 'warning'}>
                        {r.percentage}%
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Published
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 italic max-w-xs truncate">
                      {r.remarks || 'Satisfactory offline lab execution.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
