import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./styles/Register.css";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "citizen";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, { email, role });
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="register-card" style={{ width: "450px", padding: "2.5rem", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
        <h2 style={{ textAlign: "center", fontWeight: "800", color: "#0f172a", marginBottom: "0.5rem" }}>Forgot Password</h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Enter your registered email and select your portal role to receive a password reset link.
        </p>

        {message && (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "10px", borderRadius: "10px", border: "1px solid #bbf7d0", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center" }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "10px", border: "1px solid #fecaca", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Portal Role</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", backgroundColor: "#f8fafc" }}
            >
              <option value="citizen">Citizen / User</option>
              <option value="manager">District Manager</option>
              <option value="worker">Field Worker</option>
              <option value="department">Department</option>
              <option value="admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. name@example.com"
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "0.9rem", background: "linear-gradient(135deg, #2e4d2c, #3b5f3a)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "800", cursor: "pointer", transition: "background-color 0.2s" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <span 
            onClick={() => navigate(-1)} 
            style={{ color: "#3b5f3a", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem", textDecoration: "underline" }}
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}
