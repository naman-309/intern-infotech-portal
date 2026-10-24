import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  GlassPanel,
  GlassStat,
  GlassBadge,
  GlassButton,
} from '../../components/ui';
import {
  Calendar,
  ClipboardList,
  Users,
  FileCheck2,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const teacherProfile = user?.teacherProfile;

  // 1. Fetch Batches
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['teacherBatches'],
    queryFn: () => api.get('/batches'),
  });

  // 2. Fetch Exams
  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['teacherExams'],
    queryFn: () => api.get('/exams'),
  });

  // 3. Fetch Pending Requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['teacherPendingRequests'],
    queryFn: () => api.get('/registrations?status=PENDING&role=STUDENT'),
  });

  const batches = batchesData?.data || [];
  const exams = examsData?.data || [];
  const pendingRequests = requestsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <GlassPanel variant="deep" className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-glass-sm">
              <span>Employee #{teacherProfile?.employeeId || 'IIT-T101'}</span>
              <span>•</span>
              <span>{teacherProfile?.specialization || 'Systems Faculty'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Instructor Dashboard — Prof. {user?.name || user?.lastName}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Record offline examination marks, manage assigned laboratory cohorts, and review student registration admissions.
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link to="/teacher/exams">
              <GlassButton variant="primary" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Offline Exam
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassPanel>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassStat
          label="Assigned Batches"
          value={batches.length}
          sublabel="Active laboratory cohorts"
          color="indigo"
          icon={Calendar}
        />

        <GlassStat
          label="Offline Exams Recorded"
          value={exams.length}
          sublabel="Supervised in-person tests"
          color="emerald"
          icon={ClipboardList}
        />

        <GlassStat
          label="Pending Student Requests"
          value={pendingRequests.length}
          sublabel="Awaiting faculty review"
          color="amber"
          icon={FileCheck2}
        />
      </div>

      {/* Assigned Batches Overview */}
      <GlassPanel variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">My Laboratory Batches</h3>
            <p className="text-xs text-slate-400 mt-0.5">Cohorts you are currently assigned to instruct</p>
          </div>
          <Link to="/teacher/batches">
            <GlassButton variant="ghost" size="sm" className="text-xs text-indigo-300">
              View All Rosters <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </GlassButton>
          </Link>
        </div>

        <div>
          {batchesLoading ? (
            <div className="h-32 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No batches currently assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{b.name}</h4>
                    <GlassBadge variant="primary">{b.batchCode}</GlassBadge>
                  </div>
                  <div className="text-xs text-indigo-300">{b.course?.title}</div>
                  <div className="text-[11px] text-slate-400">{b.timing || 'Mon-Fri Offline Lab'}</div>
                  <div className="text-[11px] text-slate-500 font-mono pt-1">
                    Enrolled Students: {b._count?.enrollments || 0} / Capacity {b.capacity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Pending Student Registrations Preview */}
      <GlassPanel variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Pending Student Admission Requests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Offline enrolled students awaiting faculty approval</p>
          </div>
          <Link to="/teacher/requests">
            <GlassButton variant="ghost" size="sm" className="text-xs text-indigo-300">
              Review Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </GlassButton>
          </Link>
        </div>

        <div>
          {requestsLoading ? (
            <div className="h-20 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No pending student registration requests in your queue.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">{req.fullName}</h5>
                    <p className="text-[11px] text-slate-400">{req.email} • {req.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <GlassBadge variant={req.isEmailVerified ? 'success' : 'warning'}>
                      {req.isEmailVerified ? 'Email Verified' : 'Unverified Email'}
                    </GlassBadge>
                    <Link to="/teacher/requests">
                      <GlassButton size="sm" variant="outline" className="text-xs">
                        Review
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default TeacherDashboard;
