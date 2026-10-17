import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Security & Governance Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system logs documenting account approvals, marks revisions, role updates, and administrative modifications.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Filter by action (e.g. STUDENT_REGISTRATION_APPROVED, MARKS_RECORDED)..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Filter by entity (e.g. User, OfflineExam)..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No audit records found matching your query.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Details / Sanitized Payload</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="p-4 font-bold text-indigo-400">{log.action}</td>
                  <td className="p-4 text-slate-200">{log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}</td>
                  <td className="p-4 font-sans">
                    {log.user ? (
                      <div>
                        <div className="font-semibold text-white">{log.user.firstName} {log.user.lastName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.user.email} ({log.user.role})</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">System / Anonymous</span>
                    )}
                  </td>
                  <td className="p-4 max-w-xs truncate text-[11px] text-slate-300">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
