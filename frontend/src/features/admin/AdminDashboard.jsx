import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileCheck2,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Zap,
  RefreshCw,
  Database,
} from 'lucide-react';

export const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [isPurging, setIsPurging] = React.useState(false);

  const handlePurgeCache = async () => {
    try {
      setIsPurging(true);
      const res = await api.post('/courses/cache/purge');
      queryClient.invalidateQueries();
      toast.success(res?.message || 'Upstash Redis cache successfully wiped! Fresh data reloaded.');
    } catch (err) {
      toast.error(err.message || 'Failed to purge Redis cache');
    } finally {
      setIsPurging(false);
    }
  };
  // 1. Fetch Students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['adminStudentsCount'],
    queryFn: () => api.get('/students?limit=1'),
  });

  // 2. Fetch Teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['adminTeachersCount'],
    queryFn: () => api.get('/teachers?limit=1'),
  });

  // 3. Fetch Courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['adminCoursesCount'],
    queryFn: () => api.get('/courses?limit=1'),
  });

  // 4. Fetch Batches
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['adminBatchesCount'],
    queryFn: () => api.get('/batches?limit=1'),
  });

  // 5. Fetch Pending Student Requests
  const { data: studentRequestsData } = useQuery({
    queryKey: ['pendingStudentRequests'],
    queryFn: () => api.get('/registrations?status=PENDING&role=STUDENT'),
  });

  // 6. Fetch Pending Teacher Requests
  const { data: teacherRequestsData } = useQuery({
    queryKey: ['pendingTeacherRequests'],
    queryFn: () => api.get('/registrations?status=PENDING&role=TEACHER'),
  });

  // 7. Fetch Recent Audit Logs
  const { data: auditLogsData } = useQuery({
    queryKey: ['recentAuditLogs'],
    queryFn: () => api.get('/audit-logs?limit=5'),
  });

  const totalStudents = studentsData?.pagination?.total || 0;
  const totalTeachers = teachersData?.pagination?.total || 0;
  const totalCourses = coursesData?.pagination?.total || 0;
  const totalBatches = batchesData?.pagination?.total || 0;
  const pendingStudents = studentRequestsData?.data || [];
  const pendingTeachers = teacherRequestsData?.data || [];
  const recentLogs = auditLogsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Executive Welcome Banner with dev@nkkr flex & Operating Hours */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-mono border border-rose-500/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                SYSTEM ADMINISTRATION • FULL ACCESS
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Campus Hours: <strong>7:00 AM – 7:00 PM</strong></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Institute Operations Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light">
              Oversee admissions, manage faculty appointments, publish academic curriculums, and audit administrative actions in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">System Lead</div>
                <div className="text-xs font-bold text-sky-300 font-mono">dev@nkkr</div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePurgeCache}
              disabled={isPurging}
              className="gap-2 border-slate-700 bg-slate-900/60 hover:border-amber-500/50 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 transition-colors"
              title="Wipe cached query data across Redis (Free tier 250MB storage & 30-min TTL strategy)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              {isPurging ? 'Purging Cache...' : 'Flush Redis Cache'}
            </Button>

            <Link to="/admin/registrations">
              <Button size="sm" variant="primary" className="gap-2 bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-md shadow-sky-500/20">
                <FileCheck2 className="w-4 h-4" />
                Review Requests ({pendingStudents.length + pendingTeachers.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Students</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{totalStudents}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Enrolled in Cohorts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Faculty Instructors</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{totalTeachers}</h3>
              <p className="text-[11px] text-sky-400 mt-1">Assigned Teachers</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Programs Offered</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{totalCourses}</h3>
              <p className="text-[11px] text-indigo-400 mt-1">Curriculums</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Batches</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{totalBatches}</h3>
              <p className="text-[11px] text-amber-400 mt-1">Laboratory Cohorts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Student Registrations */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Student Admissions</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Offline-verified student verification requests</p>
            </div>
            <Link to="/admin/registrations">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
                View All ({pendingStudents.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {pendingStudents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No pending student requests.</div>
            ) : (
              pendingStudents.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{r.fullName}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                  </div>
                  <Badge variant={r.isEmailVerified ? 'success' : 'warning'}>
                    {r.isEmailVerified ? 'Email Verified' : 'Unverified'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Teacher Applications */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Teacher Applications</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Faculty candidates awaiting administrative approval</p>
            </div>
            <Link to="/admin/registrations">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
                View All ({pendingTeachers.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {pendingTeachers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No pending teacher applications.</div>
            ) : (
              pendingTeachers.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{r.fullName}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                  </div>
                  <Badge variant="primary">Faculty Applicant</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Security & Audit Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Security & Administrative Audit Events</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Immutable record of state modifications across all services</p>
          </div>
          <Link to="/admin/audit-logs">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
              Audit Viewer <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5">
          {recentLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No audit logs recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-indigo-400 mr-2">[{log.action}]</span>
                    <span className="text-slate-200">
                      Entity: <strong className="text-white">{log.entity}</strong>
                    </span>
                    {log.user && (
                      <span className="text-slate-400 ml-2">
                        by {log.user.firstName} {log.user.lastName} ({log.user.role})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
