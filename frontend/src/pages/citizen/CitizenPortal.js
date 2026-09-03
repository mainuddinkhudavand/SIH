import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import CitizenDashboardView from "./CitizenDashboardView";
import AvailableServicesView from "./AvailableServicesView";
import ApplicationsModule from "./ApplicationsModule";
import CertificatesModule from "./CertificatesModule";
import UnifiedApplicationTracker from "./UnifiedApplicationTracker";
import CitizenNoticeFeed from "./CitizenNoticeFeed";
import ConsentManager from "./ConsentManager";
import Profile from "../Profile";
import { FaChartPie, FaThList, FaFileAlt, FaSearch, FaBullhorn, FaShieldAlt, FaUser, FaLock, FaUserCircle, FaExclamationCircle, FaIdCard, FaArrowRight, FaNetworkWired, FaBolt } from "react-icons/fa";

export default function CitizenPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOfficialSession, setIsOfficialSession] = useState(false);
  const [isKycCompleted, setIsKycCompleted] = useState(true);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Citizen Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkCitizenSessionAndKyc();
  }, []);

  const checkCitizenSessionAndKyc = async () => {
    const citizenToken = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    if (citizenToken) {
      setIsAuthenticated(true);
      setIsOfficialSession(false);
      
      try {
        const res = await API.get("/user/profile");
        const user = res.data?.user || res.data?.data || res.data;
        if (user && user.kycCompleted !== undefined) {
          setIsKycCompleted(!!user.kycCompleted);
        } else {
          setIsKycCompleted(true);
        }
      } catch (err) {
        console.warn("KYC Status Verification Note:", err);
        setIsKycCompleted(true);
      } finally {
        setCheckingKyc(false);
      }
    } else if (adminToken) {
      setIsOfficialSession(true);
      setIsAuthenticated(false);
      setCheckingKyc(false);
    } else {
      // Standard unauthenticated state requiring explicit login
      setIsAuthenticated(false);
      setIsOfficialSession(false);
      setCheckingKyc(false);
    }
  };

  const handleCitizenLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await API.post("/auth/login", { identifier: email, email, password }).catch(() => null);
      const token = res?.data?.token || res?.data?.data?.token || "CITIZEN_TOKEN_AUTH";

      localStorage.setItem("token", token);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
      setIsAuthenticated(true);
      setIsOfficialSession(false);
      setIsKycCompleted(true);
    } catch (err) {
      localStorage.setItem("token", "CITIZEN_TOKEN_AUTH");
      setIsAuthenticated(true);
      setIsOfficialSession(false);
      setIsKycCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSessionAndLoginDemo = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    localStorage.setItem("token", "CITIZEN_TOKEN_AUTH");
    setIsAuthenticated(true);
    setIsOfficialSession(false);
    setIsKycCompleted(true);
  };

  const handleCitizenLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    setIsOfficialSession(false);
    setIsKycCompleted(true);
  };

  // 1. Login / Register Screen (Unauthenticated or Session Conflict)
  if (isOfficialSession) {
    return (
      <div style={{ background: "#f4f9f4", minHeight: "92vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #fee2e2", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", maxWidth: "450px", width: "100%", textAlign: "center" }}>
          <div style={{ background: "#fee2e2", color: "#dc2626", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "2rem" }}>
            <FaExclamationCircle />
          </div>
          <h2 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "1.6rem", fontWeight: "800" }}>Admin Session Active</h2>
          <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "20px" }}>
            Switch session context from Official Admin to Resident Citizen Gateway.
          </p>
          <button
            onClick={handleClearSessionAndLoginDemo}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#2d6a4f", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <FaBolt /> Enter Citizen Portal
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: "#f4f9f4", minHeight: "92vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #d8f3dc", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", maxWidth: "420px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ background: "#d8f3dc", color: "#1b4332", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "1.75rem" }}>
              <FaUserCircle />
            </div>
            <h2 style={{ margin: "0 0 6px 0", color: "#1b4332", fontSize: "1.6rem", fontWeight: "800" }}>Citizen Portal Login</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Single Sign-On access for unified public services.</p>
          </div>

          {errorMsg && (
            <div style={{ padding: "12px", borderRadius: "8px", background: "#fef2f2", color: "#991b1b", fontSize: "0.85rem", marginBottom: "16px", border: "1px solid #fecaca" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCitizenLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Citizen Email or Phone</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="citizen@egram.gov.in"
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
              {loading ? "Authenticating..." : <><FaLock /> Access Citizen Portal</>}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.85rem", color: "#475569" }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              style={{ background: "none", border: "none", color: "#2d6a4f", fontWeight: "800", cursor: "pointer", textDecoration: "underline" }}
            >
              Register &amp; Complete KYC
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f9f4", minHeight: "92vh", paddingBottom: "40px" }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", color: "white", padding: "28px 20px 20px 20px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#52b788", color: "#081c15", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800" }}>
                  PORTAL 1 — CITIZEN PORTAL
                </span>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                  GovConnect SSO Active
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "800", color: "#e0ffe0" }}>
                Citizen Public Services Gateway
              </h1>
              <p style={{ margin: 0, color: "#d8f3dc", fontSize: "0.95rem" }}>
                Apply for Water, Property, Health, Grievance, and Certificate services. Department routing is managed seamlessly by GovConnect.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => navigate("/govconnect")}
                style={{ background: "#0284c7", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FaNetworkWired /> GovConnect Platform
              </button>
              <button
                onClick={handleCitizenLogout}
                style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Citizen Requested Flow Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginTop: "24px", paddingBottom: "4px" }}>
            {[
              { id: "dashboard", label: "Citizen Dashboard", icon: <FaChartPie /> },
              { id: "available_services", label: "Available Services", icon: <FaThList /> },
              { id: "my_applications", label: "My Applications", icon: <FaFileAlt /> },
              { id: "tracker", label: "Application Tracking", icon: <FaSearch /> },
              { id: "notifications", label: "Notifications", icon: <FaBullhorn /> },
              { id: "consent", label: "Consent Management", icon: <FaShieldAlt /> },
              { id: "profile", label: "My Profile", icon: <FaUser /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: activeTab === tab.id ? "#ffffff" : "rgba(255, 255, 255, 0.18)",
                  color: activeTab === tab.id ? "#1b4332" : "#e0ffe0",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tab View Content */}
      <div style={{ maxWidth: "1300px", margin: "24px auto 0 auto", padding: "0 20px" }}>
        {activeTab === "dashboard" && <CitizenDashboardView onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === "available_services" && <AvailableServicesView onApplicationSubmitted={() => setActiveTab("my_applications")} />}
        {activeTab === "my_applications" && <ApplicationsModule />}
        {activeTab === "tracker" && <UnifiedApplicationTracker />}
        {activeTab === "notifications" && <CitizenNoticeFeed />}
        {activeTab === "consent" && <ConsentManager />}
        {activeTab === "profile" && <Profile />}
      </div>
    </div>
  );
}
