import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import "./styles/Register.css";
import { useTranslation } from "react-i18next";
import { FaUserCheck, FaIdCard, FaLock, FaKey, FaListUl } from "react-icons/fa";

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const nav = useNavigate();
  const { t } = useTranslation();

  const validatePassword = (password) => password.length >= 6;

  // Sample 1,000 Master Dataset Demo Credentials
  const demoCitizens = [
    { label: "Pavan Kumar (Citizen #9001)", id: "9876-5432-1000", pass: "Citizen@123" },
    { label: "Rajesh Patil (Citizen #9002)", id: "9876-5432-1001", pass: "Citizen@123" },
    { label: "Suresh Deshmukh (Citizen #9003)", id: "9876-5432-1002", pass: "Citizen@123" },
    { label: "Anita Sharma (Citizen #9004)", id: "9876-5432-1003", pass: "Citizen@123" },
    { label: "Vijay Kulkarni (Citizen #9005)", id: "9876-5432-1004", pass: "Citizen@123" },
    { label: "Pooja Joshi (Citizen #9010)", id: "9876-5432-1009", pass: "Citizen@123" },
    { label: "Siddharth Pawar (Citizen #9050)", id: "9876-5432-1049", pass: "Citizen@123" },
    { label: "Vikram Solanki (Citizen #9999)", id: "9876-5432-1998", pass: "Citizen@123" }
  ];

  const handleSelectDemo = (selectedId) => {
    const match = demoCitizens.find(c => c.id === selectedId);
    if (match) {
      setIdentifier(match.id);
      setPassword(match.pass);
    }
  };

  const submit = async e => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError('');
      const res = await API.post('/auth/login', { identifier, password });
      const token = res.data.token || res.data?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      setMessage(`Welcome ${res.data?.user?.name || "Citizen"}! Redirecting to Resident Portal...`);
      setMessageType("success");
      setTimeout(() => nav('/citizen'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || t("loginError"));
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: "480px", margin: "2rem auto", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 🔐 Master Dataset Credentials Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "20px", borderRadius: "16px", marginBottom: "20px", boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <FaKey style={{ color: "#38bdf8", fontSize: "1.3rem" }} />
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#ffffff" }}>
            🔑 1,000 Citizen Master Dataset Login
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.4" }}>
          All 1,000 citizens in the Master Dataset are enabled for login.
          Log in using any citizen's <strong>Aadhaar #</strong>, <strong>Citizen ID</strong>, or <strong>Email</strong> with password:
        </p>
        <div style={{ marginTop: "10px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "900", color: "#38bdf8", textAlign: "center" }}>
          Default Password for All 1,000 Citizens: <code style={{ color: "#ffffff", fontSize: "0.95rem" }}>Citizen@123</code>
        </div>
      </div>

      <h2 className="register-title">{t("login")}</h2>

      {/* 1-Click Quick Selector */}
      <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#475569", marginBottom: "6px" }}>
          ⚡ 1-Click Quick Demo Citizen Selector (First 1,000 Members):
        </label>
        <select
          onChange={(e) => handleSelectDemo(e.target.value)}
          defaultValue=""
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #94a3b8", fontSize: "0.88rem", fontWeight: "700", color: "#0f172a", outline: "none" }}
        >
          <option value="" disabled>-- Pick Any Master Citizen to Auto-Fill --</option>
          {demoCitizens.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} (Aadhaar: {c.id})
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "red", marginBottom: "1rem", fontWeight: "700", textAlign: "center" }}>{error}</p>}
      {message && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "10px",
            borderRadius: "6px",
            textAlign: "center",
            backgroundColor: messageType === "success" ? "#D0E9C0" : "#f8d7da",
            color: messageType === "success" ? "#2e4d2c" : "#721c24",
            border: messageType === "success" ? "1px solid #b2d8a6" : "1px solid #f5c6cb",
            fontWeight: "800"
          }}
        >
          {message}
        </div>
      )}

      <form className="register-form" onSubmit={submit}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>
            Aadhaar Number (12-Digit) / Citizen ID / Email:
          </label>
          <input
            className="register-input"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="e.g. 9876-5432-1000 or CIT-IND-9001 or pavan@example.com"
            autoComplete="username"
            required
            style={{ margin: 0, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>
            Password:
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              className="register-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Citizen@123"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              style={{ width: "100%", paddingRight: "3rem", boxSizing: "border-box", margin: 0 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem"
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <Link
            to="/forgot-password?role=citizen"
            style={{
              color: "#2e4d2c",
              fontSize: "0.85rem",
              fontWeight: "bold",
              textDecoration: "underline"
            }}
          >
            {t("Forgot Password?")}
          </Link>
        </div>

        <button className="register-button" type="submit" style={{ fontSize: "1rem", fontWeight: "800" }}>
          🔐 {t("login")}
        </button>
      </form>
    </div>
  );
}