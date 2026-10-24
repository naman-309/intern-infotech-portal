import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import {
  GlassPanel,
  GlassButton,
  GlassBadge,
  GlassModal,
} from '../../components/ui';
import { Check, X, FileCheck2, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const TeacherPendingRequests = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // 'APPROVE' or 'REJECT'
  const [reviewNote, setReviewNote] = useState('');
  const [assignedBatchId, setAssignedBatchId] = useState('');

  // 1. Fetch Student Registration Requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['teacherPendingRequests'],
    queryFn: () => api.get('/registrations?status=PENDING&role=STUDENT'),
  });

  // 2. Fetch Teacher Batches (for assigning upon approval)
  const { data: batchesData } = useQuery({
    queryKey: ['teacherBatches'],
    queryFn: () => api.get('/batches'),
  });

  const requests = requestsData?.data || [];
  const batches = batchesData?.data || [];

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/registrations/${selectedRequest.id}/review`, {
        action: reviewAction,
        reviewNote,
        assignedBatchId: reviewAction === 'APPROVE' ? assignedBatchId || undefined : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherPendingRequests'] });
      toast.success(
        reviewAction === 'APPROVE'
          ? 'Student registration approved and portal account activated!'
          : 'Registration request rejected.'
      );
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewNote('');
      setAssignedBatchId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to complete review');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Review Student Registration Requests</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review admissions submitted by students with offline registration verification.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
      ) : requests.length === 0 ? (
        <GlassPanel className="p-12 text-center text-slate-400 text-xs">
          No pending student admission requests awaiting review.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <GlassPanel key={req.id} variant="default" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{req.fullName}</h3>
                  <GlassBadge variant={req.isEmailVerified ? 'success' : 'warning'}>
                    {req.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                  </GlassBadge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> {req.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" /> {req.phone || 'No phone'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Submitted: {formatDate(req.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(req);
                    setReviewAction('APPROVE');
                  }}
                  className="gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve Admission
                </GlassButton>
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(req);
                    setReviewAction('REJECT');
                  }}
                  className="gap-1.5"
                >
                  <X className="w-4 h-4" /> Reject
                </GlassButton>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <GlassModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={reviewAction === 'APPROVE' ? 'Approve Student Admission' : 'Reject Registration Request'}
          description={`Applicant: ${selectedRequest.fullName} (${selectedRequest.email})`}
        >
          <div className="space-y-4">
            {reviewAction === 'APPROVE' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assign to Offline Laboratory Batch (Optional)
                </label>
                <select
                  value={assignedBatchId}
                  onChange={(e) => setAssignedBatchId(e.target.value)}
                  className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Do not assign batch immediately</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.batchCode}) - {b.course?.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Review Notes / Remarks</label>
              <textarea
                rows={3}
                placeholder="Internal verification notes or reason for approval/rejection..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <GlassButton variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Cancel
              </GlassButton>
              <GlassButton
                variant={reviewAction === 'APPROVE' ? 'primary' : 'danger'}
                size="sm"
                isLoading={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
              >
                Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};

export default TeacherPendingRequests;
