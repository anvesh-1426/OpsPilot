import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ShoppingCart, Package, Warehouse,
  DollarSign, BarChart3, Settings, LogOut, ChevronLeft,
  ChevronRight, ChevronDown, Briefcase, FileText, TrendingUp, Shield, Zap, Building2, HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, getInitials } from '../../lib/utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[];
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/' },
  { label: 'CRM', icon: <Users size={18} />, href: '/crm', roles: ['ADMIN', 'SALES'],
    children: [{ label: 'Customers', href: '/crm/customers' }, { label: 'Leads', href: '/crm/leads' }] },
  { label: 'Sales', icon: <ShoppingCart size={18} />, href: '/sales', roles: ['ADMIN', 'SALES'],
    children: [
      { label: 'Orders', href: '/sales/orders' },
      { label: 'Invoices', href: '/sales/invoices' },
      { label: 'Quotations', href: '/sales/quotations' },
      { label: 'Delivery Challans', href: '/sales/challans' },
    ] },
  { label: 'Procurement', icon: <Briefcase size={18} />, href: '/procurement', roles: ['ADMIN', 'WAREHOUSE'],
    children: [
      { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
      { label: 'Suppliers', href: '/procurement/suppliers' },
    ] },
  { label: 'Products', icon: <Package size={18} />, href: '/products' },
  { label: 'Inventory', icon: <TrendingUp size={18} />, href: '/inventory' },
  { label: 'Warehouse', icon: <Warehouse size={18} />, href: '/warehouse', roles: ['ADMIN', 'WAREHOUSE'] },
  { label: 'Accounts', icon: <DollarSign size={18} />, href: '/accounts', roles: ['ADMIN', 'ACCOUNTS'] },
  { label: 'Financial Suite', icon: <DollarSign size={18} />, href: '/financials', roles: ['ADMIN', 'ACCOUNTS'] },
  { label: 'Analytics', icon: <BarChart3 size={18} />, href: '/analytics' },
  { label: 'Reports', icon: <FileText size={18} />, href: '/reports' },
  { label: 'Admin', icon: <Shield size={18} />, href: '/admin', roles: ['ADMIN'] },
  { label: 'Profile', icon: <Users size={18} />, href: '/profile' },
  { label: 'Settings', icon: <Settings size={18} />, href: '/settings' },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [workspace, setWorkspace] = useState('Acme Wholesale HQ');
  const [openGroups, setOpenGroups] = useState<string[]>(['CRM', 'Sales', 'Procurement']);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]);
  };

  const visibleItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40 text-slate-300 select-none shadow-2xl"
    >
      {/* Brand Header & Workspace Switcher */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-500/30">
              <Zap size={18} />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-white text-sm tracking-wide block truncate">OpsPilot ERP</span>
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="bg-transparent text-[10px] text-slate-400 font-semibold outline-none cursor-pointer hover:text-slate-200 truncate"
              >
                <option value="Acme Wholesale HQ" className="bg-slate-900 text-slate-200">Acme Wholesale HQ</option>
                <option value="Global Logistics Hub" className="bg-slate-900 text-slate-200">Global Logistics Hub</option>
                <option value="West Coast Hub" className="bg-slate-900 text-slate-200">West Coast Hub</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">
            <Zap size={18} />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const groupOpen = openGroups.includes(item.label);

          if (hasChildren && !collapsed) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'sidebar-item w-full justify-between',
                    active && 'bg-slate-800 text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform', groupOpen && 'rotate-180')}
                  />
                </button>
                {groupOpen && (
                  <div className="pl-9 space-y-1 border-l border-slate-800 ml-4">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          'block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          location.pathname === child.href
                            ? 'text-blue-400 bg-blue-500/10 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={hasChildren ? item.children![0].href : item.href}
              className={cn('sidebar-item', active && 'active')}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Storage Usage Bar */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mb-2 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold"><HardDrive size={13} /> Storage</span>
            <span className="text-[10px] text-blue-400 font-mono font-bold">64.2 / 100 GB</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '64%' }} />
          </div>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="px-3 py-3 border-t border-slate-800/60">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1 bg-slate-950/40">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
              {getInitials(user?.name || '')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="sidebar-item w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};
