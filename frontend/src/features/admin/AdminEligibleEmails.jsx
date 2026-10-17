import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Upload, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

const addSingleSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(2, 'Full name is required'),
  offlineRegNumber: z.string().optional(),
  phone: z.string().optional(),
  courseHint: z.string().optional(),
});

export const AdminEligibleEmails = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');

  // Fetch Authoritative Eligible Student Emails
  const { data: eligibleData, isLoading } = useQuery({
    queryKey: ['eligibleEmails', search],
    queryFn: () => api.get(`/eligible-emails?search=${search}`),
  });

  const records = eligibleData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addSingleSchema),
  });

  const onAddSingle = async (values) => {
    try {
      await api.post('/eligible-emails', values);
      queryClient.invalidateQueries({ queryKey: ['eligibleEmails'] });
      toast.success('Offline eligible student email recorded.');
      reset();
      setAddModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add eligible student');
    }
  };

  const onBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of student objects.');

      const res = await api.post('/eligible-emails/bulk', { students: parsed });
      queryClient.invalidateQueries({ queryKey: ['eligibleEmails'] });
      toast.success(res.message || 'Bulk import completed!');
      setBulkJson('');
      setBulkModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Bulk import failed. Please check JSON format.');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/eligible-emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibleEmails'] });
      toast.success('Record removed');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete record');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Offline Student Eligibility Registry</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative registry of students admitted offline at the campus desk. Used for portal registration verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setBulkModalOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Bulk Import JSON
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Single Student
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by student name, email, or offline reg number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : records.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No offline eligible student records found matching your query.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Authoritative Email</th>
                <th className="p-4">Offline Reg #</th>
                <th className="p-4">Course / Program</th>
                <th className="p-4">Portal Status</th>
                <th className="p-4">Added Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-semibold text-white font-sans">{rec.fullName}</td>
                  <td className="p-4 text-indigo-300">{rec.email}</td>
                  <td className="p-4 text-slate-400">{rec.offlineRegNumber || '-'}</td>
                  <td className="p-4 text-slate-300 font-sans">{rec.courseHint || '-'}</td>
                  <td className="p-4">
                    {rec.isRegistered ? (
                      <Badge variant="success">Account Created</Badge>
                    ) : (
                      <Badge variant="warning">Awaiting Registration</Badge>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(rec.createdAt)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(rec.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD SINGLE MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Offline Eligible Student"
        description="Records an offline enrolled student to permit their portal self-registration"
      >
        <form onSubmit={handleSubmit(onAddSingle)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Full Name</label>
            <Input placeholder="e.g. Rahul Sharma" error={errors.fullName?.message} {...register('fullName')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Email Address</label>
            <Input type="email" placeholder="e.g. rahul@example.com" error={errors.email?.message} {...register('email')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Offline Reg Number</label>
              <Input placeholder="e.g. OFF-2026-005" {...register('offlineRegNumber')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <Input placeholder="+91..." {...register('phone')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Course / Program Enrolled</label>
            <Input placeholder="e.g. Full-Stack Software Engineering" {...register('courseHint')} />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Add to Registry
            </Button>
          </div>
        </form>
      </Modal>

      {/* BULK IMPORT MODAL */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Import Offline Students"
        description="Paste JSON array of offline student admission records"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Expected JSON format:
          </p>
          <pre className="p-3 bg-slate-950 rounded-lg text-[11px] text-indigo-300 border border-slate-800 overflow-x-auto">
{`[
  {
    "fullName": "Student Name",
    "email": "student@example.com",
    "phone": "+919876543210",
    "offlineRegNumber": "OFF-101",
    "courseHint": "Full Stack"
  }
]`}
          </pre>

          <textarea
            rows={8}
            placeholder="Paste JSON array here..."
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            className="flex w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={onBulkImport}>
              Run Bulk Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
