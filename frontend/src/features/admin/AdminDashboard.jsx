import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { motion } from 'motion/react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassStat } from '../../components/ui/GlassStat';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard = () => {
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
      {/* Executive Welcome Banner */}
      <GlassPanel glow="cyan" className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-rose-500/30 text-rose-400 text-xs font-mono mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              SYSTEM ADMINISTRATION GATEWAY • ROOT AUTHORITY
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Institute Operations Console
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              Oversee admissions, manage faculty appointments, publish academic curriculums, and audit administrative actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/admin/registrations">
              <GlassButton variant="primary" className="gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-cyan" />
                Review Requests ({pendingStudents.length + pendingTeachers.length})
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassPanel>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStat
          title="Active Students"
          value={studentsLoading ? '...' : totalStudents}
          subtitle="Enrolled in Cohorts"
          icon={GraduationCap}
          glow="cyan"
        />
        <GlassStat
          title="Faculty Instructors"
          value={teachersLoading ? '...' : totalTeachers}
          subtitle="Assigned Teachers"
          icon={Users}
          glow="blue"
        />
        <GlassStat
          title="Programs Offered"
          value={coursesLoading ? '...' : totalCourses}
          subtitle="Curriculums"
          icon={BookOpen}
          glow="violet"
        />
        <GlassStat
          title="Active Batches"
          value={batchesLoading ? '...' : totalBatches}
          subtitle="Laboratory Cohorts"
          icon={Calendar}
          glow="magenta"
        />
      </div>

      {/* Review Queue Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Student Registrations */}
        <GlassPanel className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-cyan" />
                  Pending Student Admissions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Offline-verified student verification requests</p>
              </div>
              <Link to="/admin/registrations">
                <GlassButton variant="ghost" size="sm" className="text-xs text-brand-cyan">
                  View All ({pendingStudents.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </GlassButton>
              </Link>
            </div>

            <div className="space-y-3">
              {pendingStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">No pending student requests.</div>
              ) : (
                pendingStudents.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{r.fullName}</h5>
                      <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                    </div>
                    <GlassBadge variant={r.isEmailVerified ? 'success' : 'warning'}>
                      {r.isEmailVerified ? 'Email Verified' : 'Unverified'}
                    </GlassBadge>
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassPanel>

        {/* Pending Teacher Applications */}
        <GlassPanel className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-violet" />
                  Pending Teacher Applications
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Faculty candidates awaiting administrative approval</p>
              </div>
              <Link to="/admin/registrations">
                <GlassButton variant="ghost" size="sm" className="text-xs text-brand-violet">
                  View All ({pendingTeachers.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </GlassButton>
              </Link>
            </div>

            <div className="space-y-3">
              {pendingTeachers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">No pending teacher applications.</div>
              ) : (
                pendingTeachers.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{r.fullName}</h5>
                      <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                    </div>
                    <GlassBadge variant="cyan">Faculty Applicant</GlassBadge>
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Recent Security & Audit Logs */}
      <GlassPanel glow="blue" className="p-6">
        <div className="flex flex-row items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-blue" />
              Recent Security & Administrative Audit Events
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Immutable record of state modifications across all services</p>
          </div>
          <Link to="/admin/audit-logs">
            <GlassButton variant="ghost" size="sm" className="text-xs text-brand-blue">
              Audit Viewer <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </GlassButton>
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">No audit logs recorded yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-mono font-bold text-brand-cyan mr-2">[{log.action}]</span>
                  <span className="text-slate-200">
                    Entity: <strong className="text-white">{log.entity}</strong>
                  </span>
                  {log.user && (
                    <span className="text-slate-400 ml-2">
                      by {log.user.firstName} {log.user.lastName} ({log.user.role})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{formatDate(log.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};
