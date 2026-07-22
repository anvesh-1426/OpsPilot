import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle, ArrowRight, Truck, Sparkles, Shield, FileText, CheckCircle2, SunMedium } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Card, Badge, Skeleton } from '../../components/ui';
import { formatCurrency, formatIndianShortCurrency } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeRoleView, setActiveRoleView] = useState<string>(user?.role || 'ADMIN');
  const [chartTimeframe, setChartTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const { data } = await api.get('/stats'); return data.data; },
  });

  const { data: revenueChart, isLoading: chartLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => { const { data } = await api.get('/revenue-chart'); return data.data; },
  });

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => { const { data } = await api.get('/recent-activity'); return data.data; },
  });

  const { data: aiSummary } = useQuery({
    queryKey: ['ai-executive-summary'],
    queryFn: async () => { const { data } = await api.get('/ai-finance/ai/executive-summary'); return data.data; },
  });

  const revenueChange = stats
    ? stats.revenue.last > 0 ? ((stats.revenue.current - stats.revenue.last) / stats.revenue.last) * 100 : 0
    : undefined;

  return (
    <div className="space-y-6">
      {/* Top Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-8 shadow-xl shadow-blue-500/15">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100">OpsPilot Executive Hub</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-blue-100 font-medium">
              <SunMedium size={14} className="text-amber-300" />
              <span>78°F Sunny • Hyderabad, India</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{greeting}, {user?.name}!</h1>
          <p className="text-blue-100 text-sm mt-1">Here is your operational overview, interconnected workflow alerts, and real-time revenue analytics.</p>
        </div>

        {/* Role View Switcher */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold mb-1.5 px-2">Dashboard Role Viewport</p>
          <div className="flex gap-1.5">
            {['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveRoleView(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeRoleView === role ? 'bg-white text-blue-700 shadow-md scale-105' : 'text-blue-100 hover:bg-white/10'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Personalized KPI Cards */}
      {activeRoleView === 'ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Monthly Revenue" value={formatCurrency(stats?.revenue.current || 0)} change={revenueChange} icon={<DollarSign size={22} />} gradient="stat-gradient-blue" loading={statsLoading} />
          <StatCard title="Net Monthly Profit" value={formatCurrency((stats?.revenue.current || 0) - (stats?.expenses || 0))} subtitle="Estimated margin" icon={<TrendingUp size={22} />} gradient="stat-gradient-green" loading={statsLoading} />
          <StatCard title="Active System Users" value="4 Team Reps" subtitle="Admin, Sales, Warehouse, Accounts" icon={<Users size={22} />} gradient="stat-gradient-purple" />
          <StatCard title="Server Health & Latency" value="99.98% / 12ms" subtitle="All microservices healthy" icon={<Shield size={22} />} gradient="stat-gradient-teal" />
        </div>
      )}

      {activeRoleView === 'SALES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Sales" value={formatCurrency((stats?.revenue.current || 0) / 30)} icon={<DollarSign size={22} />} gradient="stat-gradient-blue" />
          <StatCard title="Monthly Sales Target" value="₹25,00,000" subtitle="78% of goal achieved" icon={<TrendingUp size={22} />} gradient="stat-gradient-green" />
          <StatCard title="Customer Follow-ups" value="8 Pending" subtitle="Leads requiring response" icon={<Users size={22} />} gradient="stat-gradient-purple" />
          <StatCard title="Pending Quotations" value="12 Open" subtitle="Quotes awaiting client sign-off" icon={<FileText size={22} />} gradient="stat-gradient-amber" />
        </div>
      )}

      {activeRoleView === 'WAREHOUSE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Stock Units" value="12,450 Units" icon={<Package size={22} />} gradient="stat-gradient-blue" />
          <StatCard title="Pending Dispatch Requests" value={`${stats?.orders.pending || 0} Orders`} icon={<Truck size={22} />} gradient="stat-gradient-amber" />
          <StatCard title="Goods Receiving Logs" value="4 POs Today" icon={<Package size={22} />} gradient="stat-gradient-green" />
          <StatCard title="Low Stock Alerts" value="8 SKUs" subtitle="Action required" icon={<AlertTriangle size={22} />} gradient="stat-gradient-rose" />
        </div>
      )}

      {activeRoleView === 'ACCOUNTS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Payments Received" value={formatCurrency(stats?.revenue.current || 0)} icon={<DollarSign size={22} />} gradient="stat-gradient-green" />
          <StatCard title="Monthly Expenses" value={formatCurrency(stats?.expenses || 0)} icon={<DollarSign size={22} />} gradient="stat-gradient-rose" />
          <StatCard title="Net Cash Flow" value={formatCurrency((stats?.revenue.current || 0) - (stats?.expenses || 0))} icon={<TrendingUp size={22} />} gradient="stat-gradient-blue" />
          <StatCard title="Unpaid Invoices (AR)" value="₹4,28,000" subtitle="Pending receivables" icon={<FileText size={22} />} gradient="stat-gradient-amber" />
        </div>
      )}

      {/* AI Business Executive Summary Card */}
      {aiSummary && (
        <Card className="border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-violet-50/50">
          <div className="flex items-center gap-2.5 mb-4 text-blue-700">
            <Sparkles size={20} className="animate-pulse text-blue-600" />
            <h3 className="text-base font-bold tracking-tight">{aiSummary.title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2 bg-white/80 p-4 rounded-xl border border-slate-100 shadow-xs">
              <p className="font-semibold text-slate-800">Weekly Performance Highlights</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {aiSummary.highlights?.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5"><CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />{h}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 bg-white/80 p-4 rounded-xl border border-slate-100 shadow-xs">
              <p className="font-semibold text-slate-800">AI Recommendations</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {aiSummary.aiRecommendations?.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5"><ArrowRight size={13} className="text-blue-500 shrink-0 mt-0.5" />{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Revenue Analytics</h2>
                <p className="text-xs text-slate-400 mt-0.5">Historical revenue trajectory</p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['monthly', 'quarterly', 'yearly'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-semibold capitalize rounded-lg transition-all ${
                      chartTimeframe === tf ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div className="h-64 flex items-center justify-center"><Skeleton className="w-full h-full" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatIndianShortCurrency(v)} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revenueGrad)" name="revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Quick Activity Column */}
        <div className="space-y-6">
          <Card padding={false}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Recent Orders</h2>
              <Link to="/sales/orders" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {activity?.recentOrders?.slice(0, 4).map((order: any) => (
                <div key={order.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50/70 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <ShoppingCart size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{order.orderNumber}</p>
                    <p className="text-[11px] text-slate-500 truncate">{order.customer?.name}</p>
                  </div>
                  <Badge status={order.status}>{order.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
