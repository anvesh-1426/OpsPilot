import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, Button, SearchInput, Modal, EmptyState, LoadingSpinner, Pagination } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
const LEAD_SOURCES = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'COLD_CALL', 'TRADE_SHOW', 'OTHER'];

const defaultForm = { name: '', email: '', phone: '', company: '', status: 'NEW', source: 'OTHER', value: '', notes: '' };

export const LeadsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [view, setView] = useState<'list' | 'board'>('board');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '50', ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
      const { data } = await api.get(`/crm/leads?${params}`);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/crm/leads', { ...d, value: d.value ? parseFloat(d.value) : null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/crm/leads/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });

  const handleStatusDrag = (leadId: string, newStatus: string) => {
    updateMutation.mutate({ status: newStatus });
  };

  const leads: any[] = data?.data || [];
  const meta = data?.meta || {};
  const byStatus = LEAD_STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s) }), {} as Record<string, any[]>);

  const statusColors: Record<string, string> = {
    NEW: '#60A5FA', CONTACTED: '#818CF8', QUALIFIED: '#34D399',
    PROPOSAL: '#FBBF24', NEGOTIATION: '#FB923C', CLOSED_WON: '#10B981', CLOSED_LOST: '#F87171',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modal === 'create' ? createMutation.mutate(form) : updateMutation.mutate(form);
  };

  const openEdit = (l: any) => {
    setSelected(l);
    setForm({ name: l.name, email: l.email || '', phone: l.phone || '', company: l.company || '', status: l.status, source: l.source, value: l.value?.toString() || '', notes: l.notes || '' });
    setModal('edit');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle={`${meta.total || 0} leads pipeline`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              {(['board', 'list'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${view === v ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{v}</button>
              ))}
            </div>
            <Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add Lead</Button>
          </div>
        }
      />

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads..." className="w-72" />

      {isLoading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : view === 'board' ? (
        /* Kanban Board */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {LEAD_STATUSES.map((status) => (
              <div key={status} className="w-64 shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[status] }} />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{status.replace('_', ' ')}</span>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{byStatus[status]?.length || 0}</span>
                </div>
                <div className="space-y-2">
                  {byStatus[status]?.map((lead) => (
                    <div key={lead.id} className="card-premium p-4 cursor-pointer group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
                          {lead.company && <p className="text-xs text-slate-500 truncate">{lead.company}</p>}
                          {lead.value && <p className="text-sm font-bold text-emerald-600 mt-2">{formatCurrency(lead.value)}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{lead.source?.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => openEdit(lead)} className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Edit size={13} /></button>
                          <button onClick={() => deleteMutation.mutate(lead.id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      {lead.assignedTo && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                            {lead.assignedTo.name[0]}
                          </div>
                          <span className="text-xs text-slate-400">{lead.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {!byStatus[status]?.length && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center text-xs text-slate-400">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>Lead</th><th>Company</th><th>Source</th><th>Value</th><th>Status</th><th>Created</th><th className="text-right">Actions</th>
              </tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <p className="font-semibold text-slate-800">{l.name}</p>
                      {l.email && <p className="text-xs text-slate-400">{l.email}</p>}
                    </td>
                    <td><p className="text-sm text-slate-600">{l.company || '—'}</p></td>
                    <td><span className="badge-neutral">{l.source?.replace('_', ' ')}</span></td>
                    <td><p className="font-semibold text-emerald-700">{l.value ? formatCurrency(l.value) : '—'}</p></td>
                    <td><Badge status={l.status}>{l.status.replace('_', ' ')}</Badge></td>
                    <td><p className="text-sm text-slate-500">{formatDate(l.createdAt)}</p></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit size={15} /></button>
                        <button onClick={() => deleteMutation.mutate(l.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Lead' : 'Edit Lead'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Full Name *</label>
            <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Company</label>
            <input className="form-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Deal Value (₹)</label>
            <input type="number" className="form-input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Source</label>
            <select className="form-select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea rows={3} className="form-input resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add Lead' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
