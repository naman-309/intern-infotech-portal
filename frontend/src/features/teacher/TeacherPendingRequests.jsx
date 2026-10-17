import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
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
        <Skeleton className="h-64 w-full" />
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No pending student admission requests awaiting review.
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{req.fullName}</h3>
                  <Badge variant={req.isEmailVerified ? 'success' : 'warning'}>
                    {req.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                  </Badge>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(req);
                    setReviewAction('REJECT');
                    setReviewNote('');
                  }}
                  className="gap-1.5 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </Button>

                <Button
                  size="sm"
                  variant="success"
                  onClick={() => {
                    setSelectedRequest(req);
                    setReviewAction('APPROVE');
                    setReviewNote('Offline admission verified.');
                    setAssignedBatchId(batches[0]?.id || '');
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Approve & Activate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REVIEW CONFIRMATION MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={reviewAction === 'APPROVE' ? 'Approve Student Registration' : 'Reject Registration Request'}
          description={`Student: ${selectedRequest.fullName} (${selectedRequest.email})`}
        >
          <div className="space-y-4">
            {reviewAction === 'APPROVE' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assign to Initial Batch (Optional)
                  </label>
                  <Select value={assignedBatchId} onChange={(e) => setAssignedBatchId(e.target.value)}>
                    <option value="">No immediate batch assignment</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.batchCode})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Approval Note</label>
                  <Input
                    placeholder="e.g. Offline fee verified, enrolled into morning cohort."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Rejection (Included in student notification email)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Offline admission enrollment record not found in electronic registry."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={reviewAction === 'APPROVE' ? 'success' : 'danger'}
                isLoading={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
              >
                Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
