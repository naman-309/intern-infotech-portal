import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
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
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono mb-2">
              <span>Employee #{teacherProfile?.employeeId || 'IIT-T101'}</span>
              <span>•</span>
              <span>{teacherProfile?.specialization || 'Systems Faculty'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Instructor Dashboard — Prof. {user?.lastName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Record offline examination marks, manage assigned laboratory cohorts, and review student registration admissions.
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link to="/teacher/exams">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Offline Exam
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Assigned Batches</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{batches.length}</h3>
              <p className="text-[11px] text-indigo-400 mt-1">Active Laboratory Cohorts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Offline Exams Recorded</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{exams.length}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Supervised In-Person Tests</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Student Requests</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{pendingRequests.length}</h3>
              <p className="text-[11px] text-amber-400 mt-1">Awaiting Review</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Batches Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Laboratory Batches</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Cohorts you are currently assigned to instruct</p>
          </div>
          <Link to="/teacher/batches">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
              View All Rosters <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5">
          {batchesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No batches currently assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{b.name}</h4>
                    <Badge variant="primary">{b.batchCode}</Badge>
                  </div>
                  <div className="text-xs text-indigo-300">{b.course.title}</div>
                  <div className="text-[11px] text-slate-400">{b.timing || 'Mon-Fri Offline Lab'}</div>
                  <div className="text-[11px] text-slate-500 font-mono pt-1">
                    Enrolled Students: {b._count?.enrollments || 0} / Capacity {b.capacity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Student Registrations Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Student Admission Requests</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Offline enrolled students awaiting faculty approval</p>
          </div>
          <Link to="/teacher/requests">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
              Review Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5">
          {requestsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No pending student registration requests in your queue.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">{req.fullName}</h5>
                    <p className="text-[11px] text-slate-400">{req.email} • {req.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={req.isEmailVerified ? 'success' : 'warning'}>
                      {req.isEmailVerified ? 'Email Verified' : 'Unverified Email'}
                    </Badge>
                    <Link to="/teacher/requests">
                      <Button size="sm" variant="outline" className="text-xs">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
