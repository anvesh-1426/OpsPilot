import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatIndianShortCurrency(n: number): string {
  if (isNaN(n) || n === null || n === undefined || n === 0) return '₹0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${sign}₹${abs}`;
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric', ...options }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export const formatTimeAgo = formatRelativeTime;

export function formatNumber(n: number): string {
  if (isNaN(n) || n === null || n === undefined) return '0';
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN').format(n);
}

export function getInitials(name: string): string {
  if (!name) return 'OP';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'badge-success', INACTIVE: 'badge-neutral', PROSPECT: 'badge-info', CHURNED: 'badge-danger',
    DELIVERED: 'badge-success', SHIPPED: 'badge-info', CONFIRMED: 'badge-purple', PROCESSING: 'badge-warning',
    DRAFT: 'badge-neutral', CANCELLED: 'badge-danger', RETURNED: 'badge-warning',
    PAID: 'badge-success', SENT: 'badge-info', OVERDUE: 'badge-danger',
    NEW: 'badge-info', CONTACTED: 'badge-purple', QUALIFIED: 'badge-warning',
    PROPOSAL: 'badge-amber', NEGOTIATION: 'badge-warning',
    CLOSED_WON: 'badge-success', CLOSED_LOST: 'badge-danger',
    IN: 'badge-success', OUT: 'badge-danger', ADJUSTMENT: 'badge-warning', TRANSFER: 'badge-info',
  };
  return map[status] || 'badge-neutral';
}

export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
