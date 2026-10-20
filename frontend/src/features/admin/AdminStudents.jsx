import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Student360Modal } from './Student360Modal';
import {
  GraduationCap,
  ShieldCheck,
  UserX,
  UserCheck,
  Search,
  Mail,
  Phone,
  Eye,
  Star,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminStudents = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [journeyFilter, setJourneyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Student 360 View modal state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  // 1. Debounce search input by 500ms to eliminate excessive API calls on keystrokes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 2. Fetch Students using debounced search and active filters
  const { data: studentsData, isLoading, isFetching } = useQuery({
    queryKey: ['adminStudents', debouncedSearch, journeyFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (journeyFilter) params.append('journeyStatus', journeyFilter);
      if (statusFilter) params.append('status', statusFilter);
      return await api.get(`/students?${params.toString()}`);
    },
  });

  const students = studentsData?.data || [];

  // 3. User status mutation (Active / Inactive)
  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      await api.patch(`/users/${id}/status`, { status: newStatus });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success(`Student account status changed to ${variables.newStatus}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update student status');
    },
  });

  const handleOpen360 = (studentId) => {
    setSelectedStudentId(studentId);
    setIs360ModalOpen(true);
  };

  const getJourneyBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Star className="w-3 h-3 fill-sky-300" /> Placed / Worked
          </span>
        );
      case 'DROPPED_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Dropped Out
          </span>
        );
      case 'ACTIVE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
            Student Management & 360° Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fast sub-300ms indexed search, complete lifecycle tracking (Active / Placed / Dropped Out), and 360° academic & fee details.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Debounced Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search student name, email, roll #, or enrollment ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-9 text-xs bg-slate-950 border-slate-800"
            />
            {searchInput ? (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : isFetching ? (
              <Loader2 className="absolute right-3 top-3 w-3.5 h-3.5 text-indigo-400 animate-spin" />
            ) : null}
          </div>

          {/* Account Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Account:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Accounts</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Deactivated Accounts</option>
            </select>
          </div>
        </div>

        {/* Journey Lifecycle Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/60">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Journey:
          </span>
          <button
            onClick={() => setJourneyFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${journeyFilter === ''
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setJourneyFilter('ACTIVE')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${journeyFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/30 border border-slate-800'
              }`}
          >
            Active Students
          </button>
          <button
            onClick={() => setJourneyFilter('PLACED')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${journeyFilter === 'PLACED'
                ? 'bg-sky-600 text-white font-semibold'
                : 'bg-slate-950 text-sky-400 hover:bg-sky-950/30 border border-slate-800'
              }`}
          >
            Placed / Worked
          </button>
          <button
            onClick={() => setJourneyFilter('DROPPED_OUT')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${journeyFilter === 'DROPPED_OUT'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-950 text-rose-400 hover:bg-rose-950/30 border border-slate-800'
              }`}
          >
            Dropped Out
          </button>
        </div>
      </div>

      {/* Directory Table */}
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : students.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No students found matching your criteria.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Enrollment ID</th>
                <th className="p-4">Roll #</th>
                <th className="p-4">Journey Status</th>
                <th className="p-4">Enrolled Batches</th>
                <th className="p-4">First Joining Date</th>
                <th className="p-4">Account</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {students.map((student) => {
                const profile = student.studentProfile;
                const enrollments = profile?.enrollments || [];
                const isActive = student.status === 'ACTIVE';

                return (
                  <tr
                    key={student.id}
                    onClick={() => handleOpen360(student.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-indigo-300 font-medium">
                      {profile?.enrollmentNumber || 'N/A'}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {profile?.rollNumber || 'Not set'}
                    </td>
                    <td className="p-4">
                      {getJourneyBadge(profile?.journeyStatus)}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      {enrollments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {enrollments.map((e) => (
                            <span
                              key={e.id}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60 text-[10px]"
                            >
                              {e.batch.batchCode}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">No active batch</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {formatDate(profile?.joiningDate || profile?.createdAt || student.createdAt)}
                    </td>
                    <td className="p-4">
                      <Badge variant={isActive ? 'success' : 'danger'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpen360(student.id)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Student 360°
                        </Button>
                        {isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => statusMutation.mutate({ id: student.id, newStatus: 'INACTIVE' })}
                            className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => statusMutation.mutate({ id: student.id, newStatus: 'ACTIVE' })}
                            className="text-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Student 360 Comprehensive Modal */}
      <Student360Modal
        isOpen={is360ModalOpen}
        onClose={() => {
          setIs360ModalOpen(false);
          setSelectedStudentId(null);
        }}
        studentId={selectedStudentId}
        onStudentUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
        }}
      />
    </div>
  );
};
