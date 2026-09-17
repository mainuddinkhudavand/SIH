import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import "./styles/Register.css";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const nav = useNavigate();
  const { t } = useTranslation();

  const validatePassword = (password) => password.length >= 6;

  const submit = async e => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError('');
      const res = await API.post('/auth/login', { email, password });
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
    <div className="register-container" style={{ maxWidth: "420px", margin: "2rem auto", fontFamily: "'Inter', sans-serif" }}>
      <h2 className="register-title">{t("login")}</h2>

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
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
            Email Address:
          </label>
          <input
            className="register-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. citizen@example.com"
            autoComplete="email"
            required
            style={{ margin: 0, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
            Password:
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              className="register-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Password"
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
          {t("login")}
        </button>
      </form>
    </div>
  );
}