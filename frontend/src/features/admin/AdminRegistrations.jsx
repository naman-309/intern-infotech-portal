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
import { Check, X, Mail, Phone, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';

export const AdminRegistrations = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' or 'TEACHER'
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [assignedBatchId, setAssignedBatchId] = useState('');

  // 1. Fetch Requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['adminRegistrations', activeTab, search],
    queryFn: () => api.get(`/registrations?status=PENDING&role=${activeTab}&search=${search}`),
  });

  // 2. Fetch Batches (for assigning upon student approval)
  const { data: batchesData } = useQuery({
    queryKey: ['allBatches'],
    queryFn: () => api.get('/batches'),
    enabled: activeTab === 'STUDENT',
  });

  const requests = requestsData?.data || [];
  const batches = batchesData?.data || [];

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/registrations/${selectedRequest.id}/review`, {
        action: reviewAction,
        reviewNote,
        assignedBatchId: reviewAction === 'APPROVE' && activeTab === 'STUDENT' ? assignedBatchId || undefined : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['adminStudentsCount'] });
      queryClient.invalidateQueries({ queryKey: ['adminTeachersCount'] });
      toast.success(
        reviewAction === 'APPROVE'
          ? `${activeTab} registration approved and portal account activated!`
          : 'Registration request rejected.'
      );
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewNote('');
      setAssignedBatchId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Review action failed');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Registration Request Approvals</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve pending student admissions and teacher applications.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'STUDENT'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Requests
          </button>
          <button
            onClick={() => setActiveTab('TEACHER')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'TEACHER'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teacher Applications
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder={`Search ${activeTab.toLowerCase()} requests by name or email...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No pending {activeTab.toLowerCase()} registration requests matching your search.
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{req.fullName}</h3>
                  <Badge variant={req.isEmailVerified ? 'success' : 'warning'}>
                    {req.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                  </Badge>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Submitted: {formatDate(req.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> {req.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" /> {req.phone || 'No phone'}
                  </span>
                </div>

                {req.reviewNote && (
                  <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-indigo-400 font-semibold font-mono">Applicant Profile:</span> {req.reviewNote}
                  </div>
                )}
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
                    setReviewNote('Approved by academy administration.');
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

      {/* APPROVE / REJECT MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={reviewAction === 'APPROVE' ? `Approve ${activeTab} Registration` : `Reject ${activeTab} Request`}
          description={`Applicant: ${selectedRequest.fullName} (${selectedRequest.email})`}
        >
          <div className="space-y-4">
            {reviewAction === 'APPROVE' ? (
              <>
                {activeTab === 'STUDENT' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Assign to Batch (Optional)
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
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Approval Note</label>
                  <Input
                    placeholder="e.g. Offline admission verified and account activated."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Rejection (Included in rejection notification email)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Offline admission records not found in institute enrollment list."
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
