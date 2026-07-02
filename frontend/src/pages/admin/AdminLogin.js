import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [showForgot, setShowForgot] = useState(false); // ✅ modal toggle
  const [resetEmail, setResetEmail] = useState("");

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
      const res = await axios.post("http://localhost:5000/api/admin/login", {
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/forgot-password", {
        email: resetEmail,
      });
      setMessage("Password reset link sent to your email.");
      setMessageType("success");
      setShowForgot(false);
    } catch (err) {
      setMessage("Error sending reset link. Please try again.");
      setMessageType("error");
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
          required
          style={{
            display: "block",
            marginBottom: "1rem",
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem"
          }}
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: "block",
            marginBottom: "0.5rem",
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem"
          }}
        />

        {/* ✅ Forgot Password link triggers modal */}
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: "none",
              border: "none",
              color: "#2e4d2c",
              fontSize: "0.85rem",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            {t("Forgot Password?")}
          </button>
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

      {/* ✅ Inline Forgot Password Modal */}
      {showForgot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "350px",
              width: "100%",
              boxShadow: "0 6px 18px rgba(2,6,23,0.06)"
            }}
          >
            <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>
              {t("resetPassword")}
            </h3>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder={t("enterEmail")}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
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
                  cursor: "pointer"
                }}
              >
                {t("sendResetLink")}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2e4d2c",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}