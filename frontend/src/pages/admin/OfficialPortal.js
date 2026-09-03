import React, { useState, useEffect } from "react";
import API from "../../services/api";
import ApprovalsHub from "./ApprovalsHub";
import AdminDepartmentsView from "./AdminDepartmentsView";
import AdminApiHealth from "./AdminApiHealth";
import AdminFailedTransactions from "./AdminFailedTransactions";
import AuditLogsViewer from "./AuditLogsViewer";
import AdminUserActivity from "./AdminUserActivity";
import WorkflowOrchestration from "./WorkflowOrchestration";
import AdminConsentRecords from "./AdminConsentRecords";
import { FaCheckCircle, FaProjectDiagram, FaHistory, FaBuilding, FaHeartbeat, FaExclamationTriangle, FaLock, FaUserShield, FaExclamationCircle, FaNetworkWired, FaUsers, FaShieldAlt, FaServer } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function OfficialPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCitizenSession, setIsCitizenSession] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");

  // Official Login Form State
  const [email, setEmail] = useState("admin@egram.gov.in");
  const [password, setPassword] = useState("Admin@Eg123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const isAdmin = localStorage.getItem("isAdmin");
    const citizenToken = localStorage.getItem("token");

    if (adminToken && isAdmin === "true") {
      setIsAuthenticated(true);
      setIsCitizenSession(false);
    } else if (citizenToken && !adminToken) {
      setIsCitizenSession(true);
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(false);
      setIsCitizenSession(false);
    }
  }, []);

  const handleOfficialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await API.post("/admin/login", { email, password });
      const token = res.data?.token || res.data?.data?.token;

      if (token) {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("isAdmin", "true");
        localStorage.removeItem("token");
        setIsAuthenticated(true);
        setIsCitizenSession(false);
      } else {
        setErrorMsg("Authentication failed. No token received.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid Admin credentials. Check backend .env settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleOfficialLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    setIsCitizenSession(false);
  };

  if (isCitizenSession) {
    return (
      <div style={{ background: "#f4f9f4", minHeight: "92vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #fee2e2", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", maxWidth: "450px", width: "100%", textAlign: "center" }}>
          <div style={{ background: "#fee2e2", color: "#dc2626", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "2rem" }}>
            <FaExclamationCircle />
          </div>
          <h2 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "1.6rem", fontWeight: "800" }}>Citizen Session Active</h2>
          <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "20px" }}>
            The Admin Portal is restricted to platform administrators. Switch session to authenticate.
          </p>
          <button
            onClick={handleOfficialLogout}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#1b4332", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer" }}
          >
            Switch to Admin Login
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
              <FaUserShield />
            </div>
            <h2 style={{ margin: "0 0 6px 0", color: "#1b4332", fontSize: "1.6rem", fontWeight: "800" }}>Admin Portal Login</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>GovConnect Platform Management Console.</p>
          </div>

          {errorMsg && (
            <div style={{ padding: "12px", borderRadius: "8px", background: "#fef2f2", color: "#991b1b", fontSize: "0.85rem", marginBottom: "16px", border: "1px solid #fecaca" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleOfficialLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@egram.gov.in"
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
                background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
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
              {loading ? "Authenticating..." : <><FaLock /> Authenticate Admin Portal</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f9f4", minHeight: "92vh", paddingBottom: "40px" }}>
      {/* Admin Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #081c15 0%, #1b4332 100%)", color: "white", padding: "28px 20px 20px 20px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#2d6a4f", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800" }}>
                  PORTAL 5 — ADMIN PORTAL
                </span>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                  GovConnect Oversight
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "800", color: "#e0ffe0" }}>
                Government Administrator Command Console
              </h1>
              <p style={{ margin: 0, color: "#a8e6a3", fontSize: "0.95rem" }}>
                System-wide monitoring, immutable audit logs, role-based access control, and API exception handling.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/govconnect" style={{ background: "#0284c7", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaNetworkWired /> GovConnect Platform
              </Link>
              <button
                onClick={handleOfficialLogout}
                style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}
              >
                Sign Out Admin Session
              </button>
            </div>
          </div>

          {/* 📊 Exact Requested Dashboard Header Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            
            {/* Connected Departments Card */}
            <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", padding: "16px" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#a8e6a3", textTransform: "uppercase" }}>Connected Departments: 3</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px", fontSize: "0.9rem", fontWeight: "700" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Municipality</span> <span>🟢</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Revenue</span> <span>🟢</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Health</span> <span>🟢</span></div>
              </div>
            </div>

            {/* Applications Card */}
            <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#a8e6a3", textTransform: "uppercase" }}>Applications Processed</div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#ffffff", marginTop: "4px" }}>1,245</div>
              <small style={{ color: "#d8f3dc" }}>Cross-Portal Total Submissions</small>
            </div>

            {/* Successful APIs Card */}
            <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#a8e6a3", textTransform: "uppercase" }}>Successful APIs</div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#4ade80", marginTop: "4px" }}>98.5%</div>
              <small style={{ color: "#d8f3dc" }}>HTTP 200 OK Response Rate</small>
            </div>

            {/* Failed APIs Card */}
            <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#fca5a5", textTransform: "uppercase" }}>Failed APIs</div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#f87171", marginTop: "4px" }}>1.5%</div>
              <small style={{ color: "#fca5a5" }}>Handled Graceful Exceptions</small>
            </div>

          </div>

          {/* 8 Required Admin Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {[
              { id: "applications", label: "Applications", icon: <FaCheckCircle /> },
              { id: "departments", label: "Departments", icon: <FaBuilding /> },
              { id: "api_health", label: "API Health", icon: <FaServer /> },
              { id: "failed_tx", label: "Failed Transactions", icon: <FaExclamationTriangle /> },
              { id: "audit_logs", label: "Audit Logs", icon: <FaHistory /> },
              { id: "user_activity", label: "User Activity", icon: <FaUsers /> },
              { id: "workflow_status", label: "Workflow Status", icon: <FaProjectDiagram /> },
              { id: "consent_records", label: "Consent Records", icon: <FaShieldAlt /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: activeTab === tab.id ? "#ffffff" : "rgba(255, 255, 255, 0.15)",
                  color: activeTab === tab.id ? "#1b4332" : "#e0ffe0",
                  fontWeight: "800",
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
        {activeTab === "applications" && <ApprovalsHub />}
        {activeTab === "departments" && <AdminDepartmentsView />}
        {activeTab === "api_health" && <AdminApiHealth />}
        {activeTab === "failed_tx" && <AdminFailedTransactions />}
        {activeTab === "audit_logs" && <AuditLogsViewer />}
        {activeTab === "user_activity" && <AdminUserActivity />}
        {activeTab === "workflow_status" && <WorkflowOrchestration />}
        {activeTab === "consent_records" && <AdminConsentRecords />}
      </div>
    </div>
  );
}
