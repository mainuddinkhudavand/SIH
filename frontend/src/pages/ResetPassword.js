import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./styles/Register.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get("role");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, { token, role, password });
      setMessage(res.data.message);
      setTimeout(() => {
        // Redirect to appropriate login page based on role
        if (role === "citizen") navigate("/login");
        else if (role === "manager") navigate("/manager/login");
        else if (role === "worker") navigate("/worker/login");
        else if (role === "department") navigate("/department/login");
        else navigate("/");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="register-card" style={{ width: "450px", padding: "2.5rem", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
        <h2 style={{ textAlign: "center", fontWeight: "800", color: "#0f172a", marginBottom: "0.5rem" }}>Set New Password</h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Please choose a strong password containing at least 6 characters.
        </p>

        {message && (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "10px", borderRadius: "10px", border: "1px solid #bbf7d0", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center" }}>
            {message} Redirection to login portal...
          </div>
        )}

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "10px", border: "1px solid #fecaca", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Minimum 6 characters"
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", padding: "0.85rem", paddingRight: "3rem", borderRadius: "12px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Confirm Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Re-type new password"
              required 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "0.9rem", background: "linear-gradient(135deg, #2e4d2c, #3b5f3a)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "800", cursor: "pointer" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
