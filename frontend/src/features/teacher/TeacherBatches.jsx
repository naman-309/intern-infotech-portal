import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  GlassPanel,
  GlassBadge,
  GlassButton,
  GlassModal,
} from '../../components/ui';
import { Calendar, Users, Clock, Mail, Phone } from 'lucide-react';

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
        <div className="h-64 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
      ) : batches.length === 0 ? (
        <GlassPanel className="p-12 text-center text-slate-400 text-xs">
          No batches assigned to your instructor profile.
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <GlassPanel key={batch.id} variant="default" className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{batch.name}</h3>
                  <GlassBadge variant="primary">{batch.batchCode}</GlassBadge>
                </div>

                <div className="text-xs text-indigo-300 font-medium">{batch.course?.title}</div>

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

              <div className="pt-6 border-t border-white/10 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Status: {batch.status}</span>
                <GlassButton size="sm" variant="secondary" onClick={() => setSelectedBatchId(batch.id)}>
                  View Student Roster
                </GlassButton>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* ROSTER MODAL */}
      {selectedBatchId && (
        <GlassModal
          isOpen={!!selectedBatchId}
          onClose={() => setSelectedBatchId(null)}
          title={`Batch Roster: ${selectedBatch?.name || 'Loading...'}`}
          description={`${selectedBatch?.course?.title || ''} • Code: ${selectedBatch?.batchCode || ''}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {rosterLoading ? (
              <div className="h-48 w-full rounded-xl bg-white/[0.03] animate-pulse" />
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No students enrolled in this batch yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-white">
                        {enr.student?.user?.name || `${enr.student?.user?.firstName || ''} ${enr.student?.user?.lastName || ''}`.trim()}
                      </h5>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Roll #{enr.student?.rollNumber || 'N/A'} • {enr.student?.enrollmentNumber}
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400 font-mono">
                      <div>{enr.student?.user?.email}</div>
                      <div className="text-slate-500">{enr.student?.user?.phone || 'No phone'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <GlassButton variant="outline" size="sm" onClick={() => setSelectedBatchId(null)}>
                Close Roster
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};

export default TeacherBatches;
