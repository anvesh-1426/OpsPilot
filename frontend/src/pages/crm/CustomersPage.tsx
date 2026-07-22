import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import {
  PageHeader, Card, Badge, Button, SearchInput, Pagination, Modal, EmptyState, LoadingSpinner, Select
} from '../../components/ui';
import { formatCurrency, formatDate, getInitials, downloadCSV } from '../../lib/utils';

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Prospect', value: 'PROSPECT' },
  { label: 'Churned', value: 'CHURNED' },
];

const defaultForm = { name: '', email: '', phone: '', address: '', city: '', country: '', status: 'PROSPECT', taxId: '' };

export const CustomersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [noteText, setNoteText] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '12', ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
      const { data } = await api.get(`/crm/customers?${params}`);
      return data;
    },
  });

  const { data: detail } = useQuery({
    queryKey: ['customer', selected?.id],
    queryFn: async () => { const { data } = await api.get(`/crm/customers/${selected.id}`); return data.data; },
    enabled: !!selected?.id && modal === 'view',
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/crm/customers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/crm/customers/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const addNoteMutation = useMutation({
    mutationFn: () => api.post(`/crm/customers/${selected?.id}/notes`, { content: noteText }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer', selected?.id] }); setNoteText(''); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modal === 'create' ? createMutation.mutate(form) : updateMutation.mutate(form);
  };

  const openEdit = (c: any) => {
    setSelected(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '', city: c.city || '', country: c.country || '', status: c.status, taxId: c.taxId || '' });
    setModal('edit');
  };

  const customers = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${meta.total || 0} total customers`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadCSV(customers, 'customers')}>Export CSV</Button>
            <Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add Customer</Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." className="w-72" />
        <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTIONS} className="w-40" />
      </div>

      {/* Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : customers.length === 0 ? (
          <EmptyState icon={<Mail size={28} />} title="No customers yet" description="Add your first customer to get started." action={<Button icon={<Plus size={16} />} onClick={() => setModal('create')}>Add Customer</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Customer</th><th>Contact</th><th>Location</th><th>Revenue</th><th>Status</th><th>Added</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{c.name}</p>
                            {c.assignedTo && <p className="text-xs text-slate-400">Rep: {c.assignedTo.name}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          {c.email && <p className="flex items-center gap-1.5 text-xs text-slate-600"><Mail size={12} />{c.email}</p>}
                          {c.phone && <p className="flex items-center gap-1.5 text-xs text-slate-400"><Phone size={12} />{c.phone}</p>}
                        </div>
                      </td>
                      <td>
                        {c.city && <p className="flex items-center gap-1 text-sm text-slate-600"><MapPin size={13} />{c.city}{c.country ? `, ${c.country}` : ''}</p>}
                      </td>
                      <td><p className="font-semibold text-slate-800">{formatCurrency(c.totalRevenue)}</p></td>
                      <td><Badge status={c.status}>{c.status}</Badge></td>
                      <td><p className="text-sm text-slate-500">{formatDate(c.createdAt)}</p></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelected(c); setModal('view'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye size={15} /></button>
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit size={15} /></button>
                          <button onClick={() => { if (confirm('Delete this customer?')) deleteMutation.mutate(c.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && (
              <div className="px-6"><Pagination page={page} totalPages={meta.pages} total={meta.total} limit={12} onPageChange={setPage} /></div>
            )}
          </>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Customer' : 'Edit Customer'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Full Name *</label>
            <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company or person name" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0000" />
          </div>
          <div>
            <label className="form-label">City</label>
            <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Hyderabad" />
          </div>
          <div>
            <label className="form-label">Country</label>
            <input className="form-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" />
          </div>
          <div>
            <label className="form-label">Tax ID / GST</label>
            <input className="form-input" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="Tax registration" />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="CHURNED">Churned</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add Customer' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Customer Details" size="xl">
        {detail && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {getInitials(detail.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800">{detail.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  {detail.email && <span className="flex items-center gap-1"><Mail size={13} />{detail.email}</span>}
                  {detail.phone && <span className="flex items-center gap-1"><Phone size={13} />{detail.phone}</span>}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Badge status={detail.status}>{detail.status}</Badge>
                  <span className="text-xs text-slate-400">Revenue: {formatCurrency(detail.totalRevenue)}</span>
                  <span className="text-xs text-slate-400">Orders: {detail.orders?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><MessageSquare size={15} /> Notes</p>
              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin mb-3">
                {detail.notes?.map((n: any) => (
                  <div key={n.id} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-sm text-slate-700">{n.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.createdBy?.name} · {formatDate(n.createdAt)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="form-input flex-1" placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                <Button size="sm" onClick={() => addNoteMutation.mutate()} disabled={!noteText.trim()}>Add</Button>
              </div>
            </div>

            {/* Recent orders */}
            {detail.orders?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Recent Orders</p>
                <div className="space-y-2">
                  {detail.orders.slice(0, 4).map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-700">{o.orderNumber}</span>
                      <span className="text-sm font-bold text-slate-800">{formatCurrency(o.total)}</span>
                      <Badge status={o.status}>{o.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
