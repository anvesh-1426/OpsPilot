import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, Button, Pagination, Modal, EmptyState, LoadingSpinner, Select } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHEQUE', 'ONLINE', 'UPI'];

export const InvoicesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [payModal, setPayModal] = useState<any>(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'BANK_TRANSFER', reference: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15', ...(statusFilter && { status: statusFilter }) });
      const { data } = await api.get(`/sales/invoices?${params}`);
      return data;
    },
  });

  const payMutation = useMutation({
    mutationFn: (d: any) => api.post(`/sales/invoices/${payModal.id}/payments`, { ...d, amount: parseFloat(d.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); setPayModal(null); setPayForm({ amount: '', method: 'BANK_TRANSFER', reference: '' }); },
  });

  const invoices = data?.data || [];
  const meta = data?.meta || {};

  const totalPaid = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.total, 0);
  const totalPending = invoices.filter((i: any) => i.status !== 'PAID').reduce((s: number, i: any) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle={`${meta.total || 0} total invoices`} />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: formatCurrency(totalPaid), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: formatCurrency(totalPending), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Invoices', value: meta.total || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={`card-premium p-5 ${s.bg}`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTIONS} className="w-44" />
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : invoices.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="No invoices" description="Invoices are created automatically when orders are confirmed." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Invoice #</th><th>Customer</th><th>Amount</th><th>Tax</th><th>Total</th><th>Due Date</th><th>Status</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td><p className="font-mono text-sm font-bold text-slate-800">{inv.invoiceNumber}</p></td>
                      <td>
                        <p className="font-medium text-slate-800">{inv.customer?.name}</p>
                        <p className="text-xs text-slate-400">{inv.customer?.email}</p>
                      </td>
                      <td><p className="text-sm text-slate-600">{formatCurrency(inv.subtotal)}</p></td>
                      <td><p className="text-sm text-slate-600">{formatCurrency(inv.taxAmount)}</p></td>
                      <td><p className="font-bold text-slate-800">{formatCurrency(inv.total)}</p></td>
                      <td>
                        {inv.dueDate ? (
                          <p className={`text-sm ${new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                            {formatDate(inv.dueDate)}
                          </p>
                        ) : '—'}
                      </td>
                      <td><Badge status={inv.status}>{inv.status}</Badge></td>
                      <td>
                        <div className="flex items-center justify-end">
                          {inv.status !== 'PAID' && (
                            <Button size="sm" variant="outline" onClick={() => { setPayModal(inv); setPayForm({ amount: String(inv.total - inv.payments?.reduce((s: number, p: any) => s + p.amount, 0)), method: 'BANK_TRANSFER', reference: '' }); }}>
                              Record Payment
                            </Button>
                          )}
                          {inv.status === 'PAID' && <span className="text-xs text-emerald-600 font-medium">✓ Paid</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && (
              <div className="px-6"><Pagination page={page} totalPages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} /></div>
            )}
          </>
        )}
      </Card>

      {/* Payment Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Record Payment">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-500">Invoice</p>
            <p className="font-bold text-slate-800 text-lg">{payModal?.invoiceNumber}</p>
            <p className="text-sm text-slate-500 mt-1">Outstanding: <span className="font-semibold text-slate-800">{formatCurrency(payModal?.total || 0)}</span></p>
          </div>
          <div>
            <label className="form-label">Amount *</label>
            <input type="number" step="0.01" required className="form-input" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Payment Method</label>
            <select className="form-select" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Reference / Transaction ID</label>
            <input className="form-input" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} placeholder="Optional reference number" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPayModal(null)}>Cancel</Button>
            <Button onClick={() => payMutation.mutate(payForm)} loading={payMutation.isPending} icon={<DollarSign size={15} />}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
