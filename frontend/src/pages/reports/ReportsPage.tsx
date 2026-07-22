import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BarChart3, Download } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, StatCard, Button, LoadingSpinner } from '../../components/ui';
import { formatCurrency, formatDate, downloadCSV, formatIndianShortCurrency } from '../../lib/utils';

export const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: salesReport, isLoading } = useQuery({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
      return data.data;
    },
  });

  const { data: plData } = useQuery({
    queryKey: ['pl-summary', new Date().getFullYear()],
    queryFn: async () => { const { data } = await api.get('/accounts/pl-summary'); return data.data; },
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => { const { data } = await api.get('/revenue-chart'); return data.data; },
  });

  const orders = salesReport?.orders || [];
  const ordersByStatus = orders.reduce((acc: any, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(ordersByStatus).map(([name, value]) => ({ name, value }));

  const STATUS_COLORS: Record<string, string> = { DELIVERED: '#10B981', SHIPPED: '#3B82F6', CONFIRMED: '#8B5CF6', PROCESSING: '#F59E0B', DRAFT: '#94A3B8', CANCELLED: '#F43F5E' };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Sales analytics and business insights"
        actions={
          <Button variant="outline" icon={<Download size={16} />} onClick={() => downloadCSV(orders, 'sales-report')}>
            Export CSV
          </Button>
        }
      />

      {/* Date range filter */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4">
        <span className="text-sm font-medium text-slate-500">Date Range:</span>
        <input type="date" className="form-input py-1.5 text-sm w-40" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span className="text-slate-400">→</span>
        <input type="date" className="form-input py-1.5 text-sm w-40" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(salesReport?.totalRevenue || 0)} icon={<BarChart3 size={20} />} gradient="stat-gradient-blue" />
        <StatCard title="Orders" value={orders.length} icon={<BarChart3 size={20} />} gradient="stat-gradient-purple" />
        <StatCard title="Net Profit" value={formatCurrency(plData?.netProfit || 0)} icon={<BarChart3 size={20} />} gradient="stat-gradient-green" />
        <StatCard title="Profit Margin" value={`${(plData?.profitMargin || 0).toFixed(1)}%`} icon={<BarChart3 size={20} />} gradient="stat-gradient-teal" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Monthly */}
        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-6">Revenue vs Expenses (Monthly)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={plData?.monthly || []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatIndianShortCurrency(v)} />
              <Tooltip formatter={(val: any) => formatCurrency(val)} />
              <Legend />
              <Bar dataKey="income" fill="#2563EB" name="Revenue" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="expenses" fill="#F43F5E" name="Expenses" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-6">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue trend */}
        <Card className="xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-800 mb-6">12-Month Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueChart || []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatIndianShortCurrency(v)} />
              <Tooltip formatter={(val: any) => formatCurrency(val)} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 3 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Orders table */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Orders in Period</h3>
          <span className="badge-info">{orders.length} orders</span>
        </div>
        {isLoading ? <div className="py-12"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto max-h-96 scrollbar-thin">
            <table className="data-table">
              <thead><tr>
                <th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th>
              </tr></thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id}>
                    <td><span className="font-mono font-bold text-slate-800 text-xs">{o.orderNumber}</span></td>
                    <td><p className="font-medium text-slate-700">{o.customer?.name}</p></td>
                    <td><p className="text-sm text-slate-500">{formatDate(o.createdAt)}</p></td>
                    <td><p className="text-sm text-slate-600">{o.items?.length}</p></td>
                    <td><p className="font-bold text-slate-800">{formatCurrency(o.total)}</p></td>
                    <td>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full`} style={{ background: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No orders in selected period</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
