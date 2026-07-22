import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative bg-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-[400px] mx-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                <Zap size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-xl font-bold leading-none">OpsPilot</p>
                <p className="text-slate-400 text-xs mt-0.5">Enterprise Platform</p>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1.5">Sign in to your workspace</p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: loading ? '#1E40AF' : 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo accounts hint */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center mb-3">Demo accounts</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'Admin', email: 'admin@opspilot.com' },
                  { role: 'Sales', email: 'sales@opspilot.com' },
                  { role: 'Warehouse', email: 'warehouse@opspilot.com' },
                  { role: 'Accounts', email: 'accounts@opspilot.com' },
                ].map((a) => (
                  <button
                    key={a.role}
                    type="button"
                    onClick={() => { setEmail(a.email); setPassword('password123'); }}
                    className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <p className="text-xs font-medium text-slate-300">{a.role}</p>
                    <p className="text-[10px] text-slate-500 truncate">{a.email}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 text-center mt-2">Password: password123</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
