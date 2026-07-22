import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Truck, Package, Clock } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, Button, Modal, EmptyState, LoadingSpinner, Pagination } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';

export const PurchaseOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [receiveModal, setReceiveModal] = useState<any>(null);
  const [form, setForm] = useState({ supplierId: '', warehouseId: '', items: [{ productId: '', quantity: 10, unitCost: 20 }] });
  const qc = useQueryClient();

  const { data: poData, isLoading } = useQuery({
    queryKey: ['purchase-orders', page],
    queryFn: async () => { const { data } = await api.get(`/purchase/purchase-orders?page=${page}&limit=15`); return data; },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => { const { data } = await api.get('/purchase/suppliers'); return data.data; },
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => { const { data } = await api.get('/inventory/warehouses'); return data.data; },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const { data } = await api.get('/products/products?limit=100'); return data.data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/purchase/purchase-orders', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); setModal(false); },
  });

  const receiveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/purchase/purchase-orders/${id}/receive`, { notes: 'Goods received cleanly' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); setReceiveModal(null); },
  });

  const orders = poData?.data || [];
  const meta = poData?.meta || {};

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 10, unitCost: 20 }] });
  const updateItem = (i: number, field: string, val: any) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: val };
    setForm({ ...form, items });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage supplier procurement and goods receipts"
        actions={<Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Create Purchase Order</Button>}
      />

      <Card padding={false}>
        {isLoading ? <div className="py-20"><LoadingSpinner /></div> : orders.length === 0 ? (
          <EmptyState icon={<Truck size={28} />} title="No purchase orders" description="Create purchase orders to replenish warehouse inventory." action={<Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Create PO</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>PO #</th><th>Supplier</th><th>Warehouse</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {orders.map((po: any) => (
                    <tr key={po.id}>
                      <td><span className="font-mono font-bold text-slate-800 text-sm">{po.poNumber}</span></td>
                      <td><p className="font-medium text-slate-800">{po.supplier?.name}</p></td>
                      <td><p className="text-sm text-slate-600">{po.warehouse?.name}</p></td>
                      <td><p className="text-sm text-slate-600">{po.items?.length} item(s)</p></td>
                      <td><p className="font-bold text-slate-800">{formatCurrency(po.total)}</p></td>
                      <td>
                        {po.status === 'RECEIVED' ? <span className="badge-success">Received</span> : <span className="badge-warning">Ordered</span>}
                      </td>
                      <td><p className="text-sm text-slate-500">{formatDate(po.createdAt)}</p></td>
                      <td>
                        <div className="flex items-center justify-end">
                          {po.status !== 'RECEIVED' && (
                            <Button size="sm" variant="outline" icon={<CheckCircle size={14} />} onClick={() => setReceiveModal(po)}>
                              Receive Goods
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && <div className="px-6"><Pagination page={page} totalPages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} /></div>}
          </>
        )}
      </Card>

      {/* Create PO Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Purchase Order" size="xl">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Supplier *</label>
              <select required className="form-select" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Select supplier...</option>
                {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Destination Warehouse *</label>
              <select required className="form-select" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                <option value="">Select warehouse...</option>
                {warehouses?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Items *</label>
              <Button size="sm" variant="outline" type="button" onClick={addItem}>+ Add Item</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <select required className="form-select flex-1" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                  <input type="number" min={1} required className="form-input w-28" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} />
                  <input type="number" step="0.01" required className="form-input w-28" placeholder="Cost" value={item.unitCost} onChange={(e) => updateItem(i, 'unitCost', parseFloat(e.target.value))} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(false)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create PO</Button>
          </div>
        </form>
      </Modal>

      {/* Receive Goods Confirmation Modal */}
      <Modal open={!!receiveModal} onClose={() => setReceiveModal(null)} title="Receive Goods & Update Inventory">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to mark <span className="font-bold text-slate-800">{receiveModal?.poNumber}</span> as received?</p>
          <p className="text-xs text-slate-500">This will automatically increase stock levels for all item SKUs in <span className="font-semibold">{receiveModal?.warehouse?.name}</span>.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setReceiveModal(null)}>Cancel</Button>
            <Button onClick={() => receiveMutation.mutate(receiveModal.id)} loading={receiveMutation.isPending} icon={<Package size={15} />}>
              Confirm Goods Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
