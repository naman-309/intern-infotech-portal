import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Receipt, History } from 'lucide-react';

export const StudentFees = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['studentFees'],
    queryFn: () => api.get('/fees/my-fees'),
  });

  const feeRecords = data?.data?.feeRecords || [];
  const summary = data?.data?.summary || { totalCourseFees: 0, totalPaid: 0, totalBalance: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Tuition & Fee Statements</h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete chronological record of all your tuition installments, receipts, and balance status.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5">
            <div className="text-xs text-slate-400 font-medium">Total Program Fees</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(summary.totalCourseFees)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-950/20">
          <CardContent className="p-5">
            <div className="text-xs text-emerald-400 font-medium">Total Paid to Date</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(summary.totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-950/20">
          <CardContent className="p-5">
            <div className="text-xs text-amber-400 font-medium">Outstanding Balance</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {formatCurrency(summary.totalBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : feeRecords.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No fee records found for your account.
        </Card>
      ) : (
        <div className="space-y-6">
          {feeRecords.map((fee) => (
            <Card key={fee.id} className="p-6 space-y-5 border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{fee.course.title}</h3>
                  <div className="text-xs text-brand-400 font-mono mt-0.5">
                    Batch: {fee.batch.name} ({fee.batch.batchCode})
                  </div>
                </div>

                <Badge variant={fee.paymentStatus === 'PAID' ? 'success' : fee.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}>
                  {fee.paymentStatus}
                </Badge>
              </div>

              {/* Metric Breakdown Grid */}
              {(() => {
                const origFee = fee.originalFee > 0 ? fee.originalFee : (fee.course?.advertisedFee || fee.totalFee);
                const discount = fee.discountAmount || 0;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Original Fee</div>
                      <div className="text-sm font-bold text-slate-300 mt-0.5">{formatCurrency(origFee)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Discount Applied</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {discount > 0 ? `- ${formatCurrency(discount)}` : '₹0'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Final Payable</div>
                      <div className="text-sm font-bold text-white mt-0.5">{formatCurrency(fee.totalFee)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Total Paid</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(fee.paidAmount)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Balance Due</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{formatCurrency(fee.balanceAmount)}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Chronological Payment Log / Ledger */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white tracking-wide uppercase">
                  <Receipt className="w-4 h-4 text-brand-400" />
                  <span>Payment Ledger & Installment History</span>
                </div>

                {(!fee.payments || fee.payments.length === 0) ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                    No payment installment logs recorded yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950/80">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                          <tr>
                            <th className="p-3">Payment Date</th>
                            <th className="p-3">Receipt #</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Amount Paid</th>
                            <th className="p-3">Transaction / Ref</th>
                            <th className="p-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {fee.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-3 whitespace-nowrap text-slate-400">{formatDate(p.paidAt)}</td>
                              <td className="p-3 font-bold text-brand-400">{p.receiptNumber || '—'}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-sans">
                                  {p.paymentMethod}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                              <td className="p-3 text-slate-400">{p.transactionRef || '—'}</td>
                              <td className="p-3 text-slate-400 max-w-[200px] truncate">{p.remarks || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
