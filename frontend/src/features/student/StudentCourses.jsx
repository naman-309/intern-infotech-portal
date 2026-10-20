import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, BookOpen, User, CheckCircle } from 'lucide-react';

export const StudentCourses = () => {
  const { user } = useAuth();

  const { data: meData } = useQuery({
    queryKey: ['studentProfileMe', user?.id],
    queryFn: () => api.get('/auth/me'),
    staleTime: 60000,
  });

  const freshUser = meData?.data?.user || user;
  const enrollments = freshUser?.studentProfile?.enrollments || user?.studentProfile?.enrollments || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Enrolled Programs & Batches</h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed schedule, assigned faculty instructors, and syllabus outline for your active offline cohorts.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No course enrollments found. Please contact the offline center administration desk.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {enrollments.map((e) => (
            <Card key={e.id} className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-white">{e.course.title}</h3>
                    <Badge variant="success">Active Cohort</Badge>
                  </div>
                  <div className="text-xs text-indigo-400 font-mono mt-1">
                    Batch Code: {e.batch.batchCode} • {e.batch.name}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Program Duration: {e.course.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batch Logistics */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-300 font-mono">
                    Offline Laboratory Logistics
                  </h4>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Class Schedule: {e.batch.timing || 'Monday – Friday | 9:30 AM – 1:30 PM'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Campus Station: Lab Workstation assigned</span>
                    </div>
                  </div>
                </div>

                {/* Course Syllabus Overview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-300 font-mono">
                    Academic Scope
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {e.course.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
