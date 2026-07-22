import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Warehouse, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Badge, StatCard, SearchInput, Skeleton, Select } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';

export const InventoryPage: React.FC = () => {
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: async () => { const { data } = await api.get('/inventory/summary'); return data.data; },
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => { const { data } = await api.get('/inventory/warehouses'); return data.data; },
  });

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', warehouseFilter, lowStockOnly],
    queryFn: async () => {
      const params = new URLSearchParams({ ...(warehouseFilter && { warehouseId: warehouseFilter }), ...(lowStockOnly && { lowStock: 'true' }) });
      const { data } = await api.get(`/inventory?${params}`);
      return data.data;
    },
  });

  const { data: movements } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => { const { data } = await api.get('/inventory/movements?limit=10'); return data.data; },
  });

  const inventory: any[] = inventoryData || [];
  const filtered = search ? inventory.filter((i) => i.product?.name?.toLowerCase().includes(search.toLowerCase()) || i.product?.sku?.toLowerCase().includes(search.toLowerCase())) : inventory;

  const warehouseOptions = [{ label: 'All Warehouses', value: '' }, ...(warehouses?.map((w: any) => ({ label: w.name, value: w.id })) || [])];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" subtitle="Track stock levels across all warehouses" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Products" value={summary?.totalProducts || 0} icon={<Package size={20} />} gradient="stat-gradient-blue" loading={summaryLoading} />
        <StatCard title="Inventory Value" value={formatCurrency(summary?.inventoryValue || 0)} icon={<Warehouse size={20} />} gradient="stat-gradient-green" loading={summaryLoading} />
        <StatCard title="Low Stock Items" value={summary?.lowStockItems || 0} icon={<AlertTriangle size={20} />} gradient="stat-gradient-amber" loading={summaryLoading} />
        <StatCard title="Out of Stock" value={summary?.outOfStock || 0} icon={<TrendingDown size={20} />} gradient="stat-gradient-rose" loading={summaryLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Inventory table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="flex-1 min-w-48" />
            <Select value={warehouseFilter} onChange={setWarehouseFilter} options={warehouseOptions} className="w-48" />
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${lowStockOnly ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <AlertTriangle size={14} className="inline mr-1.5" />
              Low Stock Only
            </button>
          </div>

          <Card padding={false}>
            {isLoading ? <div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div> : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr>
                    <th>Product</th><th>Warehouse</th><th>Stock</th><th>Min</th><th>Value</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((inv: any) => {
                      const isLow = inv.quantity <= inv.minQuantity && inv.minQuantity > 0;
                      const isOut = inv.quantity === 0;
                      return (
                        <tr key={`${inv.productId}-${inv.warehouseId}`}>
                          <td>
                            <p className="font-medium text-slate-800">{inv.product?.name}</p>
                            <span className="font-mono text-xs text-slate-400">{inv.product?.sku}</span>
                          </td>
                          <td>
                            <p className="text-sm text-slate-600">{inv.warehouse?.name}</p>
                            <p className="text-xs text-slate-400">{inv.warehouse?.code}</p>
                          </td>
                          <td>
                            <p className={`font-bold text-lg ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                              {inv.quantity}
                            </p>
                            <p className="text-xs text-slate-400">{inv.product?.unit}</p>
                          </td>
                          <td><p className="text-sm text-slate-500">{inv.minQuantity}</p></td>
                          <td><p className="text-sm font-medium text-slate-700">{formatCurrency(inv.quantity * (inv.product?.costPrice || 0))}</p></td>
                          <td>
                            {isOut ? <span className="badge-danger">Out of Stock</span>
                              : isLow ? <span className="badge-warning">Low Stock</span>
                              : <span className="badge-success">In Stock</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No inventory records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Stock movements + Warehouse overview */}
        <div className="space-y-6">
          {/* Warehouses */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Warehouses</h3>
            <div className="space-y-3">
              {warehouses?.map((w: any) => (
                <div key={w.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Warehouse size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{w.name}</p>
                    <p className="text-xs text-slate-400">{w.code} · {w.city}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{w._count?.inventory || 0} SKUs</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Movements */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Movements</h3>
            <div className="space-y-2">
              {movements?.slice(0, 8).map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : m.type === 'OUT' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {m.type === 'IN' ? '↑' : m.type === 'OUT' ? '↓' : '~'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{m.product?.name}</p>
                    <p className="text-[10px] text-slate-400">{m.reason}</p>
                  </div>
                  <span className={`text-xs font-bold ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.type === 'IN' ? '+' : '-'}{m.quantityChanged}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
