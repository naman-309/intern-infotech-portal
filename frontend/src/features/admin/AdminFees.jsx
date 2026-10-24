import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
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
import { CreditCard, Edit3, CheckCircle2, Clock, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AdminFees = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [notes, setNotes] = useState('');

  const { data: feesData, isLoading } = useQuery({
    queryKey: ['adminFees', search],
    queryFn: () => api.get(`/fees?search=${search}`),
  });

  const feeRecords = feesData?.data || [];

  const handleOpenEdit = (fee) => {
    setSelectedFee(fee);
    setPaidAmount(fee.paidAmount);
    setPaymentStatus(fee.paymentStatus);
    setNotes(fee.notes || '');
  };

  const updateFeeMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/fees/${selectedFee.id}`, {
        paidAmount: parseFloat(paidAmount) || 0,
        paymentStatus,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFees'] });
      toast.success('Fee record updated successfully');
      setSelectedFee(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update fee record');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-emerald-500/25 text-[11px] font-mono tracking-wider text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            TUITION ACCOUNTS
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Tuition & Fee Administration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track student fee balances, log offline receipt installments, and update payment status.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          placeholder="Search by student name or email..."
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
              <GlassTableHead>Program & Batch</GlassTableHead>
              <GlassTableHead>Total Tuition</GlassTableHead>
              <GlassTableHead>Paid to Date</GlassTableHead>
              <GlassTableHead>Outstanding Balance</GlassTableHead>
              <GlassTableHead>Status</GlassTableHead>
              <GlassTableHead className="text-right">Actions</GlassTableHead>
            </GlassTableRow>
          </GlassTableHeader>
          <GlassTableBody>
            {isLoading ? (
              <GlassTableLoading colSpan={7} rows={4} />
            ) : feeRecords.length === 0 ? (
              <GlassTableEmpty message="No fee records found matching your query." colSpan={7} />
            ) : (
              feeRecords.map((fee) => (
                <GlassTableRow key={fee.id}>
                  <GlassTableCell>
                    <div className="font-bold text-white tracking-tight">
                      {fee.student.user?.firstName} {fee.student.user?.lastName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{fee.student.user?.email}</div>
                  </GlassTableCell>
                  <GlassTableCell>
                    <div className="text-white font-medium">{fee.course.title}</div>
                    <div className="text-[11px] text-brand-cyan font-mono">{fee.batch.name}</div>
                  </GlassTableCell>
                  <GlassTableCell className="font-bold text-white font-mono">{formatCurrency(fee.totalFee)}</GlassTableCell>
                  <GlassTableCell className="font-bold text-emerald-400 font-mono">{formatCurrency(fee.paidAmount)}</GlassTableCell>
                  <GlassTableCell className="font-bold text-amber-400 font-mono">{formatCurrency(fee.balanceAmount)}</GlassTableCell>
                  <GlassTableCell>
                    <GlassBadge variant={fee.paymentStatus === 'PAID' ? 'success' : fee.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}>
                      {fee.paymentStatus}
                    </GlassBadge>
                  </GlassTableCell>
                  <GlassTableCell className="text-right">
                    <GlassButton size="sm" variant="secondary" onClick={() => handleOpenEdit(fee)} className="text-xs gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Log Payment
                    </GlassButton>
                  </GlassTableCell>
                </GlassTableRow>
              ))
            )}
          </GlassTableBody>
        </GlassTable>
      </GlassPanel>

      {/* UPDATE PAYMENT MODAL */}
      {selectedFee && (
        <GlassModal
          isOpen={!!selectedFee}
          onClose={() => setSelectedFee(null)}
          title={`Log Fee Payment: ${selectedFee.student?.user?.firstName} ${selectedFee.student?.user?.lastName}`}
          description={`Program: ${selectedFee.course?.title} • Total Tuition: ${formatCurrency(selectedFee.totalFee)}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Total Paid Amount (INR)</label>
              <input
                type="number"
                placeholder="Amount received"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-blue/50 font-mono"
              >
                <option value="PENDING">Pending (No payment received)</option>
                <option value="PARTIAL">Partial (Installment in progress)</option>
                <option value="PAID">Paid in Full</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Accounting / Receipt Note</label>
              <textarea
                rows={3}
                placeholder="e.g. Offline DD #4892 received at front desk."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setSelectedFee(null)}>
                Cancel
              </GlassButton>
              <GlassButton size="sm" variant="primary" disabled={updateFeeMutation.isPending} onClick={() => updateFeeMutation.mutate()}>
                Save Payment Record
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
