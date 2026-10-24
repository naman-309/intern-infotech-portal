import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassBadge } from '../../components/ui/GlassBadge';
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
import { History, ShieldCheck, Search, Filter, Sparkles } from 'lucide-react';

export const AdminAuditLogs = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['adminAuditLogs', actionFilter, entityFilter],
    queryFn: () => api.get(`/audit-logs?action=${actionFilter}&entity=${entityFilter}&limit=50`),
  });

  const logs = logsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-brand-cyan/25 text-[11px] font-mono tracking-wider text-brand-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            SECURITY AUDIT TRAIL
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Security & Governance Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system logs documenting account approvals, marks revisions, role updates, and administrative modifications.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            placeholder="Filter by action (e.g. STUDENT_REGISTRATION_APPROVED, MARKS_RECORDED)..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
          />
        </div>
        <div className="w-full sm:w-64">
          <input
            placeholder="Filter by entity (e.g. User, OfflineExam)..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono"
          />
        </div>
      </div>

      <GlassPanel glow="blue" className="overflow-hidden p-0">
        <GlassTable>
          <GlassTableHeader>
            <GlassTableRow isHeader>
              <GlassTableHead>Timestamp</GlassTableHead>
              <GlassTableHead>Action</GlassTableHead>
              <GlassTableHead>Entity</GlassTableHead>
              <GlassTableHead>Actor</GlassTableHead>
              <GlassTableHead>Details / Sanitized Payload</GlassTableHead>
              <GlassTableHead>IP Address</GlassTableHead>
            </GlassTableRow>
          </GlassTableHeader>
          <GlassTableBody>
            {isLoading ? (
              <GlassTableLoading colSpan={6} rows={5} />
            ) : logs.length === 0 ? (
              <GlassTableEmpty message="No audit records found matching your query." colSpan={6} />
            ) : (
              logs.map((log) => (
                <GlassTableRow key={log.id}>
                  <GlassTableCell className="text-slate-400 font-mono whitespace-nowrap text-[11px]">
                    {formatDateTime(log.createdAt)}
                  </GlassTableCell>
                  <GlassTableCell className="font-bold text-brand-cyan font-mono text-xs">
                    {log.action}
                  </GlassTableCell>
                  <GlassTableCell className="text-slate-200 font-mono text-xs">
                    {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                  </GlassTableCell>
                  <GlassTableCell>
                    {log.user ? (
                      <div>
                        <div className="font-semibold text-white tracking-tight">{log.user.firstName} {log.user.lastName}</div>
                        <div className="text-[10px] text-brand-cyan/80 font-mono">{log.user.email} ({log.user.role})</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-xs font-mono">System / Anonymous</span>
                    )}
                  </GlassTableCell>
                  <GlassTableCell className="max-w-xs truncate text-[11px] text-slate-300 font-mono">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </GlassTableCell>
                  <GlassTableCell className="text-slate-400 font-mono text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </GlassTableCell>
                </GlassTableRow>
              ))
            )}
          </GlassTableBody>
        </GlassTable>
      </GlassPanel>
    </div>
  );
};
