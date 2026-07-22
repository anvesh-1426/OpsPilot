import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Loader2, AlertCircle,
  ShieldCheck, BarChart3, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── Tiny helpers ────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as any },
});
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});
const slideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as any },
});
const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as any },
});

/* ─── Feature card data ───────────────────────────────────────── */
const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    desc: 'Role-based access with enterprise-grade JWT security.',
  },
  {
    icon: Layers,
    title: 'Smart Business Operations',
    desc: 'Manage inventory, sales, warehouse, and finance from one platform.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Monitor business performance with live dashboards and reports.',
  },
];

/* ─── Input component ────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  suffix?: React.ReactNode;
}
const PremiumInput: React.FC<InputProps> = ({ icon, suffix, style, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <span
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
        style={{ color: focused ? '#3B82F6' : 'rgba(148,163,184,0.60)' }}
      >
        {icon}
      </span>
      <input
        {...rest}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        style={{
          width: '100%',
          paddingLeft: '40px',
          paddingRight: suffix ? '44px' : '16px',
          paddingTop: '12px',
          paddingBottom: '12px',
          background: focused ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.06)',
          border: focused
            ? '1px solid rgba(59,130,246,0.55)'
            : '1px solid rgba(255,255,255,0.10)',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '14px',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.14)' : 'none',
          transition: 'all 0.2s ease',
          ...style,
        }}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</span>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
export const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

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
    <div
      className="min-h-screen flex overflow-hidden relative"
      style={{ background: '#020817' }}
    >

      {/* ── Global grid texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Ambient blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-56 -left-56 w-[600px] h-[600px] rounded-full bg-blue-600/[0.09] blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-violet-700/[0.07] blur-3xl animate-pulse" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* ════════════════════════════════════════════════════════
          LEFT PANEL  (45 %)
      ════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-center relative overflow-hidden"
        style={{ width: '45%', minHeight: '100vh', flexShrink: 0 }}
      >
        {/* Left panel gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg,
              rgba(15,23,42,1) 0%,
              rgba(23,37,84,0.85) 40%,
              rgba(30,58,138,0.60) 70%,
              rgba(37,99,235,0.25) 100%)`,
          }}
        />
        {/* Decorative radial behind content */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(59,130,246,0.14) 0%, transparent 70%)',
          }}
        />
        {/* Right soft divider */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.25), transparent)' }}
        />

        {/* Decorative floating circles */}
        {[
          { size: 300, top: '-10%', left: '-8%', opacity: 0.07 },
          { size: 180, bottom: '10%', right: '5%', opacity: 0.09 },
          { size: 120, top: '55%',  left: '60%', opacity: 0.06 },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: c.size, height: c.size,
              top: (c as any).top, bottom: (c as any).bottom,
              left: (c as any).left, right: (c as any).right,
              border: `1px solid rgba(59,130,246,${c.opacity * 2.5})`,
              background: `radial-gradient(circle, rgba(59,130,246,${c.opacity}) 0%, transparent 70%)`,
            }}
          />
        ))}

        {/* ── Left content ── */}
        <div className="relative z-10 px-12 py-16 flex flex-col h-full justify-center">

          {/* Logo */}
          <motion.div {...slideLeft(0.05)} className="flex items-center gap-3.5 mb-16">
            <div
              className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                boxShadow: '0 0 32px rgba(59,130,246,0.50), 0 4px 16px rgba(37,99,235,0.35)',
              }}
            >
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white text-[22px] font-bold leading-none tracking-tight">OpsPilot</p>
              <p className="text-blue-400/70 text-[11px] mt-1 tracking-widest uppercase font-medium">Enterprise Platform</p>
            </div>
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            {...fadeIn(0.15)}
            style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '4px', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '16px' }}
          >
            Welcome to OpsPilot
          </motion.p>

          {/* Headline */}
          <motion.h1
            {...slideLeft(0.22)}
            style={{
              fontSize: 'clamp(36px, 3.5vw, 52px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.10,
              letterSpacing: '-0.025em',
              marginBottom: '20px',
            }}
          >
            Enterprise Resource<br />Planning Platform
          </motion.h1>

          {/* Description */}
          <motion.p
            {...fadeIn(0.30)}
            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: '380px', marginBottom: '48px' }}
          >
            Manage your sales, warehouse, inventory, accounts, and business operations from one intelligent dashboard.
          </motion.p>

          {/* Feature list */}
          <div className="space-y-6 mb-16">
            {features.map((f, i) => (
              <motion.div key={f.title} {...slideLeft(0.35 + i * 0.08)} className="flex gap-4 items-start">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.22)' }}
                >
                  <f.icon size={16} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.90)', marginBottom: '3px' }}>{f.title}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trusted footer */}
          <motion.div {...fadeIn(0.65)} className="flex items-center gap-3">
            {/* Mini avatar dots */}
            <div className="flex -space-x-2">
              {['#2563EB','#7C3AED','#0891B2','#059669'].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: c }}
                >
                  {['AN','VA','PR','MI'][i]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.40)' }}>
              Trusted by <span style={{ color: 'rgba(255,255,255,0.70)', fontWeight: 600 }}>Modern Businesses</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          RIGHT PANEL  (55 %)
      ════════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative px-6 py-12"
        style={{ minHeight: '100vh' }}
      >
        {/* Mobile: show logo on top */}
        <motion.div
          {...fadeIn(0.05)}
          className="flex lg:hidden items-center gap-3 mb-10"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,#3B82F6,#2563EB)',
              boxShadow: '0 0 24px rgba(59,130,246,0.45)',
            }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <p className="text-white text-lg font-bold">OpsPilot</p>
        </motion.div>

        {/* Hero text above card (mobile & desktop) */}
        <div className="text-center mb-10 w-full max-w-[420px]">
          <motion.p
            {...fadeIn(0.20)}
            style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '4px', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '14px' }}
          >
            Welcome to OpsPilot
          </motion.p>
          <motion.h2
            {...fadeUp(0.28)}
            style={{
              fontSize: 'clamp(32px,4.5vw,52px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            Welcome back
          </motion.h2>
          <motion.p
            {...fadeIn(0.36)}
            style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)' }}
          >
            Sign in to your workspace
          </motion.p>
        </div>

        {/* ── Login Card ── */}
        <motion.div
          {...slideRight(0.42)}
          className="w-full max-w-[420px] group"
          style={{
            background: 'rgba(255,255,255,0.045)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '22px',
            padding: '38px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.06) inset',
            transition: 'border 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.border = '1px solid rgba(59,130,246,0.28)';
            el.style.boxShadow = '0 12px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.10), 0 0 80px rgba(59,130,246,0.06)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.border = '1px solid rgba(255,255,255,0.09)';
            el.style.boxShadow = '0 8px 48px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.06) inset';
          }}
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(203,213,225,0.85)' }}>
                Email address
              </label>
              <PremiumInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                icon={<Mail size={16} />}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(203,213,225,0.85)' }}>
                Password
              </label>
              <PremiumInput
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                icon={<Lock size={16} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="transition-colors duration-200"
                    style={{ color: 'rgba(148,163,184,0.60)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,1)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.60)')}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            {/* Sign In */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { y: -2, scale: 1.01 } : {}}
              whileTap={!loading ? { y: 0, scale: 0.98 } : {}}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[13px] font-semibold text-white text-sm mt-2"
              style={{
                background: loading
                  ? 'linear-gradient(135deg,#1E40AF,#1E3A8A)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(59,130,246,0.45), 0 1px 2px rgba(0,0,0,0.25)',
                opacity: loading ? 0.65 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-center mb-3" style={{ color: 'rgba(148,163,184,0.55)' }}>Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin',     email: 'admin@opspilot.com' },
                { role: 'Sales',     email: 'sales@opspilot.com' },
                { role: 'Warehouse', email: 'warehouse@opspilot.com' },
                { role: 'Accounts',  email: 'accounts@opspilot.com' },
              ].map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword('password123'); }}
                  className="text-left px-3 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(59,130,246,0.10)';
                    el.style.borderColor = 'rgba(59,130,246,0.28)';
                    el.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.04)';
                    el.style.borderColor = 'rgba(255,255,255,0.07)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: 'rgba(203,213,225,0.90)' }}>{a.role}</p>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(148,163,184,0.55)' }}>{a.email}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-center mt-2.5" style={{ color: 'rgba(100,116,139,0.60)' }}>
              Password: password123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
