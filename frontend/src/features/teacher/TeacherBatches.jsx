import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Calendar, Users, Clock, Mail, Phone, ExternalLink } from 'lucide-react';

export const TeacherBatches = () => {
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // 1. Fetch Assigned Batches
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['teacherBatches'],
    queryFn: () => api.get('/batches'),
  });

  // 2. Fetch Selected Batch Details with Roster
  const { data: batchDetailData, isLoading: rosterLoading } = useQuery({
    queryKey: ['batchRoster', selectedBatchId],
    queryFn: () => api.get(`/batches/${selectedBatchId}`),
    enabled: !!selectedBatchId,
  });

  const batches = batchesData?.data || [];
  const selectedBatch = batchDetailData?.data?.batch;
  const enrollments = selectedBatch?.enrollments || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Assigned Batches & Student Rosters</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review batch schedules and view enrolled student contact details.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : batches.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No batches assigned to your instructor profile.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <Card key={batch.id} className="p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{batch.name}</h3>
                  <Badge variant="primary">{batch.batchCode}</Badge>
                </div>

                <div className="text-xs text-indigo-300 font-medium">{batch.course.title}</div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Timing: {batch.timing || 'Mon-Fri Offline Lab'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Starts: {formatDate(batch.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Enrolled: {batch._count?.enrollments || 0} / Capacity {batch.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Status: {batch.status}</span>
                <Button size="sm" variant="outline" onClick={() => setSelectedBatchId(batch.id)}>
                  View Student Roster
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ROSTER MODAL */}
      {selectedBatchId && (
        <Modal
          isOpen={!!selectedBatchId}
          onClose={() => setSelectedBatchId(null)}
          title={`Batch Roster: ${selectedBatch?.name || 'Loading...'}`}
          description={`${selectedBatch?.course?.title || ''} • Code: ${selectedBatch?.batchCode || ''}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {rosterLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No students enrolled in this batch yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {enrollments.map((enr) => (
                  <div key={enr.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-white">
                        {enr.student.user?.firstName} {enr.student.user?.lastName}
                      </h5>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Roll #{enr.student.rollNumber || 'N/A'} • {enr.student.enrollmentNumber}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <div>{enr.student.user?.email}</div>
                      <div>{enr.student.user?.phone || 'No phone'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedBatchId(null)}>
                Close Roster
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
