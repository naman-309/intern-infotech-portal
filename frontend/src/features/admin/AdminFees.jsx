import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, Edit3, CheckCircle2, Clock } from 'lucide-react';
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Tuition & Fee Administration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track student fee balances, log offline receipt installments, and update payment status.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : feeRecords.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No fee records found matching your query.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Program & Batch</th>
                <th className="p-4">Total Tuition</th>
                <th className="p-4">Paid to Date</th>
                <th className="p-4">Outstanding Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {feeRecords.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white font-sans">
                      {fee.student.user?.firstName} {fee.student.user?.lastName}
                    </div>
                    <div className="text-[11px] text-slate-400">{fee.student.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-sans">{fee.course.title}</div>
                    <div className="text-[11px] text-indigo-400">{fee.batch.name}</div>
                  </td>
                  <td className="p-4 font-bold text-white">{formatCurrency(fee.totalFee)}</td>
                  <td className="p-4 font-bold text-emerald-400">{formatCurrency(fee.paidAmount)}</td>
                  <td className="p-4 font-bold text-amber-400">{formatCurrency(fee.balanceAmount)}</td>
                  <td className="p-4">
                    <Badge variant={fee.paymentStatus === 'PAID' ? 'success' : fee.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}>
                      {fee.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenEdit(fee)} className="text-xs gap-1.5 font-sans">
                      <Edit3 className="w-3.5 h-3.5" /> Log Payment
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* UPDATE PAYMENT MODAL */}
      {selectedFee && (
        <Modal
          isOpen={!!selectedFee}
          onClose={() => setSelectedFee(null)}
          title={`Log Fee Payment: ${selectedFee.student?.user?.firstName} ${selectedFee.student?.user?.lastName}`}
          description={`Program: ${selectedFee.course?.title} • Total Tuition: ${formatCurrency(selectedFee.totalFee)}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Paid Amount (INR)</label>
              <Input
                type="number"
                placeholder="Amount received"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Status</label>
              <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="PENDING">Pending (No payment received)</option>
                <option value="PARTIAL">Partial (Installment in progress)</option>
                <option value="PAID">Paid in Full</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Accounting / Receipt Note</label>
              <textarea
                rows={3}
                placeholder="e.g. Offline DD #4892 received at front desk."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedFee(null)}>
                Cancel
              </Button>
              <Button size="sm" isLoading={updateFeeMutation.isPending} onClick={() => updateFeeMutation.mutate()}>
                Save Payment Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
