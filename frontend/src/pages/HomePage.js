import React from 'react';
import { Link } from 'react-router-dom';
import "./styles/HomePage.css";
import { FaUser, FaBuilding, FaLandmark, FaFileInvoiceDollar, FaHome, FaArrowRight } from "react-icons/fa";

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
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          background: "linear-gradient(135deg, #081c15 0%, #1b4332 50%, #081c15 100%)",
          color: '#fff',
          textAlign: 'center',
          padding: '4.5rem 2rem'
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span style={{ background: "#52b788", color: "#081c15", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block", marginBottom: "16px" }}>
            FEDERATED 4-OFFICE E-GOVERNANCE ECOSYSTEM
          </span>
          <h1 style={{ color: "#ffffff", fontSize: "2.8rem", fontWeight: "900", margin: "0 0 12px 0", letterSpacing: "-1px" }}>
            E-Gram Panchayat Governance Platform
          </h1>
          <p style={{ color: "#d8f3dc", fontSize: "1.15rem", maxWidth: "850px", margin: "0 auto 32px auto", lineHeight: "1.6" }}>
            Unified citizen portal with dynamic forms, automated multi-office sequential routing across Municipality, Tehsildar, Revenue, and Talati, live dues clearance, and digitally signed certificate issuance.
          </p>

          {/* Quick Entry Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", alignItems: "center" }}>
            <Link to="/citizen" style={buttonPillarStyle("linear-gradient(135deg, #15803d, #166534)", "#4ade80")}>
              <FaUser /> 🟢 Citizen Services
            </Link>
            <Link to="/officer/municipality" style={buttonPillarStyle("linear-gradient(135deg, #0c4a6e, #0284c7)", "#38bdf8")}>
              <FaBuilding /> 🏢 Municipality Office
            </Link>
            <Link to="/officer/tehsildar" style={buttonPillarStyle("linear-gradient(135deg, #14532d, #166534)", "#4ade80")}>
              <FaLandmark /> 📜 Tehsildar Office
            </Link>
            <Link to="/officer/revenue" style={buttonPillarStyle("linear-gradient(135deg, #78350f, #b45309)", "#fbbf24")}>
              <FaFileInvoiceDollar /> 🌾 Revenue Office
            </Link>
            <Link to="/officer/talati" style={buttonPillarStyle("linear-gradient(135deg, #581c87, #7c3aed)", "#c084fc")}>
              <FaHome /> 🏡 Talati Office
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Separate Standalone Office Cards Section */}
      <section style={{ padding: "3.5rem 2rem", maxWidth: 1250, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
            OFFICE DIGITIZATION PLANS (SECTIONS 2–5)
          </span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", margin: "8px 0 8px 0" }}>
            4 Separate Government Office Portals
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "750px", margin: "0 auto" }}>
            Click on any office below to enter its standalone digital workspace, review application queues, check cross-office flags, and digitally sign approvals.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          
          {/* Municipality Office */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "2px solid #0284c7", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ background: "#e0f2fe", color: "#0284c7", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "14px" }}>
                <FaBuilding />
              </div>
              <h3 style={{ margin: "0 0 6px 0", color: "#0c4a6e", fontSize: "1.25rem", fontWeight: "800" }}>
                1. Municipality Office Portal
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
                Birth &amp; Death registration, Marriage certificates, Property Tax, Water connections, Streetlights, Trade licenses, Building plans.
              </p>
            </div>
            <Link to="/officer/municipality" style={{ textDecoration: "none", background: "#0284c7", color: "white", padding: "10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Open Municipality Portal <FaArrowRight />
            </Link>
          </div>

          {/* Tehsildar Office */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "2px solid #166534", boxShadow: "0 4px 12px rgba(22, 101, 52, 0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ background: "#dcfce7", color: "#166534", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "14px" }}>
                <FaLandmark />
              </div>
              <h3 style={{ margin: "0 0 6px 0", color: "#14532d", fontSize: "1.25rem", fontWeight: "800" }}>
                2. Tehsildar Office Portal
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
                Income, Caste, Domicile, Solvency, Agriculturist, Legal Heir certificates. Discrepancy feedback loops.
              </p>
            </div>
            <Link to="/officer/tehsildar" style={{ textDecoration: "none", background: "#166534", color: "white", padding: "10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Open Tehsildar Portal <FaArrowRight />
            </Link>
          </div>

          {/* Revenue Office */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "2px solid #b45309", boxShadow: "0 4px 12px rgba(180, 83, 9, 0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ background: "#fef3c7", color: "#b45309", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "14px" }}>
                <FaFileInvoiceDollar />
              </div>
              <h3 style={{ margin: "0 0 6px 0", color: "#78350f", fontSize: "1.25rem", fontWeight: "800" }}>
                3. Revenue Office Portal
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
                Land Revenue collection, Property mutation, Encumbrance certificates, Revenue court disputes, shared dues ledger.
              </p>
            </div>
            <Link to="/officer/revenue" style={{ textDecoration: "none", background: "#b45309", color: "white", padding: "10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Open Revenue Portal <FaArrowRight />
            </Link>
          </div>

          {/* Talati Office */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "2px solid #7c3aed", boxShadow: "0 4px 12px rgba(124, 58, 237, 0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ background: "#f3e8ff", color: "#7c3aed", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "14px" }}>
                <FaHome />
              </div>
              <h3 style={{ margin: "0 0 6px 0", color: "#581c87", fontSize: "1.25rem", fontWeight: "800" }}>
                4. Talati Office Portal
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
                7/12 &amp; 8-A extracts, village land registers, crop damage field verification, village income/residence data confirmation.
              </p>
            </div>
            <Link to="/officer/talati" style={{ textDecoration: "none", background: "#7c3aed", color: "white", padding: "10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Open Talati Portal <FaArrowRight />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#081c15", color: "#d8f3dc", padding: "30px 20px", textAlign: "center", fontSize: "0.9rem", borderTop: "1px solid #1b4332" }}>
        <p style={{ margin: "0 0 10px 0" }}>© 2026 E-Gram Panchayat Federated Governance Platform. All rights reserved.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/citizen" style={{ color: "#52b788", textDecoration: "none" }}>Citizen Portal</Link>
          <Link to="/officer/municipality" style={{ color: "#38bdf8", textDecoration: "none" }}>Municipality Office</Link>
          <Link to="/officer/tehsildar" style={{ color: "#4ade80", textDecoration: "none" }}>Tehsildar Office</Link>
          <Link to="/officer/revenue" style={{ color: "#fbbf24", textDecoration: "none" }}>Revenue Office</Link>
          <Link to="/officer/talati" style={{ color: "#c084fc", textDecoration: "none" }}>Talati Office</Link>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;