import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Scale, ShieldCheck, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, StatCard, LoadingSpinner, Button } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';

export const FinancialsPage: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState<'balance' | 'cashflow' | 'ar_ap' | 'tax'>('balance');

  const { data: finData, isLoading } = useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: async () => { const { data } = await api.get('/ai-finance/finance/dashboard'); return data.data; },
  });

  if (isLoading) return <div className="py-28"><LoadingSpinner /></div>;

  const bs = finData?.balanceSheet || {};
  const cf = finData?.cashFlow || {};
  const tax = finData?.taxSummary || {};

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Suite" subtitle="Balance Sheet, Cash Flow, AR/AP, and Tax Compliance" />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cash & Equivalents" value={formatCurrency(bs.assets?.currentAssets?.cashAndEquivalents || 0)} icon={<DollarSign size={20} />} gradient="stat-gradient-blue" />
        <StatCard title="Accounts Receivable (AR)" value={formatCurrency(finData?.accountsReceivable || 0)} icon={<ArrowUpRight size={20} />} gradient="stat-gradient-green" />
        <StatCard title="Accounts Payable (AP)" value={formatCurrency(finData?.accountsPayable || 0)} icon={<ArrowDownRight size={20} />} gradient="stat-gradient-rose" />
        <StatCard title="Total Assets" value={formatCurrency(bs.assets?.totalAssets || 0)} icon={<Scale size={20} />} gradient="stat-gradient-purple" />
      </div>

      {/* Subtabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'balance', label: 'Balance Sheet' },
          { id: 'cashflow', label: 'Cash Flow Statement' },
          { id: 'ar_ap', label: 'AR & AP Breakdown' },
          { id: 'tax', label: 'Tax & GST Summary' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSubtab(t.id as any)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeSubtab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSubtab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets */}
          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Assets</span>
              <span className="text-blue-600 font-extrabold">{formatCurrency(bs.assets?.totalAssets || 0)}</span>
            </h3>
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-slate-700">Current Assets</p>
                <div className="flex justify-between text-slate-600 pl-3"><span>Cash & Equivalents</span><span>{formatCurrency(bs.assets?.currentAssets?.cashAndEquivalents || 0)}</span></div>
                <div className="flex justify-between text-slate-600 pl-3"><span>Accounts Receivable</span><span>{formatCurrency(bs.assets?.currentAssets?.accountsReceivable || 0)}</span></div>
                <div className="flex justify-between text-slate-600 pl-3"><span>Inventory Valuation</span><span>{formatCurrency(bs.assets?.currentAssets?.inventoryValuation || 0)}</span></div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100"><span>Total Current Assets</span><span>{formatCurrency(bs.assets?.currentAssets?.totalCurrentAssets || 0)}</span></div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-700">Fixed Assets</p>
                <div className="flex justify-between text-slate-600 pl-3"><span>Property, Plant & Equipment</span><span>{formatCurrency(bs.assets?.fixedAssets?.equipmentAndProperty || 0)}</span></div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100"><span>Total Fixed Assets</span><span>{formatCurrency(bs.assets?.fixedAssets?.totalFixedAssets || 0)}</span></div>
              </div>
            </div>
          </Card>

          {/* Liabilities & Equity */}
          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Liabilities & Equity</span>
              <span className="text-violet-600 font-extrabold">{formatCurrency((bs.liabilities?.totalLiabilities || 0) + (bs.equity?.totalEquity || 0))}</span>
            </h3>
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-slate-700">Liabilities</p>
                <div className="flex justify-between text-slate-600 pl-3"><span>Accounts Payable</span><span>{formatCurrency(bs.liabilities?.accountsPayable || 0)}</span></div>
                <div className="flex justify-between text-slate-600 pl-3"><span>Short-term Credit Lines</span><span>{formatCurrency(bs.liabilities?.shortTermLoans || 0)}</span></div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100"><span>Total Liabilities</span><span>{formatCurrency(bs.liabilities?.totalLiabilities || 0)}</span></div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-700">Equity</p>
                <div className="flex justify-between text-slate-600 pl-3"><span>Capital Stock</span><span>{formatCurrency(bs.equity?.capitalStock || 0)}</span></div>
                <div className="flex justify-between text-slate-600 pl-3"><span>Retained Earnings</span><span>{formatCurrency(bs.equity?.retainedEarnings || 0)}</span></div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100"><span>Total Equity</span><span>{formatCurrency(bs.equity?.totalEquity || 0)}</span></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSubtab === 'cashflow' && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Cash Flow Statement</h3>
          <div className="space-y-4 text-sm max-w-2xl">
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Operating Cash Inflow (Customer Payments)</span><span className="font-semibold text-emerald-600">+{formatCurrency(cf.operatingInflow || 0)}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Operating Cash Outflow (Expenses & Costs)</span><span className="font-semibold text-rose-600">-{formatCurrency(cf.operatingOutflow || 0)}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-200 font-bold"><span className="text-slate-800">Net Operating Cash Flow</span><span className="text-blue-600">{formatCurrency(cf.netOperatingCashFlow || 0)}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Investing Activities (Equipment/Tech)</span><span className="font-semibold text-slate-700">{formatCurrency(cf.investingCashFlow || 0)}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Financing Activities (Capital Injections)</span><span className="font-semibold text-emerald-600">+{formatCurrency(cf.financingCashFlow || 0)}</span></div>
            <div className="flex justify-between py-3 border-t-2 border-slate-900 font-extrabold text-base"><span className="text-slate-900">Total Net Cash Flow</span><span className="text-emerald-600">+{formatCurrency(cf.totalNetCashFlow || 0)}</span></div>
          </div>
        </Card>
      )}

      {activeSubtab === 'tax' && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tax & GST Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <p className="text-xs text-slate-500 mb-1">Output Tax Collected (Sales)</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(tax.totalTaxCollected || 0)}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <p className="text-xs text-slate-500 mb-1">Input Tax Credit (Expenses)</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(tax.totalTaxPaidOnExpenses || 0)}</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-2xl">
              <p className="text-xs text-slate-500 mb-1">Net Tax Payable to Govt</p>
              <p className="text-2xl font-bold text-violet-700">{formatCurrency(tax.netTaxPayable || 0)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
