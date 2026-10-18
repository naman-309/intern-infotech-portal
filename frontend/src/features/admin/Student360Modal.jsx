import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  User,
  GraduationCap,
  CreditCard,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  Edit,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Receipt,
  Star,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export const Student360Modal = ({ isOpen, onClose, studentId, onStudentUpdated }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'fees' | 'academics' | 'edit'
  
  // Journey status update form state
  const [journeyForm, setJourneyForm] = useState({
    journeyStatus: 'ACTIVE',
    exitDate: '',
    dropOutReason: '',
  });

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    joiningDate: '',
  });

  // 1. Fetch Full Student 360 Details
  const { data: studentData, isLoading, refetch } = useQuery({
    queryKey: ['adminStudentDetail', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await api.get(`/students/${studentId}`);
      return res.data?.student || res.data?.data?.student || res.data || null;
    },
    enabled: !!studentId && isOpen,
  });

  const student = studentData;
  const profile = student?.studentProfile;
  const enrollments = profile?.enrollments || [];
  const feeRecords = profile?.feeRecords || [];
  const mockResults = profile?.mockResults || [];
  const examResults = profile?.examResults || [];

  // Populate form states when data loads
  useEffect(() => {
    if (student) {
      setJourneyForm({
        journeyStatus: profile?.journeyStatus || 'ACTIVE',
        exitDate: profile?.exitDate ? new Date(profile?.exitDate).toISOString().split('T')[0] : '',
        dropOutReason: profile?.dropOutReason || '',
      });

      setEditForm({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        rollNumber: profile?.rollNumber || '',
        guardianName: profile?.guardianName || '',
        guardianPhone: profile?.guardianPhone || '',
        address: profile?.address || '',
        joiningDate: profile?.joiningDate ? new Date(profile?.joiningDate).toISOString().split('T')[0] : '',
      });
    }
  }, [student, profile]);

  // Aggregate fee calculations
  const totalCourseFees = feeRecords.reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const totalPaid = feeRecords.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalDues = feeRecords.reduce((sum, f) => sum + (f.balanceAmount || 0), 0);

  // Collect all payments across all fee records
  const allPayments = feeRecords.flatMap((record) =>
    (record.payments || []).map((p) => ({
      ...p,
      courseTitle: record.course?.title || 'Course Fee',
      batchCode: record.batch?.batchCode || 'N/A',
    }))
  ).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  // Mock interview summary calculation
  const totalMocks = mockResults.length;
  const avgMockScore = totalMocks > 0
    ? (mockResults.reduce((acc, m) => acc + (m.marksObtained || 0), 0) / totalMocks).toFixed(1)
    : 'N/A';

  // 2. Mutation: Update Journey Status
  const journeyMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.patch(`/students/${studentId}/journey-status`, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.message || 'Student journey status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminStudentDetail', studentId] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      refetch();
      if (onStudentUpdated) onStudentUpdated();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update journey status');
    },
  });

  const handleJourneySubmit = (e) => {
    e.preventDefault();
    if (journeyForm.journeyStatus === 'DROPPED_OUT' && !journeyForm.dropOutReason.trim()) {
      toast.error('A drop out reason is mandatory when marking student as Dropped Out.');
      return;
    }
    journeyMutation.mutate({
      journeyStatus: journeyForm.journeyStatus,
      dropOutReason: journeyForm.journeyStatus === 'DROPPED_OUT' ? journeyForm.dropOutReason : null,
      exitDate: journeyForm.journeyStatus !== 'ACTIVE' ? (journeyForm.exitDate || new Date().toISOString()) : null,
    });
  };

  // 3. Mutation: Update Student Profile by Admin
  const editProfileMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.put(`/students/${studentId}`, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.message || 'Student profile saved successfully');
      queryClient.invalidateQueries({ queryKey: ['adminStudentDetail', studentId] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      refetch();
      setActiveTab('overview');
      if (onStudentUpdated) onStudentUpdated();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update student profile');
    },
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editProfileMutation.mutate(editForm);
  };

  const getJourneyBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Star className="w-3.5 h-3.5 fill-sky-300" /> Placed / Working
          </span>
        );
      case 'DROPPED_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Dropped Out
          </span>
        );
      case 'ACTIVE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active Student
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student 360° Comprehensive Profile"
      description="Holistic view of student lifecycle, academic progress, payment ledger, and management actions."
      maxWidth="max-w-5xl"
    >
      {isLoading || !student ? (
        <div className="space-y-4 py-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card: Identity & Core Details */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.firstName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {student.firstName?.[0]}
                    {student.lastName?.[0]}
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                    student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  title={`Account: ${student.status}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {student.firstName} {student.lastName}
                  </h3>
                  {getJourneyBadge(profile?.journeyStatus)}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {student.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {student.phone || 'No phone'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                    Enrollment: {profile?.enrollmentNumber || 'N/A'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Roll #{profile?.rollNumber || 'Not Assigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              {activeTab === 'edit' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs"
                >
                  Cancel Editing
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setActiveTab('edit')}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Joining Date</p>
                <p className="text-sm font-semibold text-white mt-0.5 font-mono">
                  {formatDate(profile?.joiningDate || profile?.createdAt || student.createdAt)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Fees / Dues</p>
                <p className="text-sm font-semibold text-white mt-0.5 font-mono">
                  {formatCurrency(totalPaid)}{' '}
                  <span className="text-[11px] text-slate-400 font-normal">/ {formatCurrency(totalCourseFees)}</span>
                </p>
                <p className="text-[10px] text-rose-400 font-mono">
                  {totalDues > 0 ? `Dues: ${formatCurrency(totalDues)}` : 'Fees Fully Cleared'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Mock Interview Avg</p>
                <p className="text-sm font-semibold text-white mt-0.5 font-mono">
                  {avgMockScore} <span className="text-[11px] text-slate-400 font-normal">/ 35.0</span>
                </p>
                <p className="text-[10px] text-brand-400">Across {totalMocks} evaluations</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Enrolled Batches</p>
                <p className="text-sm font-semibold text-white mt-0.5 font-mono">{enrollments.length} Active</p>
                <p className="text-[10px] text-emerald-400">Offline Laboratories</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <User className="w-3.5 h-3.5" /> 360° Profile & Journey
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'fees'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" /> Fee Ledger ({allPayments.length} Logs)
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'academics'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Mock Interviews ({totalMocks})
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50'
              }`}
            >
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          {/* TAB 1: 360 Overview & Journey Status */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Journey Status Management Section */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      Student Journey Lifecycle Management
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Track whether student is actively learning, successfully placed, or dropped out.
                    </p>
                  </div>
                  <div>{getJourneyBadge(profile?.journeyStatus)}</div>
                </div>

                <form onSubmit={handleJourneySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Journey Lifecycle Status
                      </label>
                      <select
                        value={journeyForm.journeyStatus}
                        onChange={(e) => setJourneyForm({ ...journeyForm, journeyStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ACTIVE">Active (Currently Attending Lectures & Labs)</option>
                        <option value="PLACED">Placed / Worked (Graduated & Employed)</option>
                        <option value="DROPPED_OUT">Dropped Out (Discontinued Training)</option>
                      </select>
                    </div>

                    {journeyForm.journeyStatus !== 'ACTIVE' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Exit / Placement Date
                        </label>
                        <Input
                          type="date"
                          value={journeyForm.exitDate}
                          onChange={(e) => setJourneyForm({ ...journeyForm, exitDate: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  {journeyForm.journeyStatus === 'DROPPED_OUT' && (
                    <div className="space-y-1.5 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                      <label className="block text-xs font-semibold text-rose-300">
                        Drop Out Reason <span className="text-rose-500 font-bold">*</span> (Mandatory)
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Detail why the student dropped out (e.g., personal issues, relocation, financial constraints, switched domain)..."
                        value={journeyForm.dropOutReason}
                        onChange={(e) => setJourneyForm({ ...journeyForm, dropOutReason: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-rose-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  )}

                  {profile?.journeyStatus === 'DROPPED_OUT' && profile?.dropOutReason && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                      <span className="font-semibold text-rose-300">Recorded Reason:</span>{' '}
                      <span className="text-slate-300">{profile.dropOutReason}</span>
                      {profile.exitDate && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          Exit Date: {formatDate(profile.exitDate)}
                        </div>
                      )}
                    </div>
                  )}

                  {profile?.journeyStatus === 'PLACED' && profile?.exitDate && (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sky-300">Placement Celebrated:</span>{' '}
                        <span className="text-slate-300">Student transitioned to industry!</span>
                      </div>
                      <div className="text-xs font-mono text-sky-400">
                        Date: {formatDate(profile.exitDate)}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={journeyMutation.isPending}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {journeyMutation.isPending ? 'Updating Status...' : 'Save Journey Status'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Personal & Academic Profile Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> Personal & Contact Info
                  </h5>
                  <div className="divide-y divide-slate-800/80 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-medium text-white">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-mono text-indigo-300">{student.email}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Phone Number</span>
                      <span className="font-mono text-slate-200">{student.phone || 'Not provided'}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Residential Address</span>
                      <span className="text-slate-200 text-right max-w-[200px] truncate">
                        {profile?.address || 'Not filled'}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Guardian Name</span>
                      <span className="text-slate-200">{profile?.guardianName || 'Not filled'}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Guardian Phone</span>
                      <span className="font-mono text-slate-200">{profile?.guardianPhone || 'Not filled'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Center Registration Details
                  </h5>
                  <div className="divide-y divide-slate-800/80 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Enrollment ID</span>
                      <span className="font-mono text-indigo-300 font-bold">
                        {profile?.enrollmentNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Roll Number</span>
                      <span className="font-mono text-white">{profile?.rollNumber || 'N/A'}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">First Course Joining Date</span>
                      <span className="font-mono text-slate-200">
                        {formatDate(profile?.joiningDate || profile?.createdAt)}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Portal Account Created</span>
                      <span className="font-mono text-slate-400">{formatDate(student.createdAt)}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Account Access Status</span>
                      <Badge variant={student.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Batches */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Enrolled Courses & Batches ({enrollments.length})
                </h5>
                {enrollments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No active course enrollments found for this student.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {enrollments.map((e) => (
                      <div key={e.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <h6 className="text-xs font-bold text-white">{e.course?.title}</h6>
                          <Badge variant="success">Active</Badge>
                        </div>
                        <p className="text-xs text-indigo-400 font-mono">
                          Batch: {e.batch?.name} ({e.batch?.batchCode})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Timing: {e.batch?.timing || 'Mon-Fri Offline Lab'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Fee Ledger & Payments */}
          {activeTab === 'fees' && (
            <div className="space-y-5">
              {/* Fee summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">Total Course Fees</p>
                  <h4 className="text-xl font-bold text-white font-mono mt-1">
                    {formatCurrency(totalCourseFees)}
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400">Total Paid Amount</p>
                  <h4 className="text-xl font-bold text-emerald-300 font-mono mt-1">
                    {formatCurrency(totalPaid)}
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <p className="text-xs text-rose-400">Total Balance Dues</p>
                  <h4 className="text-xl font-bold text-rose-300 font-mono mt-1">
                    {formatCurrency(totalDues)}
                  </h4>
                </div>
              </div>

              {/* Course-by-Course Fee Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                  Course Fee Ledgers
                </h5>
                {feeRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No fee records found for this student.</p>
                ) : (
                  <div className="space-y-3">
                    {feeRecords.map((fee) => (
                      <div
                        key={fee.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{fee.course?.title}</div>
                          <div className="text-slate-400 text-[11px] font-mono">
                            Batch: {fee.batch?.batchCode || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-mono text-white">
                              Paid: {formatCurrency(fee.paidAmount)} / {formatCurrency(fee.totalFee)}
                            </div>
                            <div className="text-[11px] font-mono text-rose-400">
                              Due: {formatCurrency(fee.balanceAmount)}
                            </div>
                          </div>
                          <Badge
                            variant={
                              fee.paymentStatus === 'PAID'
                                ? 'success'
                                : fee.paymentStatus === 'PARTIAL'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {fee.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Transaction Logs */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Payment Transaction History ({allPayments.length})
                  </h5>
                </div>
                {allPayments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No payment transactions logged for this student yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                        <tr>
                          <th className="p-3">Receipt #</th>
                          <th className="p-3">Course / Batch</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {allPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-mono text-indigo-300">
                              {payment.receiptNumber || 'RCP-N/A'}
                            </td>
                            <td className="p-3 text-slate-200">
                              {payment.courseTitle}{' '}
                              <span className="text-[10px] text-slate-400 font-mono">({payment.batchCode})</span>
                            </td>
                            <td className="p-3 font-mono text-slate-400">{formatDateTime(payment.paidAt)}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                                {payment.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {payment.remarks || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Academics & Mock Interviews */}
          {activeTab === 'academics' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Mock Interview Marks & Performance
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluated offline by mentors and senior faculty on a 35.0-mark standard scale.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white font-mono">{avgMockScore} / 35.0</div>
                  <div className="text-[11px] text-brand-400">Overall Average</div>
                </div>
              </div>

              {mockResults.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-900/60">
                  No mock interview scores recorded for this student yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                      <tr>
                        <th className="p-3">Interview Session</th>
                        <th className="p-3">Course / Batch</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Marks (Out of 35)</th>
                        <th className="p-3 text-center">Score %</th>
                        <th className="p-3">Feedback / Faculty Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {mockResults.map((result) => {
                        const mock = result.mockInterview;
                        return (
                          <tr key={result.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-white">
                              {mock?.title || 'Mock Technical Round'}
                            </td>
                            <td className="p-3 text-slate-300">
                              {mock?.course?.title || 'Core Syllabus'}{' '}
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({mock?.batch?.batchCode || 'General'})
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-400">
                              {formatDate(mock?.date || result.createdAt)}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-400">
                              {result.marksObtained} <span className="text-slate-500 text-xs font-normal">/ 35.0</span>
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                variant={
                                  result.percentage >= 75
                                    ? 'success'
                                    : result.percentage >= 50
                                    ? 'primary'
                                    : 'warning'
                                }
                              >
                                {result.percentage}%
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-300 text-[11px] max-w-xs">
                              {result.feedback || 'Evaluated successfully.'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Edit Profile by Admin */}
          {activeTab === 'edit' && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Admin Override: You can fill in or update missing student profile information on their behalf.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                  <Input
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                  <Input
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <Input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <Input
                    placeholder="e.g. R-2025-01"
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Course Joining Date</label>
                  <Input
                    type="date"
                    value={editForm.joiningDate}
                    onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian / Parent Name</label>
                  <Input
                    placeholder="Parent or Guardian Name"
                    value={editForm.guardianName}
                    onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Contact Phone</label>
                  <Input
                    placeholder="Parent or Guardian Phone"
                    value={editForm.guardianPhone}
                    onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    placeholder="Complete residential address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editProfileMutation.isPending}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {editProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};
