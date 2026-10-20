import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BookOpen,
  Award,
  Bell,
  CreditCard,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: meData } = useQuery({
    queryKey: ['studentProfileMe', user?.id],
    queryFn: () => api.get('/auth/me'),
    staleTime: 60000,
  });

  const freshUser = meData?.data?.user || user;
  const studentProfile = freshUser?.studentProfile || user?.studentProfile;
  const enrollments = studentProfile?.enrollments || [];

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard', user?.id],
    queryFn: async () => {
      const [progressRes, announcementsRes, feesRes] = await Promise.all([
        api.get('/mock-interviews/my-progress').catch(() => ({ data: { recentTests: [], summary: {} } })),
        api.get('/announcements').catch(() => ({ data: [] })),
        api.get('/fees/my-fees').catch(() => ({ data: { summary: {}, feeRecords: [] } })),
      ]);

      return {
        progress: progressRes?.data?.data || progressRes?.data || {},
        announcements: announcementsRes?.data?.data || announcementsRes?.data || [],
        fees: feesRes?.data?.data || feesRes?.data || {},
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const recentTests = dashboardData?.progress?.recentTests || [];
  const progressSummary = dashboardData?.progress?.summary || { totalTests: 0, averageScore: 0, averagePercentage: 0 };
  const announcements = dashboardData?.announcements || [];
  const feeSummary = dashboardData?.fees?.summary || { totalCourseFees: 0, totalPaid: 0, totalBalance: 0 };

  return (
    <div className="space-y-8">
      {/* Welcome Banner with dev@nkkr Flex & Operating Hours */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono font-medium border border-sky-500/30">
                Roll #{studentProfile?.rollNumber || 'R-1001'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-400 text-xs font-mono border border-slate-800">
                Enrollment ID: {studentProfile?.enrollmentNumber || 'IIT-2026-S1001'}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                <Clock className="w-3.5 h-3.5" />
                <span>Lab Hours: <strong>7:00 AM – 7:00 PM</strong></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-sky-400">{user?.firstName}!</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Track your offline laboratory examination marks, view batch announcements, and monitor your academic progress in real time.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-mono uppercase">Enrolled Programs</div>
                <div className="text-xs font-bold text-sky-300 font-mono">{enrollments.length} Active Cohorts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Enrolled Cohorts</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{enrollments.length}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Active Offline Labs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Mock Interview Avg</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {progressSummary.totalTests > 0 ? `${progressSummary.averageScore} / 35` : 'N/A'}
              </h3>
              <p className="text-[11px] text-brand-400 mt-1">
                {progressSummary.totalTests > 0 ? `${progressSummary.averagePercentage}% across ${progressSummary.totalTests} tests` : '35.0 scale'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Fee Balance</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {formatCurrency(feeSummary.totalBalance)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Paid: {formatCurrency(feeSummary.totalPaid)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Recent Notices</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{announcements.length}</h3>
              <p className="text-[11px] text-sky-400 mt-1">Targeted to your batch</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split: Courses & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Enrolled Courses & Batches */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Enrolled Batches</CardTitle>
              <CardDescription>Offline laboratory courses and schedules</CardDescription>
            </div>
            <Link to="/student/courses">
              <Button variant="ghost" size="sm" className="text-xs text-brand-400">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                You are not currently enrolled in any active batch. Contact admissions.
              </div>
            ) : (
              enrollments.map((e) => (
                <div key={e.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{e.course?.title || 'Enrolled Course'}</h4>
                    <Badge variant="success">Active Enrollment</Badge>
                  </div>
                  <div className="text-xs text-brand-400 font-mono">
                    Batch: {e.batch.name} ({e.batch.batchCode})
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Timing: {e.batch?.timing || 'Mon-Fri Offline Lab'}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Section 2: Recent Mock Interview Progress */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mock Interview Scores</CardTitle>
              <CardDescription>Evaluated out of 35 marks</CardDescription>
            </div>
            <Link to="/student/results">
              <Button variant="ghost" size="sm" className="text-xs text-brand-400">
                Progress Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : recentTests.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No mock interview evaluations recorded yet.
              </div>
            ) : (
              recentTests.slice(0, 3).map((res) => (
                <div key={res.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">{res.title}</h5>
                    <p className="text-[11px] text-slate-400">{res.course} • {formatDate(res.date)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {res.marksObtained} <span className="text-slate-500 text-xs font-normal">/ 35</span>
                    </div>
                    <Badge variant={res.percentage >= 75 ? 'success' : res.percentage >= 50 ? 'primary' : 'warning'} className="text-[10px]">
                      {res.percentage}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Priority Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Academy Announcements</CardTitle>
            <CardDescription>Official notices targeted to you and your cohorts</CardDescription>
          </div>
          <Link to="/student/announcements">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
              View All Notices
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : announcements.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No active announcements.</div>
          ) : (
            announcements.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">{item.title}</h5>
                  <Badge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'default'}>
                    {item.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.body}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Posted by {item.author?.firstName} {item.author?.lastName} on {formatDate(item.publishDate)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
