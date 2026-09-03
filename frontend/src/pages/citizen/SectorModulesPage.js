import React, { useState, useEffect } from "react";
import API from "../../services/api";
import CitizenSectorServices from "./CitizenSectorServices";
import { FaCubes, FaExclamationCircle, FaUserCircle, FaLock } from "react-icons/fa";

export default function SectorModulesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOfficialSession, setIsOfficialSession] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const citizenToken = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    if (adminToken) {
      setIsOfficialSession(true);
      setIsAuthenticated(false);
    } else if (citizenToken) {
      setIsAuthenticated(true);
      setIsOfficialSession(false);
    } else {
      setIsAuthenticated(false);
      setIsOfficialSession(false);
    }
  }, []);

  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await API.post("/auth/login", { identifier: email, email, password });
      const token = res.data?.token || res.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("isAdmin");
        setIsAuthenticated(true);
        setIsOfficialSession(false);
      } else {
        setErrorMsg("Login failed. No token received.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid Citizen email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchSession = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    setIsOfficialSession(false);
  };

  // 🔒 Lock Screen: Official Session Attempting Sector Modules Access
  if (isOfficialSession) {
    return (
      <div style={{ background: "#f4f9f4", minHeight: "92vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #fee2e2", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", maxWidth: "450px", width: "100%", textAlign: "center" }}>
          <div style={{ background: "#fee2e2", color: "#dc2626", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "2rem" }}>
            <FaExclamationCircle />
          </div>
          <h2 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "1.6rem", fontWeight: "800" }}>Access Restricted: Official Session Active</h2>
          <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "20px" }}>
            Sector Modules (Schools, Hospitals, Malls, Cinemas) are private to Resident Citizen sessions. Please sign out of Official session to access resident sector workflows.
          </p>
          <button
            onClick={handleSwitchSession}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#2d6a4f",
              color: "white",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer"
            }}
          >
            Switch to Citizen Session
          </button>
        </div>
      </div>
    );
  }

  // 🔒 Lock Screen: Unauthenticated visitor opening /modules -> Require "Citizen Portal Login"
  if (!isAuthenticated) {
    return (
      <div style={{ background: "#f4f9f4", minHeight: "92vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #d8f3dc", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", maxWidth: "420px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ background: "#d8f3dc", color: "#1b4332", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "1.75rem" }}>
              <FaUserCircle />
            </div>
            <h2 style={{ margin: "0 0 6px 0", color: "#1b4332", fontSize: "1.6rem", fontWeight: "800" }}>Citizen Portal Login</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Authentication required to access Sector Workflow Modules (School, Hospital, Mall, Cinema).</p>
          </div>

          {errorMsg && (
            <div style={{ padding: "12px", borderRadius: "8px", background: "#fef2f2", color: "#991b1b", fontSize: "0.85rem", marginBottom: "16px", border: "1px solid #fecaca" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCitizenLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Citizen Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #2d6a4f, #1b4332)",
                color: "white",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {loading ? "Logging in..." : <><FaLock /> Access Sector Modules</>}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
            Don't have a resident account?{" "}
            <a href="/register" style={{ color: "#2d6a4f", fontWeight: "700", textDecoration: "none" }}>
              Register Here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f9f4", minHeight: "92vh", paddingBottom: "40px" }}>
      {/* Top Banner */}
      <div style={{ background: "linear-gradient(135deg, #1b4332 0%, #2e4d2c 100%)", color: "white", padding: "28px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <span style={{ background: "#059669", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700" }}>
            SECTOR WORKFLOW MODULES
          </span>
          <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", color: "#e0ffe0" }}>
            <FaCubes /> Integrated Sector Workflows
          </h1>
          <p style={{ margin: 0, color: "#a8e6a3", fontSize: "0.95rem" }}>
            Sector-specific workflows for Schools, Hospitals, Commercial Malls, Cinema Halls, and Municipal Infrastructure.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "24px auto 0 auto", padding: "0 20px" }}>
        <CitizenSectorServices />
      </div>
    </div>
  );
}
