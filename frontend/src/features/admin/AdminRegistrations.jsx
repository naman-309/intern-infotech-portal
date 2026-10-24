import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
import { Check, X, Mail, Phone, Calendar, Search, Sparkles, Filter } from 'lucide-react';
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            IDENTITY VERIFICATION GATEWAY
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Registration Request Approvals</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve pending student admissions and teacher applications.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeTab === 'STUDENT'
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Requests
          </button>
          <button
            onClick={() => setActiveTab('TEACHER')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeTab === 'TEACHER'
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teacher Applications
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          placeholder={`Search ${activeTab.toLowerCase()} requests by name or email...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="p-6 h-28 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <GlassPanel className="p-16 text-center text-slate-400 text-xs font-mono">
          No pending {activeTab.toLowerCase()} registration requests matching your search.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GlassPanel glow="blue" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white tracking-tight">{req.fullName}</h3>
                      <GlassBadge variant={req.isEmailVerified ? 'success' : 'warning'}>
                        {req.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                      </GlassBadge>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Submitted: {formatDate(req.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-brand-cyan" /> {req.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-blue" /> {req.phone || 'No phone'}
                      </span>
                    </div>

                    {req.reviewNote && (
                      <div className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                        <span className="text-brand-cyan font-semibold font-mono">Applicant Profile:</span> {req.reviewNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <GlassButton
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedRequest(req);
                        setReviewAction('REJECT');
                        setReviewNote('');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </GlassButton>

                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedRequest(req);
                        setReviewAction('APPROVE');
                        setReviewNote('Approved by academy administration.');
                        setAssignedBatchId(batches[0]?.id || '');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Activate
                    </GlassButton>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* APPROVE / REJECT MODAL */}
      <GlassModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={reviewAction === 'APPROVE' ? `Approve ${activeTab} Registration` : `Reject ${activeTab} Request`}
        description={`Applicant: ${selectedRequest?.fullName} (${selectedRequest?.email})`}
      >
        <div className="space-y-4">
          {reviewAction === 'APPROVE' ? (
            <>
              {activeTab === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                    Assign to Batch (Optional)
                  </label>
                  <select
                    value={assignedBatchId}
                    onChange={(e) => setAssignedBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
                  >
                    <option value="">No immediate batch assignment</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.batchCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Approval Note</label>
                <input
                  placeholder="e.g. Offline admission verified and account activated."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Reason for Rejection (Included in rejection notification email)
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Offline admission records not found in institute enrollment list."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <GlassButton variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
              Cancel
            </GlassButton>
            <GlassButton
              size="sm"
              variant={reviewAction === 'APPROVE' ? 'primary' : 'danger'}
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
            >
              Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
