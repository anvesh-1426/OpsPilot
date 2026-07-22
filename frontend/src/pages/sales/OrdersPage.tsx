import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Eye, ShoppingCart } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, Button, SearchInput, Pagination, Modal, EmptyState, LoadingSpinner, Select } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';

const ORDER_STATUSES = [
  { label: 'All Orders', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'view' | 'create' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15', ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
      const { data } = await api.get(`/sales/orders?${params}`);
      return data;
    },
  });

  const { data: customerList } = useQuery({
    queryKey: ['customer-list'],
    queryFn: async () => { const { data } = await api.get('/crm/customers?limit=100'); return data.data; },
  });

  const { data: productList } = useQuery({
    queryKey: ['product-list'],
    queryFn: async () => { const { data } = await api.get('/products/products?limit=100'); return data.data; },
  });

  const [newOrder, setNewOrder] = useState({ customerId: '', notes: '', items: [{ productId: '', quantity: 1 }] });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/sales/orders', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); setModal(null); setNewOrder({ customerId: '', notes: '', items: [{ productId: '', quantity: 1 }] }); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) => api.put(`/sales/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const orders = data?.data || [];
  const meta = data?.meta || {};

  const addItem = () => setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: '', quantity: 1 }] });
  const updateItem = (i: number, field: string, val: any) => {
    const items = [...newOrder.items];
    items[i] = { ...items[i], [field]: val };
    setNewOrder({ ...newOrder, items });
  };
  const removeItem = (i: number) => setNewOrder({ ...newOrder, items: newOrder.items.filter((_, idx) => idx !== i) });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newOrder);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle={`${meta.total || 0} total orders`}
        actions={<Button icon={<Plus size={16} />} onClick={() => setModal('create')}>New Order</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search orders..." className="w-72" />
        <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={ORDER_STATUSES} className="w-44" />
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart size={28} />} title="No orders yet" description="Create your first order to get started." action={<Button icon={<Plus size={16} />} onClick={() => setModal('create')}>New Order</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id}>
                      <td><p className="font-mono text-sm font-bold text-slate-800">{o.orderNumber}</p></td>
                      <td>
                        <p className="font-medium text-slate-800">{o.customer?.name}</p>
                        <p className="text-xs text-slate-400">{o.customer?.email}</p>
                      </td>
                      <td><p className="text-sm text-slate-600">{o.items?.length} item(s)</p></td>
                      <td>
                        <p className="font-bold text-slate-800">{formatCurrency(o.total)}</p>
                        {o.taxAmount > 0 && <p className="text-xs text-slate-400">+{formatCurrency(o.taxAmount)} tax</p>}
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                          className="text-xs rounded-lg border-0 bg-transparent font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-200"
                        >
                          {ORDER_STATUSES.filter((s) => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td><p className="text-sm text-slate-500">{formatDate(o.createdAt)}</p></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelected(o); setModal('view'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye size={15} /></button>
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

      {/* Create Order Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create New Order" size="xl">
        <form onSubmit={handleCreateOrder} className="space-y-5">
          <div>
            <label className="form-label">Customer *</label>
            <select required className="form-select" value={newOrder.customerId} onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}>
              <option value="">Select customer...</option>
              {customerList?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="form-label mb-0">Order Items *</label>
              <Button size="sm" variant="outline" onClick={addItem} type="button">+ Add Item</Button>
            </div>
            <div className="space-y-2">
              {newOrder.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select required className="form-select flex-1" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {productList?.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.unitPrice)}</option>)}
                  </select>
                  <input type="number" min={1} required className="form-input w-24" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} />
                  {newOrder.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-rose-400 hover:text-rose-600 transition-colors">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea rows={2} className="form-input resize-none" value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} placeholder="Order notes or special instructions..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Order</Button>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title={`Order ${selected?.orderNumber}`} size="xl">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Customer</p>
                <p className="font-semibold text-slate-800">{selected.customer?.name}</p>
                <p className="text-xs text-slate-400">{selected.customer?.email}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Order Date</p>
                <p className="font-semibold text-slate-800">{formatDate(selected.createdAt)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <Badge status={selected.status}>{selected.status}</Badge>
              </div>
            </div>

            <table className="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th className="text-right">Total</th></tr></thead>
              <tbody>
                {selected.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td><p className="font-medium text-slate-800">{item.product?.name}</p></td>
                    <td><span className="font-mono text-xs text-slate-500">{item.product?.sku}</span></td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-slate-50 rounded-xl p-4 ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatCurrency(selected.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Tax</span><span className="font-medium">{formatCurrency(selected.taxAmount)}</span></div>
              {selected.discountAmount > 0 && (
                <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="font-medium text-emerald-600">-{formatCurrency(selected.discountAmount)}</span></div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
                <span>Total</span><span>{formatCurrency(selected.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
