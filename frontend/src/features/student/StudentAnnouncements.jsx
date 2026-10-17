import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bell, User, Calendar, AlertTriangle } from 'lucide-react';

export const StudentAnnouncements = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['studentAnnouncements'],
    queryFn: () => api.get('/announcements'),
  });

  const announcements = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Announcements & Notices</h2>
        <p className="text-xs text-slate-400 mt-1">
          Official communication from faculty and institute administration.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 w-full" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No active announcements found.
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card key={item.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <Badge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'primary'}>
                    {item.priority}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {formatDate(item.publishDate)}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {item.body}
              </p>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>
                  Author: {item.author?.firstName} {item.author?.lastName} ({item.author?.role})
                </span>
                <span>Audience: {item.targetType}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
