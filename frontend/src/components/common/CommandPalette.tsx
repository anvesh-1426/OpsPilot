import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ShoppingCart, Package, Warehouse, DollarSign, BarChart3, Settings, Shield, FileText, X } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        open ? onClose() : null;
      }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const items = [
    { label: 'Go to Dashboard', icon: <BarChart3 size={16} />, href: '/', cat: 'Navigation' },
    { label: 'Customers CRM', icon: <Users size={16} />, href: '/crm/customers', cat: 'CRM' },
    { label: 'Leads Pipeline', icon: <Users size={16} />, href: '/crm/leads', cat: 'CRM' },
    { label: 'Sales Orders', icon: <ShoppingCart size={16} />, href: '/sales/orders', cat: 'Sales' },
    { label: 'Invoices & Payments', icon: <FileText size={16} />, href: '/sales/invoices', cat: 'Sales' },
    { label: 'Purchase Orders', icon: <Package size={16} />, href: '/procurement/purchase-orders', cat: 'Procurement' },
    { label: 'Suppliers Catalog', icon: <Package size={16} />, href: '/procurement/suppliers', cat: 'Procurement' },
    { label: 'Product Catalog', icon: <Package size={16} />, href: '/products', cat: 'Inventory' },
    { label: 'Multi-Warehouse', icon: <Warehouse size={16} />, href: '/warehouse', cat: 'Inventory' },
    { label: 'Financial Suite', icon: <DollarSign size={16} />, href: '/financials', cat: 'Finance' },
    { label: 'Enterprise Analytics', icon: <BarChart3 size={16} />, href: '/analytics', cat: 'Analytics' },
    { label: 'User Admin & Audit', icon: <Shield size={16} />, href: '/admin', cat: 'Admin' },
    { label: 'Workspace Settings', icon: <Settings size={16} />, href: '/settings', cat: 'Settings' },
  ];

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()) || i.cat.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-white z-50"
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search modules... (e.g. Sales, Customers)"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <kbd className="px-2 py-0.5 bg-slate-800 text-[10px] font-mono text-slate-400 rounded">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-500">No matching commands found</p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-600/20 hover:text-blue-300 text-slate-300 text-xs font-medium transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 group-hover:text-blue-400">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md font-mono">{item.cat}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Linear-style Command Palette</span>
          <span>Press <strong>ESC</strong> to exit</span>
        </div>
      </motion.div>
    </div>
  );
};
