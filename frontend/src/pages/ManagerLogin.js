import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function ManagerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/manager/login`, {
        email,
        password,
      });

      localStorage.setItem("managerToken", res.data.token);
      localStorage.setItem("managerDetails", JSON.stringify(res.data.manager));
      navigate("/manager/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "calc(100vh - 80px)",
      backgroundColor: "#f8fafc",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: "2rem",
    },
    card: {
      background: "#ffffff",
      padding: "3rem 2.5rem",
      borderRadius: "24px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
      width: "100%",
      maxWidth: "420px",
      border: "1px solid #f1f5f9",
      textAlign: "center",
    },
    iconWrap: {
      background: "#f0fdf4",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.8rem",
      margin: "0 auto 1.5rem",
      color: "#1a5f24",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "900",
      color: "#0f172a",
      marginBottom: "0.5rem",
      margin: 0,
    },
    subtitle: {
      fontSize: "0.9rem",
      color: "#64748b",
      marginBottom: "2rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
    },
    input: {
      width: "100%",
      padding: "0.85rem 1rem",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      outline: "none",
      backgroundColor: "#ffffff",
    },
    button: {
      width: "100%",
      padding: "0.85rem",
      backgroundColor: "#1a5f24",
      color: "#ffffff",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "0.5rem",
      transition: "background-color 0.2s",
      opacity: loading ? 0.7 : 1,
    },
    errorBox: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      padding: "0.75rem",
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: "600",
      marginBottom: "1.5rem",
      border: "1px solid #fecaca",
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>🤵</div>
        <h2 style={styles.title}>{t("managerLogin") || "Manager Portal"}</h2>
        <p style={styles.subtitle}>Sign in to inspect escalated grievances</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        <form style={styles.form} onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Manager Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            onFocus={(e) => (e.target.style.borderColor = "#1a5f24")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            autoComplete="username"
          />
          
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: "3rem" }}
              required
              onFocus={(e) => (e.target.style.borderColor = "#1a5f24")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              autoComplete="current-password"
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

          <div style={{ textAlign: "right", marginTop: "-5px", marginBottom: "5px" }}>
            <Link
              to="/forgot-password?role=manager"
              style={{
                color: "#1a5f24",
                fontSize: "0.85rem",
                fontWeight: "bold",
                textDecoration: "underline"
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
