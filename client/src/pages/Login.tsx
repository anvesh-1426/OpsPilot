import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, KeyRound, Mail, AlertTriangle } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      // Success redirect to dashboard
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}>
        
        {/* Logo/Icon Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            color: "var(--accent-color)",
            marginBottom: "1rem"
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Operations Portal
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "0.375rem",
            color: "var(--color-danger)",
            fontSize: "0.875rem",
            marginBottom: "1.25rem"
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} />
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "36px" }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.75rem" }}>
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: "relative" }}>
              <KeyRound size={16} style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "36px" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Guest Demo Account Note */}
        <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
          <span>Demo Account: admin@company.com / securepassword</span>
        </div>

      </div>
    </div>
  );
};
