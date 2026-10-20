import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, UserX, UserCheck, Mail, Briefcase, Plus, Edit2, Globe, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const AdminTeachers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    qualifications: '',
    bio: '',
    showOnWebsite: true,
  });

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['adminTeachers', search],
    queryFn: () => api.get(`/teachers?search=${search}`),
  });

  const teachers = teachersData?.data || [];

  // 1. Status Mutation (Active/Inactive)
  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      await api.patch(`/users/${id}/status`, { status: newStatus });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      toast.success(`Faculty status updated to ${variables.newStatus}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update faculty status');
    },
  });

  // 2. Visibility Toggle Mutation (Show on Public Website: ON / OFF)
  const visibilityMutation = useMutation({
    mutationFn: async ({ id, showOnWebsite }) => {
      await api.patch(`/teachers/${id}/visibility`, { showOnWebsite });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      toast.success(`Faculty public visibility set to ${variables.showOnWebsite ? 'ON (Visible)' : 'OFF (Hidden)'}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update visibility setting');
    },
  });

  // 3. Add Faculty Mutation
  const addMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post('/teachers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      toast.success('New faculty instructor added successfully');
      setAddModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add faculty instructor');
    },
  });

  // 4. Edit Faculty Mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return api.put(`/teachers/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      toast.success('Faculty instructor details updated successfully');
      setEditModalOpen(false);
      setSelectedTeacher(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update faculty details');
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      specialization: '',
      qualifications: '',
      bio: '',
      showOnWebsite: true,
    });
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      password: '',
      specialization: teacher.teacherProfile?.specialization || '',
      qualifications: teacher.teacherProfile?.qualifications || '',
      bio: teacher.teacherProfile?.bio || '',
      showOnWebsite: teacher.teacherProfile?.showOnWebsite ?? true,
    });
    setEditModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }
    addMutation.mutate(formData);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First Name and Last Name are required');
      return;
    }
    editMutation.mutate({
      id: selectedTeacher.id,
      payload: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        specialization: formData.specialization,
        qualifications: formData.qualifications,
        bio: formData.bio,
        showOnWebsite: formData.showOnWebsite,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Faculty & Instructor Directory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage appointed instructors, teaching specializations, and public website visibility.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setAddModalOpen(true);
          }}
          className="gap-2 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" /> Add Faculty Member
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search instructors by name, email, or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : teachers.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No faculty instructors found matching your search.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Show on Public Website</th>
                <th className="p-4">Assigned Batches</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {teachers.map((teacher) => {
                const profile = teacher.teacherProfile;
                const assignments = profile?.assignments || [];
                const isActive = teacher.status === 'ACTIVE';
                const isVisible = profile?.showOnWebsite ?? true;

                return (
                  <tr key={teacher.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {teacher.firstName} {teacher.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{teacher.email}</div>
                    </td>
                    <td className="p-4 font-mono text-indigo-300">
                      {profile?.employeeId || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-[11px]">
                      {profile?.specialization || 'Engineering Faculty'}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() =>
                          visibilityMutation.mutate({
                            id: teacher.id,
                            showOnWebsite: !isVisible,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono border transition-all ${
                          isVisible
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                            : 'bg-slate-950/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                        }`}
                        title="Click to toggle teacher visibility on the public website"
                      >
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ON (Public)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>OFF (Hidden)</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {assignments.length > 0
                        ? assignments.map((a) => a.batch.batchCode).join(', ')
                        : 'No batch assigned'}
                    </td>
                    <td className="p-4">
                      <Badge variant={isActive ? 'success' : 'danger'}>
                        {teacher.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(teacher)}
                          className="text-xs text-sky-400 hover:bg-sky-500/10 border-sky-500/30"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        {isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => statusMutation.mutate({ id: teacher.id, newStatus: 'INACTIVE' })}
                            className="text-xs text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => statusMutation.mutate({ id: teacher.id, newStatus: 'ACTIVE' })}
                            className="text-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Faculty Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Faculty Instructor"
        description="Create an instructor account with teaching details and public website visibility control."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Prof. Vikram"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Sharma"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@interninfotech.com"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98260 00000"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Teaching Specialization</label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Full-Stack Cloud Architecture & Distributed Systems"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Qualifications</label>
            <Input
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              placeholder="e.g. M.Tech in Computer Science, Ex-Senior Architect"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Short Bio</label>
            <textarea
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 min-h-[70px]"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="10+ years mentoring engineering graduates into tier-1 tech companies."
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Show on Public Website</div>
              <div className="text-[11px] text-slate-400">
                When enabled, this teacher will appear in the faculty section on the landing page.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showOnWebsite}
                onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending} className="bg-sky-500 hover:bg-sky-600">
              {addMutation.isPending ? 'Adding Faculty...' : 'Save Faculty Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Faculty Details"
        description="Update instructor specialization, biography, and public website visibility."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address</label>
              <Input value={formData.email} disabled className="opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Teaching Specialization</label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Distributed Microservices & DevOps"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Qualifications</label>
            <Input
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              placeholder="e.g. M.Tech, Ex-Lead Architect"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Short Bio</label>
            <textarea
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 min-h-[70px]"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Show on Public Website</div>
              <div className="text-[11px] text-slate-400">
                ON: Teacher appears on the public landing page. OFF: Teacher is hidden from the public website.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showOnWebsite}
                onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={editMutation.isPending} className="bg-sky-500 hover:bg-sky-600">
              {editMutation.isPending ? 'Saving...' : 'Update Faculty'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
