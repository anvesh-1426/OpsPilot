import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/ui';

// Lazy Loaded Page Components for Performance Optimization & Code Splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('./pages/crm/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const LeadsPage = lazy(() => import('./pages/crm/LeadsPage').then((m) => ({ default: m.LeadsPage })));
const OrdersPage = lazy(() => import('./pages/sales/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const InvoicesPage = lazy(() => import('./pages/sales/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));
const QuotationsPage = lazy(() => import('./pages/sales/QuotationsPage').then((m) => ({ default: m.QuotationsPage })));
const ChallansPage = lazy(() => import('./pages/sales/ChallansPage').then((m) => ({ default: m.ChallansPage })));
const PurchaseOrdersPage = lazy(() => import('./pages/purchase/PurchaseOrdersPage').then((m) => ({ default: m.PurchaseOrdersPage })));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage })));
const WarehousePage = lazy(() => import('./pages/warehouse/WarehousePage').then((m) => ({ default: m.WarehousePage })));
const AccountsPage = lazy(() => import('./pages/accounts/AccountsPage').then((m) => ({ default: m.AccountsPage })));
const FinancialsPage = lazy(() => import('./pages/financials/FinancialsPage').then((m) => ({ default: m.FinancialsPage })));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner size="lg" /></div>}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/crm/customers" element={<CustomersPage />} />
          <Route path="/crm/leads" element={<LeadsPage />} />
          <Route path="/sales/orders" element={<OrdersPage />} />
          <Route path="/sales/invoices" element={<InvoicesPage />} />
          <Route path="/sales/quotations" element={<QuotationsPage />} />
          <Route path="/sales/challans" element={<ChallansPage />} />
          <Route path="/procurement/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/procurement/suppliers" element={<SuppliersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/financials" element={<FinancialsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
