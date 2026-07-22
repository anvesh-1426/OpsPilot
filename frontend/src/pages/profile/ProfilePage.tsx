import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader, Card, Button } from '../../components/ui';
import { User, Shield, Lock, Bell, Moon, Sun, CheckCircle, Save } from 'lucide-react';
import api from '../../lib/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(''); setPassErr('');
    if (newPassword !== confirmPassword) { setPassErr('New passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPassMsg('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPassErr(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title="User Profile & Account" subtitle="Manage your personal details, credentials, and settings" />

      {/* Header Profile Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20 shrink-0">
            {user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
              <span className="badge-purple font-semibold">{user?.role}</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-2">OpsPilot Enterprise Member</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security / Password Change */}
        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-blue-600" /> Security & Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl flex items-center gap-2"><CheckCircle size={16} />{passMsg}</div>}
            {passErr && <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl">{passErr}</div>}

            <div>
              <label className="form-label">Current Password</label>
              <input type="password" required className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" required minLength={6} className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" required className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <Button type="submit" loading={loading} icon={<Save size={15} />}>Update Password</Button>
          </form>
        </Card>

        {/* Preferences */}
        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Shield size={18} className="text-violet-600" /> Account Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-800">Interface Theme</p>
                <p className="text-xs text-slate-400 mt-0.5">Switch between dark and light workspace mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                {theme === 'dark' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-blue-500" />}
                <span className="capitalize">{theme} Mode</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-800 mb-2">Role Permissions Summary</p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                {user?.role === 'ADMIN' && <li>Full system access (Users, Audit Logs, Settings, Financials)</li>}
                {user?.role === 'SALES' && <li>Access to Customers CRM, Sales Orders, Invoices, and Quotations</li>}
                {user?.role === 'WAREHOUSE' && <li>Access to Inventory, Multi-Warehouse, Stock Movements, PO Receipts</li>}
                {user?.role === 'ACCOUNTS' && <li>Access to Expenses, Financial P&L, Payment Verification, Reports</li>}
                <li>Audit logging active for all account actions</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
