import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function WorkerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const BACKEND_URL = "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/worker/login`, {
        email,
        password,
      });

      // 🚀 Save the worker's token and basic info
      localStorage.setItem("workerToken", res.data.token);
      localStorage.setItem("workerInfo", JSON.stringify(res.data.worker));

      // Redirect to the worker dashboard (we will build this next!)
      navigate("/worker/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "80vh",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: "#f8fafc",
      padding: "20px"
    },
    card: {
      background: "#ffffff",
      padding: "3rem 2rem",
      borderRadius: "20px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center",
      border: "1px solid #f1f5f9"
    },
    title: {
      margin: "0 0 0.5rem 0",
      fontSize: "1.8rem",
      fontWeight: "900",
      color: "#0f172a"
    },
    subtitle: {
      color: "#64748b",
      fontSize: "0.9rem",
      marginBottom: "2rem"
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      textAlign: "left"
    },
    label: {
      fontSize: "0.8rem",
      fontWeight: "700",
      color: "#475569",
      marginBottom: "-0.8rem"
    },
    input: {
      width: "100%",
      padding: "0.85rem",
      borderRadius: "10px",
      border: "2px solid #e2e8f0",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      transition: "border-color 0.2s"
    },
    btn: {
      background: "#3b5f3a",
      color: "#fff",
      border: "none",
      padding: "0.85rem",
      borderRadius: "10px",
      fontSize: "1rem",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "1rem",
      transition: "background 0.2s"
    },
    errorBox: {
      background: "#fee2e2",
      color: "#b91c1c",
      padding: "10px",
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: "bold",
      marginBottom: "1rem"
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👷‍♂️</div>
        <h2 style={styles.title}>Field Worker Portal</h2>
        <p style={styles.subtitle}>Log in to view and complete your assigned tasks.</p>

        {error && <div style={styles.errorBox}>❌ {error}</div>}

        <form style={styles.form} onSubmit={handleLogin}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            style={styles.input}
            placeholder="Enter your assigned email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Logging in..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}