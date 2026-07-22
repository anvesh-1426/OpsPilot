import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Building2, Mail, Phone, Globe, DollarSign, FileText, Bell } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Button, LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'company' | 'general' | 'notifications' | 'profile'>('company');
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => { const { data } = await api.get('/settings'); return data.data; },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put('/settings', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});
  React.useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: <Building2 size={15} /> },
    { id: 'general', label: 'General', icon: <Globe size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'profile', label: 'My Profile', icon: <Mail size={15} /> },
  ];

  if (isLoading) return <div className="py-32"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your OpsPilot workspace" />

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-52 shrink-0">
          <Card>
            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === t.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          <form onSubmit={handleSave}>
            {activeTab === 'company' && (
              <Card>
                <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2"><Building2 size={18} /> Company Information</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="form-label">Company Name</label>
                    <input className="form-input" value={form.company_name || ''} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Company Email</label>
                    <input type="email" className="form-input" value={form.company_email || ''} onChange={(e) => setForm({ ...form, company_email: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.company_phone || ''} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Address</label>
                    <textarea rows={2} className="form-input resize-none" value={form.company_address || ''} onChange={(e) => setForm({ ...form, company_address: e.target.value })} />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'general' && (
              <Card>
                <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2"><Globe size={18} /> General Settings</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Currency</label>
                    <select className="form-select" value={form.currency || 'USD'} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                      {['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Fiscal Year Start</label>
                    <input className="form-input" value={form.fiscal_year_start || '01-01'} onChange={(e) => setForm({ ...form, fiscal_year_start: e.target.value })} placeholder="MM-DD" />
                  </div>
                  <div>
                    <label className="form-label">Invoice Prefix</label>
                    <input className="form-input" value={form.invoice_prefix || 'INV'} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Order Prefix</label>
                    <input className="form-input" value={form.order_prefix || 'ORD'} onChange={(e) => setForm({ ...form, order_prefix: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Tax Name</label>
                    <input className="form-input" value={form.tax_name || 'GST'} onChange={(e) => setForm({ ...form, tax_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Default Tax %</label>
                    <input type="number" className="form-input" value={form.default_tax_percent || '18'} onChange={(e) => setForm({ ...form, default_tax_percent: e.target.value })} />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2"><Bell size={18} /> Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'low_stock_notification', label: 'Low Stock Alerts', desc: 'Get notified when product stock falls below minimum threshold' },
                    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, [item.key]: form[item.key] === 'true' ? 'false' : 'true' })}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${form[item.key] === 'true' ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[item.key] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'profile' && (
              <Card>
                <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2"><Mail size={18} /> My Profile</h3>
                <div className="flex items-center gap-5 mb-6 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                    {user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="badge-info mt-1 inline-block">{user?.role}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">To update your profile details, please contact your administrator.</p>
              </Card>
            )}

            {/* Save button */}
            {activeTab !== 'profile' && (
              <div className="flex items-center justify-end gap-3 mt-4">
                {saved && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">✓ Settings saved!</span>}
                <Button type="submit" icon={<Save size={15} />} loading={updateMutation.isPending}>Save Settings</Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
