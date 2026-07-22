import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, change, icon, gradient, loading }) => {
  if (loading) {
    return (
      <div className="card-premium p-6">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className="card-premium p-6 group hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {typeof change === 'number' && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', change >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change).toFixed(1)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ml-4', gradient)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; padding?: boolean }> = ({ children, className, padding = true }) => (
  <div className={cn('card-premium', padding && 'p-6', className)}>{children}</div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton', className)} />
);

export const Badge: React.FC<{ status: string; children: React.ReactNode }> = ({ status, children }) => {
  const colorMap: Record<string, string> = {
    success: 'badge-success', warning: 'badge-warning', danger: 'badge-danger',
    info: 'badge-info', neutral: 'badge-neutral', purple: 'badge-purple',
    ACTIVE: 'badge-success', INACTIVE: 'badge-neutral', PROSPECT: 'badge-info',
    DELIVERED: 'badge-success', SHIPPED: 'badge-info', CONFIRMED: 'badge-purple',
    PROCESSING: 'badge-warning', DRAFT: 'badge-neutral', CANCELLED: 'badge-danger',
    PAID: 'badge-success', SENT: 'badge-info', OVERDUE: 'badge-danger',
    NEW: 'badge-info', CONTACTED: 'badge-purple', QUALIFIED: 'badge-warning',
    CLOSED_WON: 'badge-success', CLOSED_LOST: 'badge-danger',
    IN: 'badge-success', OUT: 'badge-danger', ADJUSTMENT: 'badge-warning',
  };
  return <span className={colorMap[status] || 'badge-neutral'}>{children}</span>;
};

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-400 max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center">
      <div className={cn('border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin', sizes[size])} />
    </div>
  );
};

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Search...', className }) => (
  <div className={cn('relative', className)}>
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="form-input pl-9"
    />
  </div>
);

export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}> = ({ page, totalPages, total, limit, onPageChange }) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">Showing <span className="font-medium">{start}–{end}</span> of <span className="font-medium">{total}</span></p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 text-xs rounded-lg border transition-colors',
                p === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ open, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full', sizes[size])}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, loading, className, icon }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </button>
  );
};

export const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={cn('form-select', className)}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
