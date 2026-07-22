import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Button, Modal, EmptyState, LoadingSpinner, Badge, Pagination } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';

export const QuotationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ customerId: '', notes: '', validUntil: '', discount: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', page],
    queryFn: async () => { const { data } = await api.get(`/sales/quotations?page=${page}&limit=15`); return data; },
  });

  const { data: customers } = useQuery({
    queryKey: ['customer-list'],
    queryFn: async () => { const { data } = await api.get('/crm/customers?limit=100'); return data.data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/sales/quotations', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotations'] }); setModal(false); },
  });

  const quotations = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        subtitle={`${meta.total || 0} quotations`}
        actions={<Button icon={<Plus size={16} />} onClick={() => setModal(true)}>New Quote</Button>}
      />

      <Card padding={false}>
        {isLoading ? <div className="py-20"><LoadingSpinner /></div> : quotations.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="No quotations" description="Create your first quotation for a customer." action={<Button icon={<Plus size={16} />} onClick={() => setModal(true)}>New Quote</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Quote #</th><th>Customer</th><th>Valid Until</th><th>Total</th><th>Status</th><th>Created</th>
                </tr></thead>
                <tbody>
                  {quotations.map((q: any) => (
                    <tr key={q.id}>
                      <td><span className="font-mono text-sm font-bold text-slate-800">{q.quoteNumber}</span></td>
                      <td><p className="font-medium text-slate-800">{q.customerId}</p></td>
                      <td>{q.validUntil ? <p className="text-sm text-slate-600">{formatDate(q.validUntil)}</p> : '—'}</td>
                      <td><p className="font-bold text-slate-800">{formatCurrency(q.total || 0)}</p></td>
                      <td><Badge status={q.status || 'DRAFT'}>{q.status || 'DRAFT'}</Badge></td>
                      <td><p className="text-sm text-slate-500">{formatDate(q.createdAt)}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && <div className="px-6"><Pagination page={page} totalPages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} /></div>}
          </>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="New Quotation">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="form-label">Customer *</label>
            <select required className="form-select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Select customer...</option>
              {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Valid Until</label>
              <input type="date" className="form-input" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Discount (₹)</label>
              <input type="number" className="form-input" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea rows={3} className="form-input resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(false)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Quote</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
