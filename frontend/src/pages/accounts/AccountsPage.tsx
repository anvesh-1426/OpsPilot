import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Plus, Edit, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Button, Modal, StatCard, LoadingSpinner, Pagination, Select } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';

const COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#7C3AED', '#DB2777'];

const defaultForm = { title: '', category: '', amount: '', date: '', description: '', status: 'PENDING' };

export const AccountsPage: React.FC = () => {
  const [expPage, setExpPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [plYear, setPlYear] = useState(new Date().getFullYear().toString());
  const qc = useQueryClient();

  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ['expenses', expPage],
    queryFn: async () => { const { data } = await api.get(`/accounts/expenses?page=${expPage}&limit=12`); return data; },
  });

  const { data: plData, isLoading: plLoading } = useQuery({
    queryKey: ['pl-summary', plYear],
    queryFn: async () => { const { data } = await api.get(`/accounts/pl-summary?year=${plYear}`); return data.data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/accounts/expenses', { ...d, amount: parseFloat(d.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/accounts/expenses/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/expenses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modal === 'create' ? createMutation.mutate(form) : updateMutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  const openEdit = (exp: any) => {
    setSelected(exp);
    setForm({ title: exp.title, category: exp.category, amount: exp.amount.toString(), date: exp.date?.split('T')[0] || '', description: exp.description || '', status: exp.status });
    setModal('edit');
  };

  // Group expenses by category for pie chart
  const expList: any[] = expenses?.data || [];
  const categoryMap = expList.reduce((acc: any, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const EXPENSE_CATEGORIES = ['Rent', 'Payroll', 'Marketing', 'Technology', 'Operations', 'Utilities', 'HR', 'Legal', 'Insurance', 'Other'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        subtitle="Financial management and P&L"
        actions={<Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add Expense</Button>}
      />

      {/* P&L Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={plLoading ? '—' : formatCurrency(plData?.totalIncome || 0)} icon={<TrendingUp size={20} />} gradient="stat-gradient-green" loading={plLoading} />
        <StatCard title="Total Expenses" value={plLoading ? '—' : formatCurrency(plData?.totalExpenses || 0)} icon={<DollarSign size={20} />} gradient="stat-gradient-rose" loading={plLoading} />
        <StatCard title="Net Profit" value={plLoading ? '—' : formatCurrency(plData?.netProfit || 0)} icon={<DollarSign size={20} />} gradient={plData?.netProfit >= 0 ? 'stat-gradient-blue' : 'stat-gradient-rose'} loading={plLoading} />
        <StatCard title="Profit Margin" value={plLoading ? '—' : `${(plData?.profitMargin || 0).toFixed(1)}%`} icon={<TrendingUp size={20} />} gradient="stat-gradient-purple" loading={plLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Expenses table */}
        <div className="xl:col-span-2">
          <Card padding={false}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Expenses</h3>
            </div>
            {expLoading ? <div className="py-20"><LoadingSpinner /></div> : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr>
                      <th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th className="text-right">Actions</th>
                    </tr></thead>
                    <tbody>
                      {expList.map((exp: any) => (
                        <tr key={exp.id}>
                          <td>
                            <p className="font-medium text-slate-800">{exp.title}</p>
                            {exp.description && <p className="text-xs text-slate-400 truncate max-w-48">{exp.description}</p>}
                          </td>
                          <td><span className="badge-neutral">{exp.category}</span></td>
                          <td><p className="font-bold text-rose-600">{formatCurrency(exp.amount)}</p></td>
                          <td><p className="text-sm text-slate-500">{formatDate(exp.date)}</p></td>
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit size={14} /></button>
                              <button onClick={() => { if (confirm('Delete expense?')) deleteMutation.mutate(exp.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {expenses?.meta?.pages > 1 && (
                  <div className="px-6"><Pagination page={expPage} totalPages={expenses.meta.pages} total={expenses.meta.total} limit={12} onPageChange={setExpPage} /></div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Pie chart + P&L monthly */}
        <div className="space-y-6">
          {pieData.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Monthly P&L */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Monthly P&L</h3>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1" value={plYear} onChange={(e) => setPlYear(e.target.value)}>
                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {plLoading ? <LoadingSpinner /> : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {plData?.monthly?.map((m: any) => (
                  <div key={m.month} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-medium text-slate-700 w-12">{m.month}</p>
                    <div className="flex-1 mx-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.abs(m.profit / 5000) * 100)}%` }} />
                    </div>
                    <p className={`text-xs font-bold w-24 text-right ${m.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.profit >= 0 ? '+' : ''}{formatCurrency(m.profit)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Expense Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Expense' : 'Edit Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Title *</label>
            <input required className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Expense title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select...</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Amount (₹) *</label>
              <input required type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea rows={2} className="form-input resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add Expense' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
