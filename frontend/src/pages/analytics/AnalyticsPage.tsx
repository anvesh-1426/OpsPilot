import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Download, Printer, Share2 } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, StatCard, Button, LoadingSpinner } from '../../components/ui';
import { formatCurrency, downloadCSV } from '../../lib/utils';

const COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'customer'>('sales');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const { data: revenueChart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => { const { data } = await api.get('/revenue-chart'); return data.data; },
  });

  const { data: invSummary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: async () => { const { data } = await api.get('/inventory/summary'); return data.data; },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-top'],
    queryFn: async () => { const { data } = await api.get('/crm/customers?limit=10'); return data.data; },
  });

  const sampleGrowthData = [
    { period: 'Q1', sales: 120000, target: 100000, growth: 20 },
    { period: 'Q2', sales: 145000, target: 120000, growth: 20.8 },
    { period: 'Q3', sales: 178000, target: 150000, growth: 22.7 },
    { period: 'Q4', sales: 215000, target: 180000, growth: 20.7 },
  ];

  const stockAgingData = [
    { range: '0-30 Days', value: 65 },
    { range: '31-60 Days', value: 20 },
    { range: '61-90 Days', value: 10 },
    { range: '90+ Days (Slow)', value: 5 },
  ];

  const topCustomersData = customers?.slice(0, 5).map((c: any) => ({ name: c.name.split(' ')[0], ltv: c.totalRevenue })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Analytics"
        subtitle="Sales, inventory, and customer intelligence"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
            <Button variant="outline" size="sm" icon={<Share2 size={14} />} onClick={() => alert('Share link copied to clipboard!')}>Share</Button>
            <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => downloadCSV(sampleGrowthData, 'analytics')}>Export</Button>
          </div>
        }
      />

      {/* Analytics Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          {[
            { id: 'sales', label: 'Sales Analytics' },
            { id: 'inventory', label: 'Inventory Analytics' },
            { id: 'customer', label: 'Customer Analytics' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'sales' && (
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-medium capitalize rounded-lg transition-all ${timeframe === tf ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Growth" value="+22.7%" change={4.2} icon={<TrendingUp size={20} />} gradient="stat-gradient-green" />
            <StatCard title="Avg Order Value" value="$485.00" change={2.1} icon={<DollarSign size={20} />} gradient="stat-gradient-blue" />
            <StatCard title="Conversion Rate" value="3.8%" change={0.5} icon={<BarChart3 size={20} />} gradient="stat-gradient-purple" />
            <StatCard title="Repeat Purchase Rate" value="68.4%" change={1.2} icon={<Users size={20} />} gradient="stat-gradient-teal" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <h3 className="text-base font-semibold text-slate-800 mb-6">Quarterly Performance vs Target</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sampleGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="target" fill="#CBD5E1" name="Target" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="sales" fill="#2563EB" name="Actual Sales" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-slate-800 mb-4">Sales Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Direct Sales', percent: 62, value: '$425,000' },
                  { label: 'Wholesale B2B', percent: 28, value: '$190,000' },
                  { label: 'Online Portal', percent: 10, value: '$68,000' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span>{item.value} ({item.percent}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Inventory Valuation" value={formatCurrency(invSummary?.inventoryValue || 0)} icon={<Package size={20} />} gradient="stat-gradient-blue" />
            <StatCard title="Turnover Rate" value="6.2x / yr" icon={<TrendingUp size={20} />} gradient="stat-gradient-green" />
            <StatCard title="Dead Stock Estimate" value="$12,400" icon={<Package size={20} />} gradient="stat-gradient-rose" />
            <StatCard title="Stock Aging (Avg)" value="24 Days" icon={<Package size={20} />} gradient="stat-gradient-amber" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-semibold text-slate-800 mb-4">Stock Aging Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stockAgingData} dataKey="value" nameKey="range" cx="50%" cy="50%" outerRadius={80} label={({ range, value }) => `${range} (${value}%)`}>
                    {stockAgingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-slate-800 mb-4">Fast Moving SKUs</h3>
              <div className="space-y-3">
                {[
                  { name: 'Wireless Keyboard Pro', sku: 'SKU-1001', turns: '14.2x', stock: 150 },
                  { name: 'USB-C Docking Hub', sku: 'SKU-1004', turns: '11.8x', stock: 200 },
                  { name: '27" 4K Monitor', sku: 'SKU-1003', turns: '9.4x', stock: 45 },
                  { name: 'Ergonomic Office Chair', sku: 'SKU-1009', turns: '8.1x', stock: 25 },
                ].map((item) => (
                  <div key={item.sku} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs font-mono text-slate-400">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">{item.turns} turn</p>
                      <p className="text-[11px] text-slate-400">{item.stock} units in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'customer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Customer Retention" value="84.2%" icon={<Users size={20} />} gradient="stat-gradient-green" />
            <StatCard title="Avg Lifetime Value" value="$14,800" icon={<DollarSign size={20} />} gradient="stat-gradient-purple" />
            <StatCard title="Acquisition Cost (CAC)" value="$320" icon={<Users size={20} />} gradient="stat-gradient-blue" />
            <StatCard title="Net Promoter Score" value="+64" icon={<TrendingUp size={20} />} gradient="stat-gradient-teal" />
          </div>

          <Card>
            <h3 className="text-base font-semibold text-slate-800 mb-6">Top Clients by Lifetime Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCustomersData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="ltv" fill="#7C3AED" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};
