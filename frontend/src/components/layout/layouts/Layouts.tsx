import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, ArrowLeft } from 'lucide-react';

// 1. Auth Layout
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    {children}
  </div>
);

// 2. Dashboard Layout
export const DashboardLayout: React.FC = () => (
  <div className="flex h-screen bg-background overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 240 }}>
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  </div>
);

// 3. Settings Layout
export const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-6 max-w-6xl mx-auto p-6">
    <div className="border-b border-slate-200 pb-4">
      <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
      <p className="text-sm text-slate-500">Configure business policies, security, and integration parameters</p>
    </div>
    {children}
  </div>
);

// 4. Reports Layout
export const ReportsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enterprise Reporting Engine</h1>
        <p className="text-sm text-slate-500">Exportable executive & operational statements</p>
      </div>
    </div>
    {children}
  </div>
);

// 5. Error Layout
export const ErrorLayout: React.FC<{ statusCode?: number; title?: string; message?: string }> = ({
  statusCode = 404, title = 'Page Not Found', message = 'The requested resource could not be found or has been moved.'
}) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-1">{statusCode}</h1>
      <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  </div>
);

// 6. Public Layout
export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-900 text-white">
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8">
      <div className="flex items-center gap-2 font-bold text-lg">
        <Zap className="text-blue-500" size={20} /> OpsPilot Enterprise
      </div>
      <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold">Sign In</Link>
    </header>
    <main>{children}</main>
  </div>
);
