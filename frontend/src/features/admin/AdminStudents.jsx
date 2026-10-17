import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { GraduationCap, ShieldCheck, UserX, UserCheck, Search, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const AdminStudents = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Directory & Account Lifecycle</h2>
          <p className="text-xs text-slate-400 mt-1">
            Search enrolled students, view academic profiles, and manage active/deactivated account status.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by student name, email, or enrollment number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : students.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No students found matching your search.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Enrollment #</th>
                <th className="p-4">Roll #</th>
                <th className="p-4">Enrolled Batches</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {students.map((student) => {
                const profile = student.studentProfile;
                const enrollments = profile?.enrollments || [];
                const isActive = student.status === 'ACTIVE';

                return (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                    </td>
                    <td className="p-4 font-mono text-indigo-300">
                      {profile?.enrollmentNumber || 'N/A'}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {profile?.rollNumber || 'N/A'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {enrollments.length > 0
                        ? enrollments.map((e) => e.batch.batchCode).join(', ')
                        : 'No batch'}
                    </td>
                    <td className="p-4">
                      <Badge variant={isActive ? 'success' : 'danger'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{formatDate(student.createdAt)}</td>
                    <td className="p-4 text-right">
                      {isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => statusMutation.mutate({ id: student.id, newStatus: 'INACTIVE' })}
                          className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => statusMutation.mutate({ id: student.id, newStatus: 'ACTIVE' })}
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
