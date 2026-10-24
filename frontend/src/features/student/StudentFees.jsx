import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { GlassPanel, GlassBadge, GlassStat } from '../../components/ui';
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

      {/* Financial Summary 3D Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassStat
          label="Total Advertised Tuition"
          value={formatCurrency(summary.totalCourseFees)}
          sublabel="Official enrollment tuition"
          color="indigo"
          icon={CreditCard}
        />
        <GlassStat
          label="Total Paid to Date"
          value={formatCurrency(summary.totalPaid)}
          sublabel="Receipted transactions"
          color="emerald"
          icon={CheckCircle2}
        />
        <GlassStat
          label="Outstanding Balance"
          value={formatCurrency(summary.totalBalance)}
          sublabel="Remaining scheduled fees"
          color="amber"
          icon={Clock}
        />
      </div>

      {isLoading ? (
        <div className="h-48 w-full rounded-2xl bg-white/[0.03] animate-pulse border border-white/10" />
      ) : feeRecords.length === 0 ? (
        <GlassPanel className="p-12 text-center text-slate-400 text-xs">
          No fee records found for your account.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {feeRecords.map((fee) => (
            <GlassPanel key={fee.id} variant="default" className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">{fee.course?.title}</h3>
                  <div className="text-xs text-indigo-300 font-mono mt-0.5">
                    Batch: {fee.batch?.name} ({fee.batch?.batchCode})
                  </div>
                </div>

                <GlassBadge variant={fee.paymentStatus === 'PAID' ? 'success' : fee.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}>
                  {fee.paymentStatus}
                </GlassBadge>
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
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Accounting Note:</span> {fee.notes}
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFees;
