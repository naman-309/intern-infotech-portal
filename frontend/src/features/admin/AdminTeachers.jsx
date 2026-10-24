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
import { Users, UserX, UserCheck, Mail, Briefcase, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AdminTeachers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['adminTeachers', search],
    queryFn: () => api.get(`/teachers?search=${search}`),
  });

  const teachers = teachersData?.data || [];

  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      await api.patch(`/users/${id}/status`, { status: newStatus });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      toast.success(`Faculty status updated to ${variables.newStatus}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update faculty status');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-violet/25 text-[11px] font-mono tracking-wider text-brand-violet mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            FACULTY MANAGEMENT
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Faculty & Instructor Directory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage appointed instructors, teaching specializations, and active account privileges.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          placeholder="Search instructors by name, email, or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 focus:ring-1 focus:ring-brand-violet/50 transition-all font-mono"
        />
      </div>

      <GlassPanel glow="violet" className="overflow-hidden p-0">
        <GlassTable>
          <GlassTableHeader>
            <GlassTableRow isHeader>
              <GlassTableHead>Faculty Member</GlassTableHead>
              <GlassTableHead>Employee ID</GlassTableHead>
              <GlassTableHead>Specialization</GlassTableHead>
              <GlassTableHead>Assigned Batches</GlassTableHead>
              <GlassTableHead>Status</GlassTableHead>
              <GlassTableHead>Appointed</GlassTableHead>
              <GlassTableHead className="text-right">Actions</GlassTableHead>
            </GlassTableRow>
          </GlassTableHeader>
          <GlassTableBody>
            {isLoading ? (
              <GlassTableLoading colSpan={7} rows={4} />
            ) : teachers.length === 0 ? (
              <GlassTableEmpty message="No faculty instructors found matching your search." colSpan={7} />
            ) : (
              teachers.map((teacher) => {
                const profile = teacher.teacherProfile;
                const assignments = profile?.assignments || [];
                const isActive = teacher.status === 'ACTIVE';

                return (
                  <GlassTableRow key={teacher.id}>
                    <GlassTableCell>
                      <div className="font-bold text-white tracking-tight">
                        {teacher.firstName} {teacher.lastName}
                      </div>
                      <div className="text-[11px] text-brand-violet/80 font-mono">{teacher.email}</div>
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-brand-cyan">
                      {profile?.employeeId || 'N/A'}
                    </GlassTableCell>
                    <GlassTableCell className="text-slate-300 font-mono text-[11px]">
                      {profile?.specialization || 'Engineering Faculty'}
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-[11px] text-slate-400">
                      {assignments.length > 0
                        ? assignments.map((a) => a.batch.batchCode).join(', ')
                        : 'No batch assigned'}
                    </GlassTableCell>
                    <GlassTableCell>
                      <GlassBadge variant={isActive ? 'success' : 'danger'}>
                        {teacher.status}
                      </GlassBadge>
                    </GlassTableCell>
                    <GlassTableCell className="font-mono text-slate-400">{formatDate(teacher.createdAt)}</GlassTableCell>
                    <GlassTableCell className="text-right">
                      {isActive ? (
                        <GlassButton
                          size="sm"
                          variant="danger"
                          onClick={() => statusMutation.mutate({ id: teacher.id, newStatus: 'INACTIVE' })}
                          className="text-xs"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                        </GlassButton>
                      ) : (
                        <GlassButton
                          size="sm"
                          variant="primary"
                          onClick={() => statusMutation.mutate({ id: teacher.id, newStatus: 'ACTIVE' })}
                          className="text-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate
                        </GlassButton>
                      )}
                    </GlassTableCell>
                  </GlassTableRow>
                );
              })
            )}
          </GlassTableBody>
        </GlassTable>
      </GlassPanel>
    </div>
  );
};
