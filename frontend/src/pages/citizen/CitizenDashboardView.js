import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { FaFileAlt, FaCertificate, FaClock, FaCheckCircle, FaTint, FaHome, FaHeartbeat, FaExclamationCircle, FaShieldAlt, FaArrowRight, FaBullhorn } from "react-icons/fa";

export default function CitizenDashboardView({ onNavigateTab }) {
  const [summary, setSummary] = useState({
    totalApps: 0,
    approvedApps: 0,
    pendingApps: 0,
    totalCerts: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingConsentApps, setPendingConsentApps] = useState([]);
  const [grantingConsent, setGrantingConsent] = useState(false);
  const [consentMsg, setConsentMsg] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/citizen/dashboard");
      const apps = res.data?.applications || [];
      const certs = res.data?.certificates || [];

      setRecentApps(apps.slice(0, 4));
      setPendingConsentApps(apps.filter(a => a.status === "Consent Approval Pending"));

      setSummary({
        totalApps: apps.length,
        approvedApps: apps.filter(a => a.status === "Approved").length,
        pendingApps: apps.filter(a => a.status !== "Approved" && a.status !== "Rejected").length,
        totalCerts: certs.length
      });
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async () => {
    setGrantingConsent(true);
    setConsentMsg(null);
    try {
      await API.post("/user/consent", { status: "Granted" });
      setConsentMsg("✅ Inter-office data sharing consent GRANTED! Application workflow unpaused and advanced to next office.");
      fetchDashboardData();
    } catch (err) {
      setConsentMsg("⚠️ Failed to grant consent. Please try again.");
    } finally {
      setGrantingConsent(false);
    }
  };

  return (
    <div>
      {/* 📊 Summary Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>My Applications</span>
            <div style={{ background: "#e0f2fe", color: "#0284c7", padding: "8px", borderRadius: "10px" }}><FaFileAlt /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#0f172a", marginTop: "8px" }}>{summary.totalApps}</div>
          <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: "700" }}>Total Requests Submitted</span>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Pending Processing</span>
            <div style={{ background: "#fef3c7", color: "#d97706", padding: "8px", borderRadius: "10px" }}><FaClock /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#0f172a", marginTop: "8px" }}>{summary.pendingApps}</div>
          <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: "700" }}>Under Review</span>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Approved Services</span>
            <div style={{ background: "#dcfce7", color: "#16a34a", padding: "8px", borderRadius: "10px" }}><FaCheckCircle /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#0f172a", marginTop: "8px" }}>{summary.approvedApps}</div>
          <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700" }}>Successfully Completed</span>
        </div>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Digital Certificates</span>
            <div style={{ background: "#f3e8ff", color: "#9333ea", padding: "8px", borderRadius: "10px" }}><FaCertificate /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#0f172a", marginTop: "8px" }}>{summary.totalCerts}</div>
          <span style={{ fontSize: "0.75rem", color: "#9333ea", fontWeight: "700" }}>Digital Seals Issued</span>
        </div>
      </div>

      {/* 🔒 Gate 2 Pending Inter-Office Data Handoff Consent Safeguard Panel */}
      {pendingConsentApps.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", padding: "24px", borderRadius: "16px", border: "2px solid #fdba74", marginBottom: "28px", boxShadow: "0 6px 18px rgba(234, 88, 12, 0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaShieldAlt style={{ fontSize: "1.8rem", color: "#ea580c" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "900", color: "#9a3412" }}>
                  🔒 GATE 2 PRIVACY SAFEGUARD: INTER-OFFICE DATA HANDOFF CONSENT REQUIRED
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.88rem", color: "#c2410c" }}>
                  {pendingConsentApps.length} application(s) paused. An office is requesting access to your land/residency records for verification.
                </p>
              </div>
            </div>

            <button
              onClick={handleGrantConsent}
              disabled={grantingConsent}
              style={{ background: "#ea580c", color: "white", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "900", fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)" }}
            >
              {grantingConsent ? "Granting Consent..." : "🔓 Grant Consent & Unpause Applications"}
            </button>
          </div>

          {consentMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: "0.85rem", fontWeight: "800", marginBottom: "12px" }}>
              {consentMsg}
            </div>
          )}

          <div style={{ display: "grid", gap: "10px" }}>
            {pendingConsentApps.map(app => (
              <div key={app._id || app.applicationId} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "10px", border: "1px solid #fed7aa", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ fontWeight: "800", color: "#ea580c", marginRight: "8px" }}>{app.applicationId}</span>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>{app.title}</span>
                  <span style={{ color: "#7c2d12", fontSize: "0.78rem", marginLeft: "10px" }}>• Paused at stage: {app.currentOffice} Handoff</span>
                </div>
                <span style={{ background: "#ffedd5", color: "#9a3412", padding: "3px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800" }}>
                  Consent Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🚀 Available Services Quick Launch (5 Categories) */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "28px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
              Unified Civic Services
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Select a service category to start an application</span>
          </div>

          <button
            onClick={() => onNavigateTab("available_services")}
            style={{ background: "#f1f5f9", border: "none", color: "#0f172a", padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            View All Services <FaArrowRight />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          {[
            { title: "Water Connection", icon: <FaTint size={22} color="#0284c7" />, bg: "#e0f2fe" },
            { title: "Property Service", icon: <FaHome size={22} color="#d97706" />, bg: "#fef3c7" },
            { title: "Certificate Service", icon: <FaCertificate size={22} color="#9333ea" />, bg: "#f3e8ff" }
          ].map((s, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateTab("available_services")}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ background: s.bg, padding: "10px", borderRadius: "10px", display: "inline-block", marginBottom: "10px" }}>
                {s.icon}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>{s.title}</div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Instant Online Filing</span>
            </button>
          ))}
        </div>
      </div>

      {/* 📄 Recent Applications Table */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
            Recent Applications & Tracking
          </h3>

          <button
            onClick={() => onNavigateTab("my_applications")}
            style={{ background: "none", border: "none", color: "#0284c7", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
          >
            My Applications →
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Loading recent applications...</div>
        ) : recentApps.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
            No applications submitted yet. Select a service above to file your first application!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>App ID</th>
                  <th style={{ padding: "10px" }}>Service Name</th>
                  <th style={{ padding: "10px" }}>Date Submitted</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Tracking</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: "800", color: "#0284c7" }}>{app.applicationId}</td>
                    <td style={{ padding: "12px", fontWeight: "700", color: "#0f172a" }}>{app.serviceType}</td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: app.status === "Approved" ? "#dcfce7" : app.status === "Rejected" ? "#fee2e2" : "#fef3c7", color: app.status === "Approved" ? "#166534" : app.status === "Rejected" ? "#991b1b" : "#854d0e" }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        onClick={() => onNavigateTab("tracker")}
                        style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                      >
                        Track Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
