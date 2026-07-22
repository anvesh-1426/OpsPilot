import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Shield, Users } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, Button, Modal, LoadingSpinner } from '../../components/ui';
import { formatDate, formatDateTime, getInitials } from '../../lib/utils';

const ROLES = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];

const defaultForm = { name: '', email: '', password: '', role: 'SALES', isActive: true };

export const AdminPage: React.FC = () => {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>(defaultForm);
  const [logPage, setLogPage] = useState(1);
  const qc = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const { data } = await api.get('/users'); return data.data; },
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs', logPage],
    queryFn: async () => { const { data } = await api.get(`/audit-logs?page=${logPage}&limit=20`); return data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/users', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/users/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modal === 'create' ? createMutation.mutate(form) : updateMutation.mutate(form);
  };

  const openEdit = (u: any) => {
    setSelected(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive });
    setModal('edit');
  };

  const roleColors: Record<string, string> = { ADMIN: 'badge-danger', SALES: 'badge-info', WAREHOUSE: 'badge-warning', ACCOUNTS: 'badge-purple' };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Panel"
        subtitle="Manage users, roles, and audit logs"
        actions={<Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add User</Button>}
      />

      {/* Users */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Users size={16} /> Team Members</h3>
          <span className="badge-info">{users?.length || 0} users</span>
        </div>
        {usersLoading ? <div className="py-12"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Joined</th><th className="text-right">Actions</th>
              </tr></thead>
              <tbody>
                {users?.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                          {getInitials(u.name)}
                        </div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                      </div>
                    </td>
                    <td><p className="text-sm text-slate-600">{u.email}</p></td>
                    <td><span className={roleColors[u.role] || 'badge-neutral'}><Shield size={11} className="inline mr-1" />{u.role}</span></td>
                    <td>{u.isActive ? <span className="badge-success">Active</span> : <span className="badge-neutral">Inactive</span>}</td>
                    <td><p className="text-xs text-slate-400">{u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}</p></td>
                    <td><p className="text-sm text-slate-500">{formatDate(u.createdAt)}</p></td>
                    <td>
                      <div className="flex justify-end">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit Logs */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Shield size={16} /> Audit Logs</h3>
        </div>
        {logsLoading ? <div className="py-12"><LoadingSpinner /></div> : (
          <>
            {auditLogs?.data?.length === 0 || !auditLogs?.data ? (
              <div className="text-center py-12 text-slate-400 text-sm">No audit logs yet. Actions will appear here.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>User</th><th>Action</th><th>Entity</th><th>IP</th><th>Time</th></tr></thead>
                  <tbody>
                    {auditLogs.data.map((log: any) => (
                      <tr key={log.id}>
                        <td><p className="text-sm font-medium text-slate-700">{log.user?.name || 'System'}</p></td>
                        <td><span className="badge-info text-xs">{log.action}</span></td>
                        <td><p className="text-xs text-slate-500">{log.entityType} {log.entityId?.slice(0, 8)}</p></td>
                        <td><p className="text-xs text-slate-400 font-mono">{log.ip || '—'}</p></td>
                        <td><p className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create/Edit User Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Team Member' : 'Edit User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input required type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="form-label">{modal === 'create' ? 'Password *' : 'Password (leave empty to keep)'}</label>
            <input required={modal === 'create'} type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-select" value={form.isActive.toString()} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add User' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
