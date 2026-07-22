import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setSent(true); // Don't expose whether email exists
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
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email to receive recovery instructions</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
              <p className="text-slate-200 text-sm font-medium">Recovery instructions sent to <strong>{email}</strong></p>
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:underline pt-2">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Work Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white text-sm rounded-xl transition-all"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
