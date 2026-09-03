import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import "./styles/Register.css";
import { useTranslation } from "react-i18next";

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

  const submit = async e => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await API.post('/auth/login', { identifier, password });
      const token = res.data.token || res.data?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      setMessage("Login successful! Redirecting to Citizen Portal...");
      setMessageType("success");
      setTimeout(() => nav('/citizen'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || t("loginError"));
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2 className="register-title">{t("login")}</h2>

      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
      {message && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "10px",
            borderRadius: "6px",
            textAlign: "center",
            backgroundColor: messageType === "success" ? "#D0E9C0" : "#f8d7da",
            color: messageType === "success" ? "#2e4d2c" : "#721c24",
            border: messageType === "success" ? "1px solid #b2d8a6" : "1px solid #f5c6cb"
          }}
        >
          {message}
        </div>
      )}

      <form className="register-form" onSubmit={submit}>
        <input
          className="register-input"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          placeholder={t("emailOrPhone")}
          autoComplete="username"
          required
        />
        
        <div style={{ position: "relative", width: "100%" }}>
          <input
            className="register-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            style={{ width: "100%", paddingRight: "3rem", boxSizing: "border-box" }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "35%",
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

        <button className="register-button" type="submit">
          {t("login")}
        </button>
      </form>
    </div>
  );
}