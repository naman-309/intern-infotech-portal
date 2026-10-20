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
  Tag,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminFees = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' | 'discount'

  // New Payment Form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Discount Configuration state
  const [editDiscountAmount, setEditDiscountAmount] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  const { data: feesData, isLoading } = useQuery({
    queryKey: ['adminFees', search],
    queryFn: () => api.get(`/fees?search=${search}`),
  });

  const feeRecords = feesData?.data || [];

  const handleOpenPaymentModal = (fee, initialTab = 'payment') => {
    setSelectedFee(fee);
    setActiveTab(initialTab);
    setPaymentAmount('');
    setPaymentMethod('UPI');
    setTransactionRef('');
    setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`);
    setPaymentRemarks('');
    setEditDiscountAmount(fee.discountAmount || 0);
    setEditNotes(fee.notes || '');
  };

  // 1. Record Payment Installment Mutation
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
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success(
        `Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded! Student email sent via Redis queue.`
      );
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
      toast.error(err.response?.data?.message || err.message || 'Failed to record payment');
    },
  });

  // 2. Update Discount Configuration Mutation
  const updateDiscountMutation = useMutation({
    mutationFn: async () => {
      const discount = Math.max(0, parseFloat(editDiscountAmount) || 0);
      return api.put(`/fees/${selectedFee.id}`, {
        discountAmount: discount,
        notes: editNotes,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminFees'] });
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Course enrollment discount and payable amount updated successfully');
      if (res?.data?.feeRecord) {
        setSelectedFee(res.data.feeRecord);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update discount');
    },
  });

  // Calculations for live previews
  const originalCourseFee = selectedFee
    ? (selectedFee.originalFee > 0 ? selectedFee.originalFee : (selectedFee.course?.advertisedFee || selectedFee.totalFee))
    : 0;
  const currentDiscount = selectedFee ? (selectedFee.discountAmount || 0) : 0;
  const newDiscount = Math.max(0, parseFloat(editDiscountAmount) || 0);
  const previewFinalPayable = Math.max(0, originalCourseFee - newDiscount);
  const currentPaid = selectedFee ? selectedFee.paidAmount : 0;
  const previewNewRemaining = Math.max(0, previewFinalPayable - currentPaid);

  const numPaymentAmount = parseFloat(paymentAmount) || 0;
  const previewPaymentPaid = selectedFee ? selectedFee.paidAmount + numPaymentAmount : 0;
  const previewPaymentRemaining = selectedFee ? Math.max(0, selectedFee.totalFee - previewPaymentPaid) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Tuition & Fee Administration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage course fees, configure enrollment discounts, and record partial payment installments with receipts.
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
                <th className="p-4">Original Fee</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Final Payable</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4">Remaining Dues</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {feeRecords.map((fee) => {
                const origFee = fee.originalFee > 0 ? fee.originalFee : (fee.course?.advertisedFee || fee.totalFee);
                const discount = fee.discountAmount || 0;

                return (
                  <tr key={fee.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white font-sans">
                        {fee.student?.user?.firstName} {fee.student?.user?.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{fee.student?.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-sans">{fee.course?.title}</div>
                      <div className="text-[11px] text-sky-400 font-mono">{fee.batch?.name}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-300">
                      {formatCurrency(origFee)}
                    </td>
                    <td className="p-4">
                      {discount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                          - {formatCurrency(discount)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">₹0</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {formatCurrency(fee.totalFee)}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {formatCurrency(fee.paidAmount)}
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      {formatCurrency(fee.balanceAmount)}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          fee.paymentStatus === 'PAID'
                            ? 'success'
                            : fee.paymentStatus === 'PARTIAL'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {fee.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPaymentModal(fee, 'discount')}
                          className="text-xs text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/30"
                          title="Configure Enrollment Discount"
                        >
                          <Tag className="w-3.5 h-3.5 mr-1" /> Discount
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenPaymentModal(fee, 'payment')}
                          className="text-xs gap-1.5 bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Add Payment
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* RECORD PAYMENT & FEE CONFIGURATION MODAL */}
      {selectedFee && (
        <Modal
          isOpen={!!selectedFee}
          onClose={() => setSelectedFee(null)}
          title={`Fee Account: ${selectedFee.student?.user?.firstName} ${selectedFee.student?.user?.lastName}`}
          description={`${selectedFee.course?.title} • Batch: ${selectedFee.batch?.name || selectedFee.batch?.batchCode}`}
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            {/* Financial Calculations Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Original Fee</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(originalCourseFee)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 uppercase">Discount Granted</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  - {formatCurrency(selectedFee.discountAmount || 0)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-sky-400 uppercase">Final Payable</div>
                <div className="text-sm font-bold text-sky-300 mt-0.5">
                  {formatCurrency(selectedFee.totalFee)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-amber-400 uppercase">Balance Due</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {formatCurrency(selectedFee.balanceAmount)}
                </div>
              </div>
            </div>

            {/* Sub-Tabs: Payment vs Discount Configuration */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('payment')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'payment'
                    ? 'border-sky-500 text-sky-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Record Payment Installment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discount')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'discount'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" /> Configure Discount & Payable Amount
              </button>
            </div>

            {/* TAB A: RECORD PAYMENT FORM */}
            {activeTab === 'payment' && (
              <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-4">
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
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {numPaymentAmount > 0 && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-slate-400">After this payment:</div>
                    <div className="flex gap-4 font-mono font-bold">
                      <span className="text-emerald-400">Paid: {formatCurrency(previewPaymentPaid)}</span>
                      <span className="text-amber-400">Remaining: {formatCurrency(previewPaymentRemaining)}</span>
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5"
                  disabled={recordPaymentMutation.isPending || !paymentAmount || parseFloat(paymentAmount) <= 0}
                  onClick={() => recordPaymentMutation.mutate()}
                >
                  <Send className="w-4 h-4" /> Save Payment & Send Email Notification
                </Button>
              </div>
            )}

            {/* TAB B: CONFIGURE DISCOUNT FORM */}
            {activeTab === 'discount' && (
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Discount Amount (₹) <span className="text-slate-400 font-normal">(Financial concession for this course enrollment)</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={originalCourseFee}
                    value={editDiscountAmount}
                    onChange={(e) => setEditDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 5000"
                    className="font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Original published fee: <strong>{formatCurrency(originalCourseFee)}</strong>. Discount cannot exceed this amount.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Administrative Note / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Merit scholarship / sibling discount granted by director"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Live Formula Preview */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Original Course Fee:</span>
                    <span className="text-white">{formatCurrency(originalCourseFee)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Applied Discount:</span>
                    <span>- {formatCurrency(newDiscount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sky-300 border-t border-slate-800 pt-1.5">
                    <span>Final Payable Amount:</span>
                    <span className="text-white">{formatCurrency(previewFinalPayable)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Already Paid Amount:</span>
                    <span className="text-emerald-400">{formatCurrency(currentPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-400 border-t border-slate-800 pt-1.5">
                    <span>New Remaining Balance:</span>
                    <span className="text-amber-300">{formatCurrency(previewNewRemaining)}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5"
                  disabled={updateDiscountMutation.isPending || newDiscount > originalCourseFee}
                  onClick={() => updateDiscountMutation.mutate()}
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Discount & Update Payable Balance
                </Button>
              </div>
            )}

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
                          <td className="p-2.5 font-bold text-sky-400">{p.receiptNumber || '—'}</td>
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
