import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import {
  GlassTable,
  GlassTableHeader,
  GlassTableHead,
  GlassTableBody,
  GlassTableRow,
  GlassTableCell,
  GlassTableEmpty,
  GlassTableLoading,
} from '../../components/ui/GlassTable';
import { GraduationCap, ShieldCheck, UserX, UserCheck, Search, Sparkles, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Student360Modal } from './Student360Modal';

export const AdminStudents = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  // Fetch Students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['adminStudents', search],
    queryFn: () => api.get(`/students?search=${search}`),
  });

  const students = studentsData?.data || [];

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ACADEMIC STUDENT ENROLLMENTS
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Student Directory & Account Lifecycle</h2>
          <p className="text-xs text-slate-400 mt-1">
            Search enrolled students, view academic profiles, and manage active/deactivated account status.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          placeholder="Search by student name, email, or enrollment number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
        />
      </div>

      <GlassPanel glow="cyan" className="overflow-hidden p-0">
        <GlassTable>
          <GlassTableHeader>
            <GlassTableRow isHeader>
              <GlassTableHead>Student</GlassTableHead>
              <GlassTableHead>Enrollment #</GlassTableHead>
              <GlassTableHead>Roll #</GlassTableHead>
              <GlassTableHead>Enrolled Batches</GlassTableHead>
              <GlassTableHead>Status</GlassTableHead>
              <GlassTableHead>Joined Date</GlassTableHead>
              <GlassTableHead className="text-right">Lifecycle Actions</GlassTableHead>
            </GlassTableRow>
          </GlassTableHeader>
          <GlassTableBody>
            {isLoading ? (
              <GlassTableLoading colSpan={7} rows={4} />
            ) : students.length === 0 ? (
              <GlassTableEmpty message="No students found matching your search." colSpan={7} />
            ) : (
              students.map((student) => {
                const profile = student.studentProfile;
                const enrollments = profile?.enrollments || [];
                const isActive = student.status === 'ACTIVE';

                return (
                  <GlassTableRow key={student.id}>
                    <GlassTableCell>
                      <div className="font-bold text-white tracking-tight">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[11px] text-brand-cyan/80 font-mono">{student.email}</div>
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-brand-cyan">
                      {profile?.enrollmentNumber || 'N/A'}
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-slate-300">
                      {profile?.rollNumber || 'N/A'}
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-[11px] text-slate-400">
                      {enrollments.length > 0
                        ? enrollments.map((e) => e.batch.batchCode).join(', ')
                        : 'No batch'}
                    </GlassTableCell>
                    <GlassTableCell>
                      <GlassBadge variant={isActive ? 'success' : 'danger'}>
                        {student.status}
                      </GlassBadge>
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-slate-400">{formatDate(student.createdAt)}</GlassTableCell>
                    <GlassTableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <GlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setIs360ModalOpen(true);
                          }}
                          className="text-xs text-sky-400 hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View 360
                        </GlassButton>
                        {isActive ? (
                          <GlassButton
                            size="sm"
                            variant="danger"
                            onClick={() => statusMutation.mutate({ id: student.id, newStatus: 'INACTIVE' })}
                            className="text-xs"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                          </GlassButton>
                        ) : (
                          <GlassButton
                            size="sm"
                            variant="primary"
                            onClick={() => statusMutation.mutate({ id: student.id, newStatus: 'ACTIVE' })}
                            className="text-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate
                          </GlassButton>
                        )}
                      </div>
                    </GlassTableCell>
                  </GlassTableRow>
                );
              })
            )}
          </GlassTableBody>
        </GlassTable>
      </GlassPanel>

      <Student360Modal
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
        studentId={selectedStudentId}
        onStudentUpdated={() => queryClient.invalidateQueries({ queryKey: ['adminStudents'] })}
      />
    </div>
  );
};
