import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, UserX, UserCheck, Mail, Briefcase } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Faculty & Instructor Directory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage appointed instructors, teaching specializations, and active account privileges.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search instructors by name, email, or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : teachers.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No faculty instructors found matching your search.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Assigned Batches</th>
                <th className="p-4">Status</th>
                <th className="p-4 font-mono">Appointed</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {teachers.map((teacher) => {
                const profile = teacher.teacherProfile;
                const assignments = profile?.assignments || [];
                const isActive = teacher.status === 'ACTIVE';

                return (
                  <tr key={teacher.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {teacher.firstName} {teacher.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{teacher.email}</div>
                    </td>
                    <td className="p-4 font-mono text-indigo-300">
                      {profile?.employeeId || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-[11px]">
                      {profile?.specialization || 'Engineering Faculty'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {assignments.length > 0
                        ? assignments.map((a) => a.batch.batchCode).join(', ')
                        : 'No batch assigned'}
                    </td>
                    <td className="p-4">
                      <Badge variant={isActive ? 'success' : 'danger'}>
                        {teacher.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{formatDate(teacher.createdAt)}</td>
                    <td className="p-4 text-right">
                      {isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => statusMutation.mutate({ id: teacher.id, newStatus: 'INACTIVE' })}
                          className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => statusMutation.mutate({ id: teacher.id, newStatus: 'ACTIVE' })}
                          className="text-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
