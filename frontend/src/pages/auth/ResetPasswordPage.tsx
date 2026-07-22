import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (newPassword !== confirm) { setErr('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Password reset token expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Zap size={24} />
            </div>
            <span className="text-white text-xl font-bold">OpsPilot</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create New Password</h1>
          <p className="text-slate-400 text-sm mt-1">Set a strong new password for your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {done ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
              <p className="text-slate-200 text-sm font-medium">Password successfully reset!</p>
              <button onClick={() => navigate('/login')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl">
                Sign In Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {err && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{err}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white text-sm rounded-xl transition-all"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
