import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Search, CheckCircle2, AlertTriangle, FileText, X, Package, Shield, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { Card, Badge, Skeleton } from '../../components/ui';
import { formatDate, formatCurrency } from '../../lib/utils';

interface ChallanItemInput {
  productId: string;
  quantity: number;
}

export const ChallansPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [items, setItems] = useState<ChallanItemInput[]>([{ productId: '', quantity: 1 }]);

  // Fetch Challans
  const { data, isLoading } = useQuery({
    queryKey: ['challans', statusFilter],
    queryFn: async () => {
      const { data } = await api.get('/sales/challans', { params: { status: statusFilter } });
      return data;
    },
  });

  // Fetch Customers & Products for Dropdowns
  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => { const { data } = await api.get('/crm/customers'); return data.data; },
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => { const { data } = await api.get('/products/products'); return data.data; },
  });

  // Create Challan Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/sales/challans', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challans'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to generate Delivery Challan.');
    },
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/sales/challans/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challans'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update status');
    },
  });

  const resetForm = () => {
    setCustomerId('');
    setVehicleNo('');
    setDriverName('');
    setItems([{ productId: '', quantity: 1 }]);
    setErrorMsg('');
  };

  const handleAddItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleItemChange = (idx: number, field: keyof ChallanItemInput, val: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    setItems(next);
  };

  const handleSubmit = (status: 'DRAFT' | 'CONFIRMED') => {
    setErrorMsg('');
    if (!customerId) { setErrorMsg('Please select a customer.'); return; }
    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      setErrorMsg('Please select products and valid quantities.');
      return;
    }

    createMutation.mutate({
      customerId,
      vehicleNo,
      driverName,
      status,
      items: items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })),
    });
  };

  const challans = data?.data || [];
  const filtered = challans.filter(
    (c: any) =>
      c.challanNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.order?.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const productsList = productsData || [];
  const customersList = customersData || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="text-blue-600" size={26} /> Sales Delivery Challans
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate dispatch delivery challans and manage automated warehouse stock reduction</p>
        </div>

        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} /> Create Sales Challan
        </button>
      </div>

      {/* Filters & Search */}
      <Card padding={false}>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100">
          <div className="relative flex-1 w-full max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Challan # or Customer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['', 'DRAFT', 'CONFIRMED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === '' ? 'All Challans' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="p-8"><Skeleton className="w-full h-40" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Truck size={32} className="mx-auto mb-2 opacity-50" />
            No delivery challans found. Click "Create Sales Challan" to dispatch products.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Challan #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Warehouse</th>
                  <th className="px-6 py-3.5">Items & Quantity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Dispatched Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filtered.map((c: any) => {
                  const itemsCount = c.order?.items?.length || 0;
                  const totalQty = c.order?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600 font-mono">{c.challanNumber}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{c.order?.customer?.name || 'N/A'}</p>
                        <p className="text-[11px] text-slate-400">{c.order?.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{c.warehouse?.name || 'Main Warehouse'}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{totalQty} Units</span>
                        <span className="text-[11px] text-slate-400 block">({itemsCount} Product SKUs)</span>
                      </td>
                      <td className="px-6 py-4"><Badge status={c.status}>{c.status}</Badge></td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(c.dispatchedAt || c.createdAt)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {c.status === 'DRAFT' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: c.id, status: 'CONFIRMED' })}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                          >
                            Confirm & Deduct Stock
                          </button>
                        )}
                        {c.status === 'CONFIRMED' && (
                          <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={13} /> Stock Deducted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Sales Challan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Truck size={20} className="text-blue-600" /> Create Sales Delivery Challan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select customer and products. Stock will be reduced automatically upon confirmation.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="">-- Choose Customer --</option>
                  {customersList.map((cust: any) => (
                    <option key={cust.id} value={cust.id}>{cust.name} ({cust.email})</option>
                  ))}
                </select>
              </div>

              {/* Vehicle & Driver Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="e.g. NY-7842-TR"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Miller"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">Products & Quantities *</label>
                  <button onClick={handleAddItem} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                {items.map((item, idx) => {
                  const selectedProd = productsList.find((p: any) => p.id === item.productId);

                  return (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="form-input text-xs"
                        >
                          <option value="">-- Select Product --</option>
                          {productsList.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) — {formatCurrency(p.unitPrice)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="form-input text-xs"
                          placeholder="Qty"
                        />
                      </div>

                      {items.length > 1 && (
                        <button onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl">
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('CONFIRMED')}
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Confirm & Deduct Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
