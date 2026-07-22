import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Package,
  FileSpreadsheet,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Boxes
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalChallans: number;
  lowStockAlerts: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalProducts: 0,
    totalChallans: 0,
    lowStockAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Execute queries in parallel using Promise.all
        const [custRes, prodRes, challanRes] = await Promise.all([
          apiClient.get("/customers"),
          apiClient.get("/products"),
          apiClient.get("/challans"),
        ]);

        const customers = custRes.data.customers || [];
        const products = prodRes.data.products || [];
        const challans = challanRes.data.challans || [];

        // Calculate how many products are below their min stock alert threshold
        const lowStockCount = products.filter(
          (p: any) => p.currentStock < p.minStockAlertQty
        ).length;

        setStats({
          totalCustomers: customers.length,
          totalProducts: products.length,
          totalChallans: challans.length,
          lowStockAlerts: lowStockCount,
        });
      } catch (err: any) {
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ color: "var(--text-secondary)" }}>Loading summary stats...</div>;
  }

  const statCards = [
    {
      title: "CRM Customers",
      value: stats.totalCustomers,
      icon: <Users size={24} />,
      color: "var(--accent-color)",
      bg: "rgba(59, 130, 246, 0.1)",
      link: "/customers",
    },
    {
      title: "Catalog SKUs",
      value: stats.totalProducts,
      icon: <Package size={24} />,
      color: "var(--color-info)",
      bg: "rgba(6, 182, 212, 0.1)",
      link: "/products",
    },
    {
      title: "Sales Challans",
      value: stats.totalChallans,
      icon: <FileSpreadsheet size={24} />,
      color: "var(--color-success)",
      bg: "rgba(16, 185, 129, 0.1)",
      link: "/challans",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockAlerts,
      icon: <AlertOctagon size={24} />,
      color: stats.lowStockAlerts > 0 ? "var(--color-danger)" : "var(--text-muted)",
      bg: stats.lowStockAlerts > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(107, 114, 128, 0.1)",
      link: "/products?lowStock=true",
    },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div className="card" style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: "1px solid var(--border-color)",
        marginBottom: "2rem",
        padding: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Welcome back, {user?.name}!
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px" }}>
          Here is your wholesale operations overview. You are logged in with **{user?.role}** privilege, enabling role-based validations for order confirmations and inventory edits.
        </p>
      </div>

      {error && (
        <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid of stats cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2.5rem"
      }}>
        {statCards.map((card, idx) => (
          <div key={idx} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                {card.title}
              </span>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "0.375rem",
                backgroundColor: card.bg,
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {card.icon}
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 700 }}>{card.value}</span>
            </div>

            <Link
              to={card.link}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--accent-color)",
                textDecoration: "none",
                marginTop: "0.5rem"
              }}
            >
              Manage details
              <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      {/* Secondary Actions / Info widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <TrendingUp style={{ color: "var(--color-success)" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Quick Actions</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.5rem" }}>
            {["ADMIN", "SALES"].includes(user?.role || "") && (
              <Link to="/challans" className="btn btn-primary">
                + Create Challan
              </Link>
            )}
            {["ADMIN", "SALES"].includes(user?.role || "") && (
              <Link to="/customers" className="btn btn-secondary">
                + Add Customer
              </Link>
            )}
            {["ADMIN", "WAREHOUSE"].includes(user?.role || "") && (
              <Link to="/products" className="btn btn-secondary">
                + Add SKU Product
              </Link>
            )}
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Boxes style={{ color: "var(--color-info)" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Warehouse Status</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Low Stock Items:</span>
              <strong style={{ color: stats.lowStockAlerts > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
                {stats.lowStockAlerts}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total Unique SKUs:</span>
              <strong>{stats.totalProducts}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
