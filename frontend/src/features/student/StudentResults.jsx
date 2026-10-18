import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ClipboardList,
  Target,
  Sparkles,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

export const StudentResults = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['studentMockProgress'],
    queryFn: () => api.get('/mock-interviews/my-progress'),
  });

  const progressData = data?.data;
  const summary = progressData?.summary || {
    totalTests: 0,
    averageScore: 0,
    totalMarks: 35.0,
    averagePercentage: 0,
    highestMarks: 0,
    lowestMarks: 0,
  };
  const monthlyReport = progressData?.monthlyReport || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 text-xs font-mono mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Academic Performance Tracker</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mock Interview Progress Report</h2>
          <p className="text-xs text-slate-400 mt-1">
            Month-by-month evaluation of your technical interview readiness, problem-solving, and scores out of 35 marks.
          </p>
        </div>

        {/* Highlight Score Pill */}
        {summary.totalTests > 0 && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-brand-500/30 shadow-lg">
            <Award className="w-7 h-7 text-brand-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Overall Average</div>
              <div className="text-lg font-bold text-white font-mono">
                {summary.averageScore} <span className="text-xs text-slate-500 font-normal">/ 35</span>{' '}
                <span className="text-brand-400 font-sans text-xs">({summary.averagePercentage}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Interviews Attended</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{summary.totalTests}</h3>
              <p className="text-[11px] text-brand-400 mt-1">Evaluated by mentors</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Average Score (Out of 35)</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {summary.totalTests > 0 ? `${summary.averageScore} / 35` : 'N/A'}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1">Scale: 35.0 Maximum</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Highest Score</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {summary.totalTests > 0 ? `${summary.highestMarks} / 35` : 'N/A'}
              </h3>
              <p className="text-[11px] text-indigo-400 mt-1">Personal Best</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Success Rate</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {summary.totalTests > 0 ? `${summary.averagePercentage}%` : 'N/A'}
              </h3>
              <p className="text-[11px] text-sky-400 mt-1">Cumulative Grade</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : monthlyReport.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs border-slate-800 bg-slate-900/50">
          No mock interview evaluations recorded yet. Scores will automatically populate here after your mentor conducts your mock session.
        </Card>
      ) : (
        /* Month-by-Month Chronological Log */
        <div className="space-y-6">
          {monthlyReport.map((monthGroup) => (
            <Card
              key={monthGroup.month}
              className="border-slate-800 bg-slate-900/70 shadow-xl overflow-hidden"
            >
              <CardHeader className="bg-slate-950/80 border-b border-slate-800 py-3.5 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span className="font-bold text-white text-sm">{monthGroup.month}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({monthGroup.tests.length} tests)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400">
                    Monthly Avg:{' '}
                    <span className="font-bold text-emerald-400">{monthGroup.averageMarks} / 35</span>
                  </div>
                  <Badge
                    variant={
                      monthGroup.averagePercentage >= 75
                        ? 'success'
                        : monthGroup.averagePercentage >= 50
                        ? 'primary'
                        : 'warning'
                    }
                    className="font-mono text-xs"
                  >
                    {monthGroup.averagePercentage}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Course Program</th>
                        <th className="p-3.5">Interview Session</th>
                        <th className="p-3.5 text-center">Marks (Out of 35)</th>
                        <th className="p-3.5 text-center">Percentage</th>
                        <th className="p-3.5">Mentor Evaluation & Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {monthGroup.tests.map((test) => (
                        <tr key={test.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5 whitespace-nowrap text-slate-400">
                            {formatDate(test.date)}
                          </td>
                          <td className="p-3.5 font-bold text-brand-400 font-sans">
                            {test.course}
                          </td>
                          <td className="p-3.5 text-white font-sans font-medium">
                            {test.title}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              {test.marksObtained}
                              <span className="text-slate-500 text-[10px] font-normal">/ 35</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <Badge
                              variant={
                                test.percentage >= 75
                                  ? 'success'
                                  : test.percentage >= 50
                                  ? 'primary'
                                  : 'warning'
                              }
                              className="font-mono text-xs"
                            >
                              {test.percentage}%
                            </Badge>
                          </td>
                          <td className="p-3.5 text-slate-300 font-sans">
                            {test.feedback ? (
                              <div className="flex items-start gap-1.5 text-xs text-slate-300 italic">
                                <MessageSquare className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                                <span>{test.feedback}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs italic">
                                Satisfactory performance in technical interview.
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
