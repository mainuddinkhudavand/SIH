import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import "./styles/HomePage.css";
import { FaUser, FaNetworkWired, FaBuilding, FaLandmark, FaHeartbeat, FaSun, FaUserShield, FaArrowRight, FaCheckCircle, FaLayerGroup } from "react-icons/fa";

const buttonPillarStyle = (bg, border) => ({
  background: bg,
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "800",
  textDecoration: "none",
  fontSize: "0.9rem",
  border: `1px solid ${border}`,
  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease-in-out"
});

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          color: '#fff',
          textAlign: 'center',
          padding: '4rem 2rem',
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span style={{ background: "#38bdf8", color: "#0f172a", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block", marginBottom: "16px" }}>
            GOVCONNECT E-GOVERNANCE ECOSYSTEM
          </span>
          <h1 style={{ color: "#ffffff", fontSize: "2.8rem", fontWeight: "900", margin: "0 0 12px 0", letterSpacing: "-1px" }}>
            GovConnect 3-Layer Interoperability Platform
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.15rem", maxWidth: "850px", margin: "0 auto 32px auto", lineHeight: "1.6" }}>
            Clean architecture divided into 3 distinct operational layers: Citizen Layer, GovConnect Interoperability Core, and Departmental Portals.
          </p>

          {/* Quick Entry Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", alignItems: "center" }}>
            <Link to="/citizen" style={buttonPillarStyle("linear-gradient(135deg, #15803d, #166534)", "#4ade80")}>
              <FaUser /> 🟢 Citizen Portal
            </Link>
            <Link to="/govconnect" style={buttonPillarStyle("linear-gradient(135deg, #0284c7, #0369a1)", "#38bdf8")}>
              <FaNetworkWired /> 🟡 GovConnect Middleware
            </Link>
            <Link to="/portals/municipal" style={buttonPillarStyle("linear-gradient(135deg, #0c4a6e, #0369a1)", "#7dd3fc")}>
              <FaBuilding /> 🔵 Municipal Portal
            </Link>
            <Link to="/portals/revenue" style={buttonPillarStyle("linear-gradient(135deg, #b45309, #78350f)", "#fbbf24")}>
              <FaLandmark /> 🔵 Revenue Portal
            </Link>
            <Link to="/portals/health" style={buttonPillarStyle("linear-gradient(135deg, #047857, #064e3b)", "#34d399")}>
              <FaHeartbeat /> 🔵 Welfare Portal
            </Link>
            <Link to="/portals/energy" style={buttonPillarStyle("linear-gradient(135deg, #d97706, #78350f)", "#fbbf24")}>
              <FaSun /> 🔵 Energy Portal
            </Link>
            <Link to="/official" style={buttonPillarStyle("linear-gradient(135deg, #334155, #1e293b)", "#94a3b8")}>
              <FaUserShield /> Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 3-LAYER ARCHITECTURE SHOWCASE SECTION */}
      <section style={{ padding: "3.5rem 2rem", maxWidth: 1250, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
            ARCHITECTURE BREAKDOWN
          </span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", margin: "8px 0 8px 0" }}>
            The 3 System Architecture Layers
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "700px", margin: "0 auto" }}>
            Clean separation of concerns ensuring citizens interact with a single catalog, departments remain decoupled, and GovConnect manages interop logic.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 🟢 Layer 1 — Citizen Layer */}
          <div style={{ background: "#ffffff", border: "2px solid #22c55e", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>🟢</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#14532d" }}>Layer 1 — Citizen Layer</h3>
                  <span style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: "700" }}>Citizen Portal Main User Interface</span>
                </div>
              </div>
              <Link to="/citizen" style={{ background: "#15803d", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem" }}>
                Launch Citizen Portal →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
              {["Services Catalog", "Applications Module", "Certificates Vault", "Grievances Portal", "Unified Tracker", "Notifications Feed", "User Profile", "Consent Console"].map((item, idx) => (
                <div key={idx} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "800", textAlign: "center" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 🟡 Layer 2 — GovConnect Middleware */}
          <div style={{ background: "#ffffff", border: "2px solid #eab308", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>🟡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#713f12" }}>Layer 2 — GovConnect Middleware</h3>
                  <span style={{ fontSize: "0.85rem", color: "#a16207", fontWeight: "700" }}>Hub-and-Spoke Interoperability Core</span>
                </div>
              </div>
              <Link to="/govconnect" style={{ background: "#a16207", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem" }}>
                Launch GovConnect Core →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
              {["API Gateway", "SSO (Single Sign-On)", "Consent Manager", "Data Transformation Engine", "Workflow Engine", "Event Bus", "Notifications Engine", "Audit Logs Ledger"].map((item, idx) => (
                <div key={idx} style={{ background: "#fefce8", border: "1px solid #fef08a", color: "#854d0e", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "800", textAlign: "center" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 🔵 Layer 3 — Department Layer */}
          <div style={{ background: "#ffffff", border: "2px solid #0284c7", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>🔵</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#0c4a6e" }}>Layer 3 — Department Layer</h3>
                  <span style={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: "700" }}>Decoupled Departmental Service Providers</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <Link to="/portals/municipal" style={{ textDecoration: "none", background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", padding: "16px", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>🏢 Municipality Portal</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Trade License, Water Connection, Vending Permit</p>
              </Link>

              <Link to="/portals/revenue" style={{ textDecoration: "none", background: "#fffbeb", border: "1px solid #fef3c7", color: "#b45309", padding: "16px", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>🏛️ Revenue Portal</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Property Ownership Transfer & Title Records</p>
              </Link>

              <Link to="/portals/health" style={{ textDecoration: "none", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "16px", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>🏥 Welfare / Health Portal</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Senior/Widow Pension & Vital Certificates</p>
              </Link>

              <Link to="/portals/energy" style={{ textDecoration: "none", background: "#fff7ed", border: "1px solid #ffedd5", color: "#c2410c", padding: "16px", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>☀️ Renewable Energy Portal</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Rooftop Solar Subsidy & Grants</p>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "30px 20px", textAlign: "center", fontSize: "0.9rem", borderTop: "1px solid #1e293b" }}>
        <p style={{ margin: "0 0 10px 0" }}>© 2026 GovConnect Interoperability Platform. All rights reserved.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link to="/citizen" style={{ color: "#38bdf8", textDecoration: "none" }}>Citizen Portal</Link>
          <Link to="/govconnect" style={{ color: "#38bdf8", textDecoration: "none" }}>GovConnect Core</Link>
          <Link to="/official" style={{ color: "#38bdf8", textDecoration: "none" }}>Admin Portal</Link>
        </div>
      </footer>
    </div>
  );
}
export default HomePage;