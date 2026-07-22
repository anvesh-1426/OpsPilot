import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { AlertCircle, CheckCircle2, Info, X, ChevronDown, ChevronRight, Search, Loader2 } from 'lucide-react';

// 1. Button
export const DSButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', loading, disabled, onClick, className }) => {
  const v = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  const s = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all disabled:opacity-50', v[variant], s[size], className)}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
};

// 2. Input
export const DSInput: React.FC<{ label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, error, className, ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
    <input className={cn('form-input', error && 'border-rose-500 focus:ring-rose-200', className)} {...props} />
    {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
  </div>
);

// 3. Textarea
export const DSTextarea: React.FC<{ label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ label, className, ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
    <textarea className={cn('form-input resize-none', className)} {...props} />
  </div>
);

// 4. Checkbox
export const DSCheckbox: React.FC<{ label: string; checked: boolean; onChange: (c: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
    <span>{label}</span>
  </label>
);

// 5. Radio Button
export const DSRadio: React.FC<{ label: string; name: string; checked: boolean; onChange: () => void }> = ({ label, name, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
    <input type="radio" name={name} checked={checked} onChange={onChange} className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
    <span>{label}</span>
  </label>
);

// 6. Switch
export const DSSwitch: React.FC<{ checked: boolean; onChange: (c: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between gap-3">
    {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn('relative w-11 h-6 rounded-full transition-colors', checked ? 'bg-blue-600' : 'bg-slate-200')}
    >
      <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  </div>
);

// 7. Dropdown
export const DSDropdown: React.FC<{
  trigger: React.ReactNode;
  items: { label: string; onClick: () => void; icon?: React.ReactNode; danger?: boolean }[];
}> = ({ trigger, items }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-1">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => { it.onClick(); setOpen(false); }}
              className={cn('w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors', it.danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700')}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 8. Multi Select
export const DSMultiSelect: React.FC<{
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (s: string[]) => void;
}> = ({ options, selected, onChange }) => {
  const toggle = (val: string) => {
    selected.includes(val) ? onChange(selected.filter((s) => s !== val)) : onChange([...selected, val]);
  };
  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-xl bg-white min-h-[42px]">
      {options.map((o) => {
        const isSel = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn('px-2.5 py-1 text-xs rounded-lg font-medium transition-all', isSel ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
          >
            {o.label} {isSel ? '✓' : '+'}
          </button>
        );
      })}
    </div>
  );
};

// 9. Drawer
export const DSDrawer: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// 10. Tooltip
export const DSTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap z-50">
          {text}
        </div>
      )}
    </div>
  );
};

// 11. Popover
export const DSPopover: React.FC<{ trigger: React.ReactNode; content: React.ReactNode }> = ({ trigger, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute left-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[200px]">
          {content}
        </div>
      )}
    </div>
  );
};

// 12. Avatar
export const DSAvatar: React.FC<{ name: string; src?: string; size?: 'sm' | 'md' | 'lg' }> = ({ name, src, size = 'md' }) => {
  const sz = { sm: 'w-7 h-7 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-14 h-14 text-base' };
  const parts = (name || '').trim().split(/\s+/);
  const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (name || '').slice(0, 2).toUpperCase();
  return src ? (
    <img src={src} alt={name} className={cn('rounded-full object-cover border border-slate-200', sz[size])} />
  ) : (
    <div className={cn('rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0', sz[size])}>
      {initials}
    </div>
  );
};

// 13. Tabs
export const DSTabs: React.FC<{ tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void }> = ({ tabs, activeTab, onChange }) => (
  <div className="flex border-b border-slate-200">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all', activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800')}
      >
        {t.label}
      </button>
    ))}
  </div>
);

// 14. Accordion
export const DSAccordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-slate-50 text-sm font-semibold text-slate-800">
        <span>{title}</span>
        <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="p-4 border-t border-slate-200 bg-white text-sm text-slate-600">{children}</div>}
    </div>
  );
};

// 15. Toast Alert
export const DSToast: React.FC<{ message: string; type?: 'success' | 'error' | 'info'; onClose?: () => void }> = ({ message, type = 'info', onClose }) => {
  const bg = { success: 'bg-emerald-600', error: 'bg-rose-600', info: 'bg-blue-600' };
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 text-white text-sm rounded-xl shadow-xl min-w-[280px]', bg[type])}>
      <span>{message}</span>
      {onClose && <button onClick={onClose}><X size={16} /></button>}
    </div>
  );
};

// 16. Confirmation Dialog
export const DSConfirmationDialog: React.FC<{ open: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void }> = ({ open, title, message, onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <DSButton variant="outline" onClick={onClose}>Cancel</DSButton>
          <DSButton variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm Action</DSButton>
        </div>
      </div>
    </div>
  );
};
