import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  GlassStat,
  GlassBadge,
  GlassButton,
  GlassCard3D,
  GlassPanel,
} from '../../components/ui';
import {
  BookOpen,
  Award,
  Bell,
  CreditCard,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const studentProfile = user?.studentProfile;

  // 1. Fetch Student Results
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['studentResults'],
    queryFn: () => api.get('/results/my-results'),
  });

  // 2. Fetch Announcements
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ['studentAnnouncements'],
    queryFn: () => api.get('/announcements'),
  });

  // 3. Fetch Student Fees
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ['studentFees'],
    queryFn: () => api.get('/fees/my-fees'),
  });

  const enrollments = studentProfile?.enrollments || [];
  const results = resultsData?.data?.results || [];
  const resultsSummary = resultsData?.data?.summary || { totalExams: 0, overallPercentage: 0 };
  const announcements = announcementsData?.data || [];
  const feeSummary = feesData?.data?.summary || { totalCourseFees: 0, totalPaid: 0, totalBalance: 0 };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <GlassPanel variant="deep" className="p-6 md:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-glass-sm">
            <span>Roll #{studentProfile?.rollNumber || 'N/A'}</span>
            <span>•</span>
            <span>Enrollment ID: {studentProfile?.enrollmentNumber || 'N/A'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Track your offline laboratory examination marks, view batch announcements, and monitor your academic progress in real time.
          </p>
        </div>
      </GlassPanel>

      {/* Metric 3D Glass Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStat
          label="Enrolled Cohorts"
          value={enrollments.length}
          sublabel="Active Offline Labs"
          color="indigo"
          icon={BookOpen}
        />

        <GlassStat
          label="Overall Score Avg"
          value={resultsSummary.overallPercentage ? `${resultsSummary.overallPercentage}%` : 'N/A'}
          sublabel={`Across ${resultsSummary.totalExams} published exams`}
          color="emerald"
          icon={Award}
        />

        <GlassStat
          label="Pending Fee Balance"
          value={formatCurrency(feeSummary.totalBalance)}
          sublabel={`Paid: ${formatCurrency(feeSummary.totalPaid)}`}
          color="amber"
          icon={CreditCard}
        />

        <GlassStat
          label="Recent Notices"
          value={announcements.length}
          sublabel="Targeted to your batch"
          color="cyan"
          icon={Bell}
        />
      </div>

      {/* Main Content Split: Courses & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Enrolled Courses & Batches */}
        <GlassPanel variant="default" className="p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">My Enrolled Batches</h3>
              <p className="text-xs text-slate-400 mt-0.5">Offline laboratory courses and schedules</p>
            </div>
            <Link to="/student/courses">
              <GlassButton variant="ghost" size="sm" className="text-xs text-indigo-300">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </GlassButton>
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                You are not currently enrolled in any active batch. Contact admissions desk.
              </div>
            ) : (
              enrollments.map((e) => (
                <div key={e.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{e.course?.title || 'Enrolled Course'}</h4>
                    <GlassBadge variant="success">Active Enrollment</GlassBadge>
                  </div>
                  <div className="text-xs text-indigo-300 font-mono">
                    Batch: {e.batch?.name || 'Assigned Batch'} {e.batch?.batchCode ? `(${e.batch.batchCode})` : ''}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Timing: {e.batch?.timing || 'Mon-Fri Offline Lab'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassPanel>

        {/* Section 2: Recent Published Results */}
        <GlassPanel variant="default" className="p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Recent Laboratory Results</h3>
              <p className="text-xs text-slate-400 mt-0.5">Verified and published practical test scores</p>
            </div>
            <Link to="/student/results">
              <GlassButton variant="ghost" size="sm" className="text-xs text-indigo-300">
                View History <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </GlassButton>
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {resultsLoading ? (
              <div className="h-32 w-full rounded-xl bg-white/[0.03] animate-pulse" />
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No examination results have been published for your profile yet.
              </div>
            ) : (
              results.slice(0, 3).map((res) => (
                <div key={res.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">{res.exam?.title || 'Laboratory Examination'}</h5>
                    <p className="text-[11px] text-slate-400">{res.exam?.subject || 'Technical'} • {formatDate(res.exam?.examDate)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-300 font-mono">
                      {res.marksObtained} <span className="text-slate-500 font-normal">/ {res.exam?.maxMarks || 100}</span>
                    </div>
                    <GlassBadge variant={res.percentage >= 75 ? 'success' : 'warning'} className="text-[10px] mt-1">
                      {res.percentage}%
                    </GlassBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Section 3: Priority Announcements */}
      <GlassPanel variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Academy Announcements</h3>
            <p className="text-xs text-slate-400 mt-0.5">Official notices targeted to you and your cohorts</p>
          </div>
          <Link to="/student/announcements">
            <GlassButton variant="ghost" size="sm" className="text-xs text-indigo-300">
              View All Notices
            </GlassButton>
          </Link>
        </div>

        <div className="space-y-3">
          {announcementsLoading ? (
            <div className="h-24 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          ) : announcements.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No active announcements.</div>
          ) : (
            announcements.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">{item.title}</h5>
                  <GlassBadge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'default'}>
                    {item.priority}
                  </GlassBadge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{item.body}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Posted on {formatDate(item.publishDate)}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default StudentDashboard;
