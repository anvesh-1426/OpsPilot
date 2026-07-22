import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  LogOut,
  User as UserIcon,
  Menu
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: <LayoutDashboard size={20} />, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { label: "CRM (Customers)", path: "/customers", icon: <Users size={20} />, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { label: "Inventory (Products)", path: "/products", icon: <Package size={20} />, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { label: "Sales Challans", path: "/challans", icon: <FileSpreadsheet size={20} />, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] }
  ];

  // Filter navigation links based on user role permissions
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      
      {/* Sidebar navigation */}
      <aside style={{
        width: "260px",
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>
        
        {/* Sidebar Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "0.5rem",
            background: "var(--accent-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "1.25rem"
          }}>
            E
          </div>
          <div>
            <h1 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.5px" }}>ERP+CRM Portal</h1>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Wholesale Depot</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.375rem",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--bg-surface)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--accent-color)" : "3px solid transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.875rem",
                  transition: "all 0.15s ease-in-out"
                }}
              >
                <span style={{ color: isActive ? "var(--accent-color)" : "inherit" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout button at bottom of sidebar */}
        <div style={{
          padding: "1rem",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-color)"
            }}>
              <UserIcon size={18} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name}
              </p>
              <span className={`badge ${
                user?.role === "ADMIN" ? "badge-danger" : 
                user?.role === "SALES" ? "badge-info" : 
                user?.role === "WAREHOUSE" ? "badge-success" : "badge-warning"
              }`} style={{ fontSize: "0.65rem", padding: "0.125rem 0.375rem" }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", gap: "0.5rem", padding: "0.5rem" }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </aside>

      {/* Main Content Pane */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowX: "hidden" }}>
        
        {/* Top Header navbar */}
        <header style={{
          height: "64px",
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          flexShrink: 0
        }}>
          <button style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            display: "none" // Toggle sidebar on smaller screens (CSS media queries)
          }}>
            <Menu size={20} />
          </button>
          
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Workspace Status: <strong style={{ color: "var(--color-success)" }}>● Online</strong>
            </span>
          </div>
        </header>

        {/* Content body */}
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {children}
        </main>

      </div>
    </div>
  );
};
