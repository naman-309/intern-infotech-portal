import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
          Advertised tuition fees, offline center receipt records, and installment balance status.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-400 font-medium">Total Advertised Fees</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(summary.totalCourseFees)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-emerald-400 font-medium">Total Paid to Date</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(summary.totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card>
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
        <div className="space-y-4">
          {feeRecords.map((fee) => (
            <Card key={fee.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{fee.course.title}</h3>
                  <div className="text-xs text-indigo-400 font-mono mt-0.5">
                    Batch: {fee.batch.name} ({fee.batch.batchCode})
                  </div>
                </div>

                <Badge variant={fee.paymentStatus === 'PAID' ? 'success' : fee.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}>
                  {fee.paymentStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Total Fee</div>
                  <div className="text-sm font-bold text-white mt-0.5">{formatCurrency(fee.totalFee)}</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Paid Amount</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(fee.paidAmount)}</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Remaining Balance</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">{formatCurrency(fee.balanceAmount)}</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase text-[10px]">Due Date</div>
                  <div className="text-sm text-slate-300 mt-0.5">{formatDate(fee.dueDate)}</div>
                </div>
              </div>

              {fee.notes && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Accounting Note:</span> {fee.notes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
