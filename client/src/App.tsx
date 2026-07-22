import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { Products } from "./pages/Products";
import { Challans } from "./pages/Challans";

// A wrapper component to protect routes from unauthenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-primary)"
      }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/challans"
            element={
              <ProtectedRoute>
                <Challans />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
