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
import {
  CreditCard,
  Edit3,
  CheckCircle2,
  Clock,
  PlusCircle,
  Receipt,
  History,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminFees = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);

  // New Payment Form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  const { data: feesData, isLoading } = useQuery({
    queryKey: ['adminFees', search],
    queryFn: () => api.get(`/fees?search=${search}`),
  });

  const feeRecords = feesData?.data || [];

  const handleOpenPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount('');
    setPaymentMethod('UPI');
    setTransactionRef('');
    setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`);
    setPaymentRemarks('');
  };

  // Record Payment Installment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid payment amount greater than 0');
      }

      return api.post(`/fees/${selectedFee.id}/payments`, {
        amount,
        paymentMethod,
        transactionRef: transactionRef || undefined,
        receiptNumber: receiptNumber || undefined,
        remarks: paymentRemarks || undefined,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminFees'] });
      toast.success(
        `Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded! Student email sent via Redis queue.`
      );
      // Update local selectedFee with the latest response data
      if (res?.data?.feeRecord) {
        setSelectedFee(res.data.feeRecord);
      } else {
        setSelectedFee(null);
      }
      setPaymentAmount('');
      setTransactionRef('');
      setPaymentRemarks('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to record payment');
    },
  });

  // Calculate live preview
  const numPaymentAmount = parseFloat(paymentAmount) || 0;
  const previewPaid = selectedFee ? selectedFee.paidAmount + numPaymentAmount : 0;
  const previewRemaining = selectedFee ? Math.max(0, selectedFee.totalFee - previewPaid) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Tuition & Fee Administration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track student fee balances, record partial installments with full payment history, and automatically notify students.
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
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Program & Batch</th>
                <th className="p-4">Total Fee</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4">Remaining Dues</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Installments</th>
                <th className="p-4 text-right">Action</th>
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
                    <div className="text-[11px] text-brand-400 font-mono">{fee.batch.name}</div>
                  </td>
                  <td className="p-4 font-bold text-white">{formatCurrency(fee.totalFee)}</td>
                  <td className="p-4 font-bold text-emerald-400">{formatCurrency(fee.paidAmount)}</td>
                  <td className="p-4 font-bold text-amber-400">{formatCurrency(fee.balanceAmount)}</td>
                  <td className="p-4">
                    <Badge variant={fee.paymentStatus === 'PAID' ? 'success' : fee.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}>
                      {fee.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                      {fee.payments?.length || 0} logged
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenPaymentModal(fee)}
                      className="text-xs gap-1.5 font-sans bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Payment
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RECORD PAYMENT & TRANSACTION LEDGER MODAL */}
      {selectedFee && (
        <Modal
          isOpen={!!selectedFee}
          onClose={() => setSelectedFee(null)}
          title={`Fee Account: ${selectedFee.student?.user?.firstName} ${selectedFee.student?.user?.lastName}`}
          description={`${selectedFee.course?.title} • Batch: ${selectedFee.batch?.name}`}
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Financial Calculations Summary */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Total Fee</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {formatCurrency(selectedFee.totalFee)}
                </div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-[10px] text-emerald-400 uppercase font-mono">Total Paid</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(selectedFee.paidAmount)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-amber-400 uppercase font-mono">Remaining Dues</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {formatCurrency(selectedFee.balanceAmount)}
                </div>
              </div>
            </div>

            {/* Record New Payment Form */}
            <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-950/20 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-wide">
                <CreditCard className="w-4 h-4 text-brand-400" />
                <span>RECORD NEW PAYMENT INSTALLMENT</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Installment Amount (INR) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                  <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash at Desk</option>
                    <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                    <option value="CARD">Debit / Credit Card</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Receipt Number</label>
                  <Input
                    placeholder="RCP-123456"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Transaction / UTR / Cheque Ref
                  </label>
                  <Input
                    placeholder="e.g. UPI-99882211"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Second installment paid via PhonePe"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Dynamic Calculation Live Preview */}
              {numPaymentAmount > 0 && (
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    After this payment:
                  </div>
                  <div className="flex gap-4 font-mono font-bold">
                    <span className="text-emerald-400">Paid: {formatCurrency(previewPaid)}</span>
                    <span className="text-amber-400">Remaining: {formatCurrency(previewRemaining)}</span>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                className="w-full gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5"
                isLoading={recordPaymentMutation.isPending}
                onClick={() => recordPaymentMutation.mutate()}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                <Send className="w-4 h-4" /> Save Payment & Send Email Notification
              </Button>
            </div>

            {/* Complete Chronological History / Ledger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Chronological Payment History ({selectedFee.payments?.length || 0})
                </span>
              </div>

              {(!selectedFee.payments || selectedFee.payments.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800/60">
                  No previous payments logged for this student yet.
                </div>
              ) : (
                <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950/60">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Receipt #</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Reference</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {selectedFee.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="p-2.5 whitespace-nowrap text-slate-400">{formatDate(p.paidAt)}</td>
                          <td className="p-2.5 font-bold text-brand-400">{p.receiptNumber || '—'}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                          <td className="p-2.5 text-slate-400">{p.transactionRef || '—'}</td>
                          <td className="p-2.5 text-slate-400 max-w-[150px] truncate">{p.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedFee(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
