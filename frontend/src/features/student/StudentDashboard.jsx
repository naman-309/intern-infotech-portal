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
  const studentProfile = user?.studentProfile;

  // Consolidated parallel data fetching with Promise.all() to eliminate waterfalls
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
    staleTime: 120000, // 2 minutes (leverages Upstash Redis caching)
    refetchOnWindowFocus: false,
  });

  const enrollments = studentProfile?.enrollments || [];
  const recentTests = dashboardData?.progress?.recentTests || [];
  const progressSummary = dashboardData?.progress?.summary || { totalTests: 0, averageScore: 0, averagePercentage: 0 };
  const announcements = dashboardData?.announcements || [];
  const feeSummary = dashboardData?.fees?.summary || { totalCourseFees: 0, totalPaid: 0, totalBalance: 0 };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono">
            <span>Roll #{studentProfile?.rollNumber || 'N/A'}</span>
            <span>•</span>
            <span>Enrollment ID: {studentProfile?.enrollmentNumber || 'N/A'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Track your offline laboratory examination marks, view batch announcements, and monitor your academic progress in real time.
          </p>
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
                    <h4 className="text-sm font-bold text-white">{e.course.title}</h4>
                    <Badge variant="success">Active Enrollment</Badge>
                  </div>
                  <div className="text-xs text-brand-400 font-mono">
                    Batch: {e.batch.name} ({e.batch.batchCode})
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Timing: {e.batch.timing || 'Mon-Fri Offline Lab'}</span>
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
