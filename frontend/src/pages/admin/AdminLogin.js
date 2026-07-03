import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const navigate = useNavigate();
  const { t } = useTranslation();

  const validatePassword = (password) => password.length >= 6;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/login`, {
        email,
        password,
      });

      if (res.data.isAdmin) {
        localStorage.setItem("isAdmin", true);
        setError("");
        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        setTimeout(() => navigate("/admin/dashboard"), 1000);
      } else {
        setError(t("invalidCredentials"));
      }
    } catch (err) {
      setError(t("invalidCredentials"));
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
        fontFamily: "Poppins, sans-serif",
        color: "#2e4d2c"
      }}
    >
      <form onSubmit={handleLogin}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {t("adminLogin")}
        </h2>

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

        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          style={{
            display: "block",
            marginBottom: "1rem",
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem",
            boxSizing: "border-box"
          }}
        />
        
        <div style={{ position: "relative", width: "100%", marginBottom: "0.5rem" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              paddingRight: "3rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
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

        {/* ✅ Forgot Password redirects to centralized page */}
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <Link
            to="/forgot-password?role=admin"
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

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 20px",
            backgroundColor: "#3b5f3a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
        >
          {t("login")}
        </button>
      </form>
    </div>
  );
}