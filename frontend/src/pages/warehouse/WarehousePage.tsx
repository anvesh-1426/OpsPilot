import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Warehouse, MapPin, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Button, Modal, EmptyState, LoadingSpinner } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';

const defaultForm = { name: '', code: '', address: '', city: '', country: 'India', capacity: '' };

export const WarehousePage: React.FC = () => {
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => { const { data } = await api.get('/inventory/warehouses'); return data.data; },
  });

  const { data: detail } = useQuery({
    queryKey: ['warehouse', selected?.id],
    queryFn: async () => { const { data } = await api.get(`/inventory/warehouses/${selected.id}`); return data.data; },
    enabled: !!selected?.id && modal === 'view',
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/inventory/warehouses', { ...d, capacity: d.capacity ? parseInt(d.capacity) : null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/inventory/warehouses/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setModal(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modal === 'create' ? createMutation.mutate(form) : updateMutation.mutate(form);
  };

  const openEdit = (w: any) => {
    setSelected(w);
    setForm({ name: w.name, code: w.code, address: w.address || '', city: w.city || '', country: w.country || 'India', capacity: w.capacity?.toString() || '' });
    setModal('edit');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        subtitle="Manage your storage locations"
        actions={<Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add Warehouse</Button>}
      />

      {isLoading ? <div className="py-20"><LoadingSpinner /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {warehouses?.map((w: any) => {
            const totalStock = w.inventory?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
            const utilization = w.capacity ? Math.round((totalStock / w.capacity) * 100) : 0;
            return (
              <div key={w.id} className="card-premium p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Warehouse size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{w.name}</h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{w.code}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit size={15} /></button>
                    <button onClick={() => { setSelected(w); setModal('view'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Warehouse size={15} /></button>
                  </div>
                </div>

                {w.city && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-4"><MapPin size={13} />{w.city}, {w.country}</p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center bg-slate-50 rounded-xl p-2">
                    <p className="text-xl font-bold text-slate-800">{w._count?.inventory || 0}</p>
                    <p className="text-xs text-slate-400">SKUs</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl p-2">
                    <p className="text-xl font-bold text-slate-800">{totalStock.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Units</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl p-2">
                    <p className="text-xl font-bold text-slate-800">{w.locations?.length || 0}</p>
                    <p className="text-xs text-slate-400">Locations</p>
                  </div>
                </div>

                {w.capacity > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Capacity</span>
                      <span className="font-medium">{utilization}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${utilization > 80 ? 'bg-rose-500' : utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{totalStock.toLocaleString()} / {w.capacity.toLocaleString()} units</p>
                  </div>
                )}

                {!w.isActive && <div className="mt-3"><span className="badge-danger">Inactive</span></div>}
              </div>
            );
          })}

          {!warehouses?.length && (
            <div className="col-span-3">
              <Card>
                <EmptyState icon={<Warehouse size={28} />} title="No warehouses" description="Add your first warehouse to manage inventory." action={<Button icon={<Plus size={16} />} onClick={() => setModal('create')}>Add Warehouse</Button>} />
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Warehouse' : 'Edit Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Name *</label>
            <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Distribution Center" />
          </div>
          <div>
            <label className="form-label">Code *</label>
            <input required className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WH-001" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <input className="form-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Capacity (units)</label>
            <input type="number" className="form-input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="50000" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add Warehouse' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title={selected?.name || 'Warehouse'} size="xl">
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Location</p>
                <p className="text-sm font-medium text-slate-800">{detail.address}</p>
                <p className="text-sm text-slate-600">{detail.city}, {detail.country}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Inventory Stats</p>
                <p className="text-2xl font-bold text-slate-800">{detail.inventory?.length || 0} <span className="text-sm font-normal text-slate-400">SKUs</span></p>
              </div>
            </div>

            {detail.inventory?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Stock by Product</p>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  <table className="data-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Value</th></tr></thead>
                    <tbody>
                      {detail.inventory.map((inv: any) => (
                        <tr key={inv.id}>
                          <td>
                            <p className="font-medium text-slate-800">{inv.product?.name}</p>
                            <span className="font-mono text-xs text-slate-400">{inv.product?.sku}</span>
                          </td>
                          <td><p className="text-sm text-slate-500">{inv.product?.category?.name || '—'}</p></td>
                          <td>
                            <p className={`font-bold ${inv.quantity === 0 ? 'text-rose-600' : inv.quantity <= inv.minQuantity ? 'text-amber-600' : 'text-slate-800'}`}>
                              {inv.quantity} {inv.product?.unit}
                            </p>
                          </td>
                          <td><p className="text-sm text-slate-600">{formatCurrency(inv.quantity * (inv.product?.costPrice || 0))}</p></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
