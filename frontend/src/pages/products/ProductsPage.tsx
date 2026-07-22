import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, Button, SearchInput, Pagination, Modal, EmptyState, LoadingSpinner, Select } from '../../components/ui';
import { formatCurrency, formatDate, downloadCSV } from '../../lib/utils';

const defaultForm = { sku: '', name: '', description: '', categoryId: '', supplierId: '', unitPrice: '', costPrice: '', taxPercent: '18', unit: 'pcs', barcode: '', minStockAlertQty: '10', warehouseId: '', initialStock: '' };

export const ProductsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'stock' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [stockAdj, setStockAdj] = useState({ type: 'IN', quantity: 1, reason: '', warehouseId: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, catFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15', ...(search && { search }), ...(catFilter && { categoryId: catFilter }) });
      const { data } = await api.get(`/products/products?${params}`);
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/products/categories'); return data.data; },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => { const { data } = await api.get('/products/suppliers'); return data.data; },
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => { const { data } = await api.get('/inventory/warehouses'); return data.data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/products/products', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/products/products/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const stockMutation = useMutation({
    mutationFn: (d: any) => api.post(`/products/products/${selected.id}/adjust-stock`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(null); },
  });

  const products = data?.data || [];
  const meta = data?.meta || {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      unitPrice: parseFloat(form.unitPrice),
      costPrice: parseFloat(form.costPrice),
      taxPercent: parseFloat(form.taxPercent),
      minStockAlertQty: parseInt(form.minStockAlertQty) || 0,
      initialStock: parseInt(form.initialStock) || 0,
    };
    modal === 'create' ? createMutation.mutate(payload) : updateMutation.mutate(payload);
  };

  const openEdit = (p: any) => {
    setSelected(p);
    setForm({
      sku: p.sku, name: p.name, description: p.description || '', categoryId: p.categoryId || '', supplierId: p.supplierId || '',
      unitPrice: p.unitPrice.toString(), costPrice: p.costPrice.toString(), taxPercent: p.taxPercent.toString(),
      unit: p.unit, barcode: p.barcode || '', minStockAlertQty: p.minStockAlertQty.toString(),
      warehouseId: '', initialStock: '',
    });
    setModal('edit');
  };

  const catOptions = [{ label: 'All Categories', value: '' }, ...(categories?.map((c: any) => ({ label: c.name, value: c.id })) || [])];

  const getTotalStock = (p: any) => p.inventory?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
  const isLowStock = (p: any) => getTotalStock(p) <= (p.minStockAlertQty || 0) && getTotalStock(p) > 0;
  const isOutStock = (p: any) => getTotalStock(p) === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${meta.total || 0} total products`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadCSV(products, 'products')}>Export</Button>
            <Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add Product</Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, SKU..." className="w-72" />
        <Select value={catFilter} onChange={(v) => { setCatFilter(v); setPage(1); }} options={catOptions} className="w-48" />
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package size={28} />} title="No products" description="Add your first product to get started." action={<Button icon={<Plus size={16} />} onClick={() => setModal('create')}>Add Product</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Cost</th><th>Stock</th><th>Status</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {products.map((p: any) => {
                    const stock = getTotalStock(p);
                    const low = isLowStock(p);
                    const out = isOutStock(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div>
                            <p className="font-semibold text-slate-800">{p.name}</p>
                            {p.supplier?.name && <p className="text-xs text-slate-400">{p.supplier.name}</p>}
                          </div>
                        </td>
                        <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg">{p.sku}</span></td>
                        <td><p className="text-sm text-slate-600">{p.category?.name || '—'}</p></td>
                        <td><p className="font-semibold text-slate-800">{formatCurrency(p.unitPrice)}</p></td>
                        <td><p className="text-sm text-slate-500">{formatCurrency(p.costPrice)}</p></td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {out ? <AlertTriangle size={13} className="text-rose-500" /> : low ? <AlertTriangle size={13} className="text-amber-500" /> : null}
                            <span className={`text-sm font-semibold ${out ? 'text-rose-600' : low ? 'text-amber-600' : 'text-slate-700'}`}>{stock} {p.unit}</span>
                          </div>
                        </td>
                        <td>
                          {out ? <span className="badge-danger">Out of Stock</span>
                            : low ? <span className="badge-warning">Low Stock</span>
                            : <span className="badge-success">In Stock</span>}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelected(p); setStockAdj({ type: 'IN', quantity: 1, reason: '', warehouseId: p.inventory?.[0]?.warehouseId || '' }); setModal('stock'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Adjust Stock"><Package size={14} /></button>
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit size={14} /></button>
                            <button onClick={() => { if (confirm('Deactivate this product?')) deleteMutation.mutate(p.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && <div className="px-6"><Pagination page={page} totalPages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} /></div>}
          </>
        )}
      </Card>

      {/* Create/Edit Product Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Product' : 'Edit Product'} size="xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">SKU *</label>
            <input required className="form-input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="PROD-001" />
          </div>
          <div>
            <label className="form-label">Name *</label>
            <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">No category</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Supplier</label>
            <select className="form-select" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">No supplier</option>
              {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Unit Price (₹) *</label>
            <input required type="number" step="0.01" className="form-input" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="form-label">Cost Price (₹) *</label>
            <input required type="number" step="0.01" className="form-input" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Tax %</label>
            <input type="number" step="0.01" className="form-input" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Unit</label>
            <input className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs, kg, box..." />
          </div>
          <div>
            <label className="form-label">Barcode</label>
            <input className="form-input" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Min Stock Alert Qty</label>
            <input type="number" className="form-input" value={form.minStockAlertQty} onChange={(e) => setForm({ ...form, minStockAlertQty: e.target.value })} />
          </div>
          {modal === 'create' && (
            <>
              <div>
                <label className="form-label">Initial Stock</label>
                <input type="number" className="form-input" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="form-label">Warehouse</label>
                <select className="form-select" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                  <option value="">Select warehouse</option>
                  {warehouses?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="col-span-2">
            <label className="form-label">Description</label>
            <textarea rows={2} className="form-input resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal open={modal === 'stock'} onClose={() => setModal(null)} title="Adjust Stock">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800">{selected?.name}</p>
            <p className="text-xs text-slate-500 font-mono">{selected?.sku}</p>
          </div>
          <div>
            <label className="form-label">Type</label>
            <div className="flex gap-3">
              {['IN', 'OUT', 'ADJUSTMENT'].map((t) => (
                <button key={t} type="button" onClick={() => setStockAdj({ ...stockAdj, type: t })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${stockAdj.type === t ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={stockAdj.warehouseId} onChange={(e) => setStockAdj({ ...stockAdj, warehouseId: e.target.value })}>
              {warehouses?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Quantity</label>
            <input type="number" min={1} className="form-input" value={stockAdj.quantity} onChange={(e) => setStockAdj({ ...stockAdj, quantity: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="form-label">Reason *</label>
            <input required className="form-input" value={stockAdj.reason} onChange={(e) => setStockAdj({ ...stockAdj, reason: e.target.value })} placeholder="Stock adjustment reason..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={() => stockMutation.mutate(stockAdj)} loading={stockMutation.isPending}>Adjust Stock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
